import { Router } from "express";
import { db, ordersTable, orderItemsTable, productsTable } from "@workspace/db";
import { eq, sql, desc, and } from "drizzle-orm";
import { requireAuth, requireAdmin, optionalAuth, type AuthRequest } from "../middlewares/auth.js";

const router = Router();

async function getOrderWithItems(orderId: number) {
  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId)).limit(1);
  if (!order) return null;
  const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, orderId));
  return {
    ...order,
    total: parseFloat(order.total),
    items: items.map(i => ({ ...i, price: parseFloat(i.price) })),
  };
}

router.post("/", optionalAuth, async (req: AuthRequest, res) => {
  try {
    const { customerName, customerEmail, customerPhone, shippingAddress, shippingCity, paymentMethod, items } = req.body;
    if (!items || items.length === 0) {
      res.status(400).json({ error: "Order must have at least one item" });
      return;
    }

    let total = 0;
    const enrichedItems = [];
    for (const item of items) {
      const [product] = await db.select().from(productsTable).where(eq(productsTable.id, item.productId)).limit(1);
      if (!product) {
        res.status(400).json({ error: `Product ${item.productId} not found` });
        return;
      }
      const price = parseFloat(product.price);
      total += price * item.quantity;
      enrichedItems.push({ product, quantity: item.quantity, price });
    }

    const [order] = await db.insert(ordersTable).values({
      userId: req.userId || null,
      status: "pending",
      total: total.toString(),
      customerName, customerEmail, customerPhone,
      shippingAddress, shippingCity,
      paymentMethod: paymentMethod || "cash_on_delivery",
    }).returning();

    for (const { product, quantity, price } of enrichedItems) {
      await db.insert(orderItemsTable).values({
        orderId: order.id,
        productId: product.id,
        productName: product.nameFr || product.name,
        productImage: product.images?.[0] || null,
        quantity,
        price: price.toString(),
      });
      await db.update(productsTable)
        .set({ stock: product.stock - quantity })
        .where(eq(productsTable.id, product.id));
    }

    const fullOrder = await getOrderWithItems(order.id);
    res.status(201).json(fullOrder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/", requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;
    const status = req.query.status as string;

    const where = status ? eq(ordersTable.status, status) : undefined;
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(ordersTable).where(where);
    const orders = await db.select().from(ordersTable).where(where).orderBy(desc(ordersTable.createdAt)).limit(limit).offset(offset);

    const ordersWithItems = await Promise.all(orders.map(async (o) => {
      const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, o.id));
      return { ...o, total: parseFloat(o.total), items: items.map(i => ({ ...i, price: parseFloat(i.price) })) };
    }));

    res.json({ orders: ordersWithItems, total: Number(count), page, totalPages: Math.ceil(Number(count) / limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", requireAuth, async (req, res) => {
  try {
    const order = await getOrderWithItems(parseInt(req.params.id));
    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    await db.update(ordersTable).set({ status }).where(eq(ordersTable.id, parseInt(req.params.id)));
    const order = await getOrderWithItems(parseInt(req.params.id));
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
