import { Router } from "express";
import { db, newsletterTable } from "@workspace/db";

const router = Router();

router.post("/subscribe", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: "Email is required" });
      return;
    }
    await db.insert(newsletterTable).values({ email }).onConflictDoNothing();
    res.json({ success: true, message: "Successfully subscribed!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
