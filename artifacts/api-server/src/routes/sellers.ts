import { Router, type IRouter } from "express";
import { db, usersTable, productsTable, ordersTable, reviewsTable } from "@workspace/db";
import { eq, ilike, and, count, avg, desc, sql } from "drizzle-orm";
import { GetSellersQueryParams, GetSellerProfileParams } from "@workspace/api-zod";

const router: IRouter = Router();

async function buildSellerProfile(seller: typeof usersTable.$inferSelect) {
  const [productStats, orderStats, reviewStats] = await Promise.all([
    db
      .select({ count: count(productsTable.id) })
      .from(productsTable)
      .where(and(eq(productsTable.sellerId, seller.id), eq(productsTable.isActive, true))),
    db
      .select({ count: count(ordersTable.id) })
      .from(ordersTable)
      .where(eq(ordersTable.sellerId, seller.id)),
    db
      .select({ avgRating: avg(reviewsTable.rating) })
      .from(reviewsTable)
      .leftJoin(productsTable, eq(reviewsTable.productId, productsTable.id))
      .where(eq(productsTable.sellerId, seller.id)),
  ]);

  return {
    id: seller.id,
    name: seller.name,
    nameBn: seller.nameBn ?? null,
    avatar: seller.avatar ?? null,
    bio: seller.bio ?? null,
    location: seller.location ?? null,
    isVerified: seller.isVerified,
    productCount: Number(productStats[0]?.count) || 0,
    avgRating: reviewStats[0]?.avgRating != null ? parseFloat(String(reviewStats[0].avgRating)) : null,
    totalSales: Number(orderStats[0]?.count) || 0,
    joinedAt: seller.createdAt.toISOString(),
  };
}

router.get("/sellers", async (req, res): Promise<void> => {
  const params = GetSellersQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const { search } = params.data;
  const conditions = [eq(usersTable.role, "seller")];
  if (search) conditions.push(ilike(usersTable.name, `%${search}%`));

  const sellers = await db
    .select()
    .from(usersTable)
    .where(and(...conditions))
    .orderBy(desc(usersTable.createdAt));

  const profiles = await Promise.all(sellers.map(buildSellerProfile));
  res.json(profiles);
});

router.get("/sellers/top", async (_req, res): Promise<void> => {
  // Top sellers by number of completed orders
  const topSellers = await db
    .select({
      sellerId: ordersTable.sellerId,
      orderCount: sql<number>`CAST(COUNT(${ordersTable.id}) AS INTEGER)`,
    })
    .from(ordersTable)
    .where(eq(ordersTable.status, "delivered"))
    .groupBy(ordersTable.sellerId)
    .orderBy(desc(sql`COUNT(${ordersTable.id})`))
    .limit(6);

  let sellers: (typeof usersTable.$inferSelect)[];
  if (topSellers.length > 0) {
    sellers = await db
      .select()
      .from(usersTable)
      .where(
        and(
          eq(usersTable.role, "seller"),
          sql`${usersTable.id} = ANY(ARRAY[${sql.join(topSellers.map((s) => sql`${s.sellerId}`), sql`, `)}]::integer[])`
        )
      );
  } else {
    sellers = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.role, "seller"))
      .orderBy(desc(usersTable.createdAt))
      .limit(6);
  }

  const profiles = await Promise.all(sellers.map(buildSellerProfile));
  res.json(profiles);
});

router.get("/sellers/:id", async (req, res): Promise<void> => {
  const params = GetSellerProfileParams.safeParse({ id: req.params.id });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [seller] = await db
    .select()
    .from(usersTable)
    .where(and(eq(usersTable.id, params.data.id), eq(usersTable.role, "seller")))
    .limit(1);

  if (!seller) {
    res.status(404).json({ error: "Seller not found" });
    return;
  }

  const profile = await buildSellerProfile(seller);
  res.json(profile);
});

export default router;
