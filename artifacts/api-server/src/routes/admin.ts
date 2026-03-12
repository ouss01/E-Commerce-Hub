import { Router } from "express";
import { db, ordersTable, productsTable, usersTable, orderItemsTable } from "@workspace/db";
import { eq, sql, desc, lt } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth.js";

const router = Router();

router.get("/stats", requireAdmin, async (_req, res) => {
  try {
    const [{ totalRevenue }] = await db.select({ totalRevenue: sql<number>`coalesce(sum(${ordersTable.total}), 0)` }).from(ordersTable);
    const [{ totalOrders }] = await db.select({ totalOrders: sql<number>`count(*)` }).from(ordersTable);
    const [{ totalProducts }] = await db.select({ totalProducts: sql<number>`count(*)` }).from(productsTable);
    const [{ totalCustomers }] = await db.select({ totalCustomers: sql<number>`count(*)` }).from(usersTable).where(eq(usersTable.role, "customer"));
    const [{ pendingOrders }] = await db.select({ pendingOrders: sql<number>`count(*)` }).from(ordersTable).where(eq(ordersTable.status, "pending"));
    const [{ lowStockProducts }] = await db.select({ lowStockProducts: sql<number>`count(*)` }).from(productsTable).where(lt(productsTable.stock, 5));

    const recentOrders = await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt)).limit(5);
    const recentOrdersWithItems = await Promise.all(recentOrders.map(async (o) => {
      const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, o.id));
      return { ...o, total: parseFloat(o.total), items: items.map(i => ({ ...i, price: parseFloat(i.price) })) };
    }));

    const monthlyRevenue = await db.execute(sql`
      SELECT 
        TO_CHAR(created_at, 'YYYY-MM') as month,
        COALESCE(SUM(total), 0) as revenue,
        COUNT(*) as orders
      FROM orders
      WHERE created_at >= NOW() - INTERVAL '6 months'
      GROUP BY TO_CHAR(created_at, 'YYYY-MM')
      ORDER BY month ASC
    `);

    const ordersByStatus = await db
      .select({ status: ordersTable.status, count: sql<number>`count(*)` })
      .from(ordersTable)
      .groupBy(ordersTable.status);

    res.json({
      totalRevenue: parseFloat(totalRevenue as any) || 0,
      totalOrders: Number(totalOrders),
      totalProducts: Number(totalProducts),
      totalCustomers: Number(totalCustomers),
      pendingOrders: Number(pendingOrders),
      lowStockProducts: Number(lowStockProducts),
      recentOrders: recentOrdersWithItems,
      monthlyRevenue: (monthlyRevenue.rows as any[]).map(r => ({
        month: r.month,
        revenue: parseFloat(r.revenue),
        orders: Number(r.orders),
      })),
      ordersByStatus: ordersByStatus.map(r => ({ status: r.status, count: Number(r.count) })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/customers", requireAdmin, async (_req, res) => {
  try {
    const customers = await db.execute(sql`
      SELECT 
        u.id, u.name, u.email, u.created_at as "createdAt",
        COUNT(o.id) as "orderCount",
        COALESCE(SUM(o.total), 0) as "totalSpent"
      FROM users u
      LEFT JOIN orders o ON o.user_id = u.id
      WHERE u.role = 'customer'
      GROUP BY u.id, u.name, u.email, u.created_at
      ORDER BY u.created_at DESC
    `);
    res.json((customers.rows as any[]).map(c => ({
      id: c.id,
      name: c.name,
      email: c.email,
      createdAt: c.createdAt,
      orderCount: Number(c.orderCount),
      totalSpent: parseFloat(c.totalSpent),
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
