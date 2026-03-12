import { Router } from "express";
import { db, usersTable, ordersTable, orderItemsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth.js";

const router = Router();

router.patch("/profile", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { name, phone, address, city } = req.body;
    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (address !== undefined) updates.address = address;
    if (city !== undefined) updates.city = city;
    const [user] = await db.update(usersTable).set(updates).where(eq(usersTable.id, req.userId!)).returning();
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, address: user.address, city: user.city, createdAt: user.createdAt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/orders", requireAuth, async (req: AuthRequest, res) => {
  try {
    const orders = await db.select().from(ordersTable).where(eq(ordersTable.userId, req.userId!)).orderBy(desc(ordersTable.createdAt));
    const ordersWithItems = await Promise.all(orders.map(async (o) => {
      const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, o.id));
      return { ...o, total: parseFloat(o.total), items: items.map(i => ({ ...i, price: parseFloat(i.price) })) };
    }));
    res.json(ordersWithItems);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
