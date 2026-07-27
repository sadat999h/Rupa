import { Router, type IRouter } from "express";
import { db, usersTable, productsTable, categoriesTable, ordersTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";

const router: IRouter = Router();

router.get("/marketplace/summary", async (_req, res): Promise<void> => {
  const [sellersResult, productsResult, categoriesResult, ordersResult] = await Promise.all([
    db.select({ count: count(usersTable.id) }).from(usersTable).where(eq(usersTable.role, "seller")),
    db.select({ count: count(productsTable.id) }).from(productsTable).where(eq(productsTable.isActive, true)),
    db.select({ count: count(categoriesTable.id) }).from(categoriesTable),
    db.select({ count: count(ordersTable.id) }).from(ordersTable),
  ]);

  res.json({
    totalSellers: Number(sellersResult[0]?.count) || 0,
    totalProducts: Number(productsResult[0]?.count) || 0,
    totalCategories: Number(categoriesResult[0]?.count) || 0,
    totalOrders: Number(ordersResult[0]?.count) || 0,
  });
});

export default router;
