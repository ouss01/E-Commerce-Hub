import { Router } from "express";
import { createHash, randomBytes } from "crypto";
import { db, usersTable } from "@workspace/db";
import { eq, and, gt } from "drizzle-orm";
import { signToken } from "../lib/jwt.js";
import { requireAuth, type AuthRequest } from "../middlewares/auth.js";
import { sendVerificationEmail, sendPasswordResetEmail } from "../lib/email.js";
import {
  getGoogleAuthUrl, exchangeGoogleCode, getGoogleUserInfo,
  getMicrosoftAuthUrl, exchangeMicrosoftCode, getMicrosoftUserInfo,
  getAppleAuthUrl,
} from "../lib/oauth.js";

const router = Router();
const APP_URL = process.env.APP_URL || "http://localhost:80";

function hashPassword(password: string): string {
  return createHash("sha256").update(password + "verdure-salt").digest("hex");
}

function formatUser(user: typeof usersTable.$inferSelect) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    address: user.address,
    city: user.city,
    emailVerified: user.emailVerified,
    avatarUrl: user.avatarUrl,
    oauthProvider: user.oauthProvider,
    createdAt: user.createdAt,
  };
}

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ error: "Name, email and password are required" });
      return;
    }
    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (existing.length > 0) {
      res.status(400).json({ error: "Email already registered" });
      return;
    }

    const verifyToken = randomBytes(32).toString("hex");
    const verifyExpiry = new Date(Date.now() + 24 * 3600 * 1000);

    const [user] = await db.insert(usersTable).values({
      name, email,
      password: hashPassword(password),
      role: "customer",
      emailVerified: false,
      emailVerifyToken: verifyToken,
      emailVerifyExpiry: verifyExpiry,
    }).returning();

    try {
      await sendVerificationEmail(email, name, verifyToken);
    } catch (emailErr) {
      console.error("Email send error:", emailErr);
    }

    const token = signToken({ userId: user.id, role: user.role });
    res.status(201).json({ token, user: formatUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (!user || user.password !== hashPassword(password)) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }
    const token = signToken({ userId: user.id, role: user.role });
    res.json({ token, user: formatUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/me", requireAuth, async (req: AuthRequest, res) => {
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);
    if (!user) { res.status(404).json({ error: "User not found" }); return; }
    res.json(formatUser(user));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) { res.status(400).json({ error: "Email required" }); return; }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    res.json({ success: true, message: "If this email exists, a reset link has been sent." });
    if (!user) return;

    const resetToken = randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 3600 * 1000);
    await db.update(usersTable)
      .set({ resetToken, resetTokenExpiry: expiry })
      .where(eq(usersTable.id, user.id));

    try {
      await sendPasswordResetEmail(email, user.name, resetToken);
    } catch (emailErr) {
      console.error("Email send error:", emailErr);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) { res.status(400).json({ error: "Token and password required" }); return; }

    const now = new Date();
    const [user] = await db.select().from(usersTable)
      .where(and(eq(usersTable.resetToken, token), gt(usersTable.resetTokenExpiry!, now)))
      .limit(1);

    if (!user) { res.status(400).json({ error: "Invalid or expired reset token" }); return; }

    await db.update(usersTable)
      .set({ password: hashPassword(password), resetToken: null, resetTokenExpiry: null })
      .where(eq(usersTable.id, user.id));

    res.json({ success: true, message: "Password reset successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/verify-email", async (req, res) => {
  try {
    const { token } = req.query as { token: string };
    if (!token) { res.redirect(`${APP_URL}/login?error=invalid_token`); return; }

    const now = new Date();
    const [user] = await db.select().from(usersTable)
      .where(and(eq(usersTable.emailVerifyToken, token), gt(usersTable.emailVerifyExpiry!, now)))
      .limit(1);

    if (!user) { res.redirect(`${APP_URL}/login?error=invalid_token`); return; }

    await db.update(usersTable)
      .set({ emailVerified: true, emailVerifyToken: null, emailVerifyExpiry: null })
      .where(eq(usersTable.id, user.id));

    res.redirect(`${APP_URL}/account?verified=1`);
  } catch (err) {
    console.error(err);
    res.redirect(`${APP_URL}/login?error=server_error`);
  }
});

router.post("/resend-verification", requireAuth, async (req: AuthRequest, res) => {
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);
    if (!user || user.emailVerified) {
      res.json({ success: true, message: "Already verified or not found" });
      return;
    }
    const verifyToken = randomBytes(32).toString("hex");
    const verifyExpiry = new Date(Date.now() + 24 * 3600 * 1000);
    await db.update(usersTable)
      .set({ emailVerifyToken: verifyToken, emailVerifyExpiry: verifyExpiry })
      .where(eq(usersTable.id, user.id));
    try {
      await sendVerificationEmail(user.email, user.name, verifyToken);
    } catch { /* silent */ }
    res.json({ success: true, message: "Verification email sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

async function handleOAuthUser(provider: string, oauthId: string, email: string, name: string, avatarUrl: string | null, res: any) {
  let [user] = await db.select().from(usersTable)
    .where(and(eq(usersTable.oauthProvider, provider), eq(usersTable.oauthId, oauthId)))
    .limit(1);

  if (!user) {
    const [byEmail] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (byEmail) {
      user = (await db.update(usersTable)
        .set({ oauthProvider: provider, oauthId, avatarUrl, emailVerified: true })
        .where(eq(usersTable.id, byEmail.id)).returning())[0];
    } else {
      const [created] = await db.insert(usersTable).values({
        name, email, password: "",
        role: "customer", emailVerified: true,
        oauthProvider: provider, oauthId, avatarUrl: avatarUrl || null,
      }).returning();
      user = created;
    }
  }

  const token = signToken({ userId: user.id, role: user.role });
  res.redirect(`${APP_URL}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(formatUser(user)))}`);
}

router.get("/google", (_req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    res.status(503).send("Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.");
    return;
  }
  res.redirect(getGoogleAuthUrl());
});

router.get("/google/callback", async (req, res) => {
  try {
    const { code, error } = req.query as { code?: string; error?: string };
    if (error || !code) { res.redirect(`${APP_URL}/login?error=oauth_cancelled`); return; }

    const tokens = await exchangeGoogleCode(code);
    if (!tokens.access_token) { res.redirect(`${APP_URL}/login?error=oauth_failed`); return; }

    const userInfo = await getGoogleUserInfo(tokens.access_token);
    await handleOAuthUser("google", userInfo.sub, userInfo.email, userInfo.name, userInfo.picture, res);
  } catch (err) {
    console.error(err);
    res.redirect(`${APP_URL}/login?error=oauth_failed`);
  }
});

router.get("/microsoft", (_req, res) => {
  if (!process.env.MICROSOFT_CLIENT_ID) {
    res.status(503).send("Microsoft OAuth not configured. Set MICROSOFT_CLIENT_ID and MICROSOFT_CLIENT_SECRET.");
    return;
  }
  res.redirect(getMicrosoftAuthUrl());
});

router.get("/microsoft/callback", async (req, res) => {
  try {
    const { code, error } = req.query as { code?: string; error?: string };
    if (error || !code) { res.redirect(`${APP_URL}/login?error=oauth_cancelled`); return; }

    const tokens = await exchangeMicrosoftCode(code);
    if (!tokens.access_token) { res.redirect(`${APP_URL}/login?error=oauth_failed`); return; }

    const userInfo = await getMicrosoftUserInfo(tokens.access_token);
    const email = userInfo.mail || userInfo.userPrincipalName;
    await handleOAuthUser("microsoft", userInfo.id, email, userInfo.displayName, null, res);
  } catch (err) {
    console.error(err);
    res.redirect(`${APP_URL}/login?error=oauth_failed`);
  }
});

router.get("/apple", (_req, res) => {
  if (!process.env.APPLE_CLIENT_ID) {
    res.status(503).send("Apple OAuth not configured. Set APPLE_CLIENT_ID.");
    return;
  }
  res.redirect(getAppleAuthUrl());
});

router.post("/apple/callback", async (req, res) => {
  try {
    const { code, user: appleUser, error } = req.body as {
      code?: string; user?: string; error?: string;
    };
    if (error || !code) { res.redirect(`${APP_URL}/login?error=oauth_cancelled`); return; }

    let name = "Apple User";
    let email = "";
    if (appleUser) {
      try {
        const parsed = JSON.parse(appleUser);
        name = [parsed.name?.firstName, parsed.name?.lastName].filter(Boolean).join(" ") || name;
        email = parsed.email || "";
      } catch { /* ignore */ }
    }

    if (!email) { res.redirect(`${APP_URL}/login?error=oauth_no_email`); return; }
    const oauthId = `apple_${Buffer.from(email).toString("base64")}`;
    await handleOAuthUser("apple", oauthId, email, name, null, res);
  } catch (err) {
    console.error(err);
    res.redirect(`${APP_URL}/login?error=oauth_failed`);
  }
});

export default router;
