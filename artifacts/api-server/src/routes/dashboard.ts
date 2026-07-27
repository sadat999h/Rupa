import { Router, type IRouter } from "express";
import { db, ordersTable, productsTable, orderItemsTable } from "@workspace/db";
import { eq, and, count, sum, desc, sql } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/dashboard/stats", requireAuth, async (req, res): Promise<void> => {
  if (req.user!.role !== "seller") {
    res.status(403).json({ error: "Only sellers can access dashboard" });
    return;
  }

  const sellerId = req.user!.userId;

  const [totalRevenueResult, totalOrdersResult, totalProductsResult, pendingOrdersResult] = await Promise.all([
    db
      .select({ total: sum(ordersTable.total) })
      .from(ordersTable)
      .where(and(eq(ordersTable.sellerId, sellerId), eq(ordersTable.status, "delivered"))),
    db
      .select({ count: count(ordersTable.id) })
      .from(ordersTable)
      .where(eq(ordersTable.sellerId, sellerId)),
    db
      .select({ count: count(productsTable.id) })
      .from(productsTable)
      .where(and(eq(productsTable.sellerId, sellerId), eq(productsTable.isActive, true))),
    db
      .select({ count: count(ordersTable.id) })
      .from(ordersTable)
      .where(and(eq(ordersTable.sellerId, sellerId), eq(ordersTable.status, "pending"))),
  ]);

  // Recent orders
  const recentOrderRows = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.sellerId, sellerId))
    .orderBy(desc(ordersTable.createdAt))
    .limit(5);

  const recentOrders = await Promise.all(
    recentOrderRows.map(async (order) => {
      const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, order.id));
      return {
        id: order.id,
        buyerId: order.buyerId,
        buyerName: "Customer",
        sellerId: order.sellerId,
        sellerName: "",
        items: items.map((i) => ({
          id: i.id,
          productId: i.productId,
          productTitle: i.productTitle,
          productImage: i.productImage ?? null,
          quantity: i.quantity,
          price: parseFloat(String(i.price)),
        })),
        total: parseFloat(String(order.total)),
        status: order.status,
        paymentStatus: order.paymentStatus,
        deliveryAddress: order.deliveryAddress,
        deliveryPhone: order.deliveryPhone,
        note: order.note ?? null,
        createdAt: order.createdAt.toISOString(),
      };
    })
  );

  // Monthly revenue for last 6 months
  const monthlyRevenue = await db.execute(sql`
    SELECT 
      TO_CHAR(created_at, 'YYYY-MM') as month,
      COALESCE(SUM(total::numeric), 0)::text as revenue
    FROM orders
    WHERE seller_id = ${sellerId}
      AND status = 'delivered'
      AND created_at >= NOW() - INTERVAL '6 months'
    GROUP BY TO_CHAR(created_at, 'YYYY-MM')
    ORDER BY month ASC
  `);

  res.json({
    totalRevenue: parseFloat(String(totalRevenueResult[0]?.total ?? "0")) || 0,
    totalOrders: Number(totalOrdersResult[0]?.count) || 0,
    totalProducts: Number(totalProductsResult[0]?.count) || 0,
    pendingOrders: Number(pendingOrdersResult[0]?.count) || 0,
    recentOrders,
    monthlyRevenue: (monthlyRevenue.rows as { month: string; revenue: string }[]).map((r) => ({
      month: r.month,
      revenue: parseFloat(r.revenue) || 0,
    })),
  });
});

export default router;
