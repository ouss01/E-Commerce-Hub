import nodemailer from "nodemailer";

const APP_URL = process.env.APP_URL || "http://localhost:80";

function getTransporter() {
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return null;
}

async function sendMail(options: { to: string; subject: string; html: string }) {
  const transporter = getTransporter();
  if (!transporter) {
    console.log("[EMAIL] SMTP not configured. Would send:", options.subject, "to", options.to);
    return;
  }
  await transporter.sendMail({
    from: process.env.SMTP_FROM || "Verdure Plants <no-reply@verdure.tn>",
    ...options,
  });
}

export async function sendVerificationEmail(email: string, name: string, token: string) {
  const url = `${APP_URL}/verify-email?token=${token}`;
  await sendMail({
    to: email,
    subject: "Vérifiez votre email — Verdure",
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:32px;background:#f6fff8;border-radius:16px">
        <h1 style="color:#2F6F4E;font-size:28px;margin-bottom:8px">🌿 Verdure</h1>
        <h2 style="color:#1a1a1a">Bonjour ${name} !</h2>
        <p style="color:#555;font-size:16px">Merci de vous être inscrit. Veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous.</p>
        <a href="${url}" style="display:inline-block;margin:24px 0;padding:14px 32px;background:#2F6F4E;color:#fff;text-decoration:none;border-radius:12px;font-weight:bold;font-size:16px">
          Vérifier mon email
        </a>
        <p style="color:#888;font-size:13px">Ce lien expire dans 24 heures. Si vous n'avez pas créé de compte, ignorez cet email.</p>
        <hr style="border:none;border-top:1px solid #e0e0e0;margin:24px 0"/>
        <p style="color:#aaa;font-size:12px">Verdure — Khniss, Monastir 5011, Tunisie</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, name: string, token: string) {
  const url = `${APP_URL}/reset-password?token=${token}`;
  await sendMail({
    to: email,
    subject: "Réinitialisation de mot de passe — Verdure",
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:32px;background:#f6fff8;border-radius:16px">
        <h1 style="color:#2F6F4E;font-size:28px;margin-bottom:8px">🌿 Verdure</h1>
        <h2 style="color:#1a1a1a">Réinitialisation de mot de passe</h2>
        <p style="color:#555;font-size:16px">Bonjour ${name}, vous avez demandé une réinitialisation de votre mot de passe.</p>
        <a href="${url}" style="display:inline-block;margin:24px 0;padding:14px 32px;background:#2F6F4E;color:#fff;text-decoration:none;border-radius:12px;font-weight:bold;font-size:16px">
          Réinitialiser mon mot de passe
        </a>
        <p style="color:#888;font-size:13px">Ce lien expire dans 1 heure. Si vous n'avez pas fait cette demande, ignorez cet email.</p>
        <hr style="border:none;border-top:1px solid #e0e0e0;margin:24px 0"/>
        <p style="color:#aaa;font-size:12px">Verdure — Khniss, Monastir 5011, Tunisie</p>
      </div>
    `,
  });
}

export async function sendOrderConfirmationEmail(
  email: string,
  name: string,
  orderId: number,
  total: number,
  paymentMethod: string,
) {
  const isCOD = paymentMethod === "cash_on_delivery";
  await sendMail({
    to: email,
    subject: `Confirmation commande #${orderId} — Verdure`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:32px;background:#f6fff8;border-radius:16px">
        <h1 style="color:#2F6F4E;font-size:28px;margin-bottom:8px">🌿 Verdure</h1>
        <h2 style="color:#1a1a1a">Commande confirmée — #${orderId}</h2>
        <p style="color:#555;font-size:16px">Bonjour ${name}, votre commande a bien été reçue !</p>
        <p style="font-size:18px;font-weight:bold;color:#2F6F4E">Total: ${total.toFixed(2)} TND</p>
        ${isCOD ? `<div style="background:#fff3cd;border:1px solid #ffc107;border-radius:8px;padding:16px;margin:16px 0">
          <strong>📞 Paiement à la livraison</strong><br/>
          Notre équipe vous contactera dans les 24h pour confirmer votre commande et le créneau de livraison.
        </div>` : ""}
        <p style="color:#aaa;font-size:12px;margin-top:24px">Verdure — Khniss, Monastir 5011, Tunisie</p>
      </div>
    `,
  });
}
