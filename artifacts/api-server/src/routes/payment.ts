import { Router } from "express";
import { optionalAuth, type AuthRequest } from "../middlewares/auth.js";

const router = Router();

const FLOUCI_API = "https://developers.flouci.com/api/generate_payment";

router.post("/flouci/create", optionalAuth, async (req: AuthRequest, res) => {
  try {
    const { amount, orderId } = req.body;
    const APP_URL = process.env.APP_URL || "http://localhost:80";

    if (!process.env.FLOUCI_APP_TOKEN || !process.env.FLOUCI_APP_SECRET) {
      res.status(503).json({ error: "Flouci payment not configured" });
      return;
    }

    const payload = {
      app_token: process.env.FLOUCI_APP_TOKEN,
      app_secret: process.env.FLOUCI_APP_SECRET,
      amount: Math.round(amount * 1000),
      accept_card: "true",
      session_timeout_secs: 1200,
      success_link: `${APP_URL}/checkout/success?orderId=${orderId}`,
      fail_link: `${APP_URL}/checkout/failed?orderId=${orderId}`,
      developer_tracking_id: `order_${orderId}`,
    };

    const flouciRes = await fetch(FLOUCI_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await flouciRes.json() as { result?: { link?: string; payment_id?: string }; success?: boolean };

    if (!flouciRes.ok || !data.result?.link) {
      console.error("Flouci error:", data);
      res.status(502).json({ error: "Flouci payment failed" });
      return;
    }

    res.json({ paymentUrl: data.result.link, paymentId: data.result.payment_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/flouci/verify/:paymentId", async (req, res) => {
  try {
    const { paymentId } = req.params;
    if (!process.env.FLOUCI_APP_TOKEN || !process.env.FLOUCI_APP_SECRET) {
      res.status(503).json({ error: "Flouci not configured" });
      return;
    }
    const verifyRes = await fetch(`https://developers.flouci.com/api/verify_payment/${paymentId}`, {
      headers: {
        "app_token": process.env.FLOUCI_APP_TOKEN,
        "app_secret": process.env.FLOUCI_APP_SECRET,
      },
    });
    const data = await verifyRes.json() as { result?: { status?: string } };
    res.json({ success: data.result?.status === "SUCCESS", status: data.result?.status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
