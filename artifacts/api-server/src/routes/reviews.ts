import { Router } from "express";
import { db, reviewsTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth.js";

const router = Router();

router.get("/:productId", async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);
    const reviews = await db
      .select({
        id: reviewsTable.id,
        userId: reviewsTable.userId,
        productId: reviewsTable.productId,
        rating: reviewsTable.rating,
        comment: reviewsTable.comment,
        createdAt: reviewsTable.createdAt,
        userName: usersTable.name,
      })
      .from(reviewsTable)
      .leftJoin(usersTable, eq(reviewsTable.userId, usersTable.id))
      .where(eq(reviewsTable.productId, productId));
    res.json(reviews.map(r => ({ ...r, userName: r.userName || "Client" })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:productId", requireAuth, async (req: AuthRequest, res) => {
  try {
    const productId = parseInt(req.params.productId);
    const { rating, comment } = req.body;
    const [review] = await db.insert(reviewsTable).values({
      userId: req.userId!,
      productId,
      rating,
      comment,
    }).returning();

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);
    res.status(201).json({ ...review, userName: user?.name || "Client" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
