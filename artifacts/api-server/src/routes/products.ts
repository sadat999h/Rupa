import { Router, type IRouter } from "express";
import { db, productsTable, usersTable, categoriesTable, reviewsTable, kitchensTable } from "@workspace/db";
import { eq, and, gte, lte, ilike, desc, inArray, avg, count, sql } from "drizzle-orm";
import { requireAuth, optionalAuth } from "../middlewares/auth";
import {
  GetProductsQueryParams,
  GetProductParams,
  CreateProductBody,
  UpdateProductBody,
  UpdateProductParams,
  DeleteProductParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function getReviewStats(productIds: number[]) {
  if (productIds.length === 0) return new Map<number, { avgRating: number | null; reviewCount: number }>();
  const stats = await db
    .select({
      productId: reviewsTable.productId,
      avgRating: avg(reviewsTable.rating),
      reviewCount: count(reviewsTable.id),
    })
    .from(reviewsTable)
    .where(inArray(reviewsTable.productId, productIds))
    .groupBy(reviewsTable.productId);

  const map = new Map<number, { avgRating: number | null; reviewCount: number }>();
  for (const s of stats) {
    map.set(s.productId, {
      avgRating: s.avgRating != null ? parseFloat(String(s.avgRating)) : null,
      reviewCount: Number(s.reviewCount),
    });
  }
  return map;
}

function formatProduct(
  product: typeof productsTable.$inferSelect,
  seller: { name: string | null; avatar: string | null },
  category: { name: string | null; nameBn: string | null },
  stats: { avgRating: number | null; reviewCount: number }
) {
  return {
    id: product.id,
    title: product.title,
    titleBn: product.titleBn ?? null,
    description: product.description,
    price: parseFloat(String(product.price)),
    categorySlug: product.categorySlug,
    categoryName: category.name ?? "",
    categoryNameBn: category.nameBn ?? "",
    images: product.images ?? [],
    sellerId: product.sellerId,
    sellerName: seller.name ?? "",
    sellerAvatar: seller.avatar ?? null,
    stock: product.stock,
    isActive: product.isActive,
    avgRating: stats.avgRating,
    reviewCount: stats.reviewCount,
    kitchenId: product.kitchenId ?? null,
    createdAt: product.createdAt.toISOString(),
  };
}

router.get("/products/featured", async (_req, res): Promise<void> => {
  const products = await db
    .select()
    .from(productsTable)
    .leftJoin(usersTable, eq(productsTable.sellerId, usersTable.id))
    .leftJoin(categoriesTable, eq(productsTable.categorySlug, categoriesTable.slug))
    .where(eq(productsTable.isActive, true))
    .orderBy(desc(productsTable.createdAt))
    .limit(8);

  const ids = products.map((r) => r.products.id);
  const statsMap = await getReviewStats(ids);

  res.json(
    products.map((r) =>
      formatProduct(r.products, { name: r.users?.name ?? null, avatar: r.users?.avatar ?? null }, { name: r.categories?.name ?? null, nameBn: r.categories?.nameBn ?? null }, statsMap.get(r.products.id) ?? { avgRating: null, reviewCount: 0 })
    )
  );
});

router.get("/products/trending", async (_req, res): Promise<void> => {
  // Trending = products with most reviews
  const trending = await db
    .select({
      productId: reviewsTable.productId,
      cnt: count(reviewsTable.id),
    })
    .from(reviewsTable)
    .groupBy(reviewsTable.productId)
    .orderBy(desc(count(reviewsTable.id)))
    .limit(8);

  const trendingIds = trending.map((t) => t.productId);

  let products;
  if (trendingIds.length > 0) {
    products = await db
      .select()
      .from(productsTable)
      .leftJoin(usersTable, eq(productsTable.sellerId, usersTable.id))
      .leftJoin(categoriesTable, eq(productsTable.categorySlug, categoriesTable.slug))
      .where(and(inArray(productsTable.id, trendingIds), eq(productsTable.isActive, true)));
  } else {
    products = await db
      .select()
      .from(productsTable)
      .leftJoin(usersTable, eq(productsTable.sellerId, usersTable.id))
      .leftJoin(categoriesTable, eq(productsTable.categorySlug, categoriesTable.slug))
      .where(eq(productsTable.isActive, true))
      .orderBy(desc(productsTable.createdAt))
      .limit(8);
  }

  const ids = products.map((r) => r.products.id);
  const statsMap = await getReviewStats(ids);

  res.json(
    products.map((r) =>
      formatProduct(r.products, { name: r.users?.name ?? null, avatar: r.users?.avatar ?? null }, { name: r.categories?.name ?? null, nameBn: r.categories?.nameBn ?? null }, statsMap.get(r.products.id) ?? { avgRating: null, reviewCount: 0 })
    )
  );
});

router.get("/products", async (req, res): Promise<void> => {
  const params = GetProductsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const { category, search, minPrice, maxPrice, sellerId, page = 1, limit = 12 } = params.data;

  const conditions = [eq(productsTable.isActive, true)];
  if (category) conditions.push(eq(productsTable.categorySlug, category));
  if (search) conditions.push(ilike(productsTable.title, `%${search}%`));
  if (minPrice != null) conditions.push(gte(productsTable.price, String(minPrice)));
  if (maxPrice != null) conditions.push(lte(productsTable.price, String(maxPrice)));
  if (sellerId != null) conditions.push(eq(productsTable.sellerId, Number(sellerId)));

  const offset = (Number(page) - 1) * Number(limit);

  const [rows, countResult] = await Promise.all([
    db
      .select()
      .from(productsTable)
      .leftJoin(usersTable, eq(productsTable.sellerId, usersTable.id))
      .leftJoin(categoriesTable, eq(productsTable.categorySlug, categoriesTable.slug))
      .where(and(...conditions))
      .orderBy(desc(productsTable.createdAt))
      .limit(Number(limit))
      .offset(offset),
    db
      .select({ count: sql<number>`CAST(COUNT(*) AS INTEGER)` })
      .from(productsTable)
      .where(and(...conditions)),
  ]);

  const ids = rows.map((r) => r.products.id);
  const statsMap = await getReviewStats(ids);

  res.json({
    products: rows.map((r) =>
      formatProduct(r.products, { name: r.users?.name ?? null, avatar: r.users?.avatar ?? null }, { name: r.categories?.name ?? null, nameBn: r.categories?.nameBn ?? null }, statsMap.get(r.products.id) ?? { avgRating: null, reviewCount: 0 })
    ),
    total: Number(countResult[0]?.count) || 0,
    page: Number(page),
    limit: Number(limit),
  });
});

router.get("/products/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid product id" });
    return;
  }

  const [row] = await db
    .select()
    .from(productsTable)
    .leftJoin(usersTable, eq(productsTable.sellerId, usersTable.id))
    .leftJoin(categoriesTable, eq(productsTable.categorySlug, categoriesTable.slug))
    .where(eq(productsTable.id, id))
    .limit(1);

  if (!row) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  const [statsMap, reviewRows] = await Promise.all([
    getReviewStats([id]),
    db
      .select({ review: reviewsTable, buyer: usersTable })
      .from(reviewsTable)
      .leftJoin(usersTable, eq(reviewsTable.buyerId, usersTable.id))
      .where(eq(reviewsTable.productId, id))
      .orderBy(desc(reviewsTable.createdAt))
      .limit(20),
  ]);

  const stats = statsMap.get(id) ?? { avgRating: null, reviewCount: 0 };
  const product = formatProduct(row.products, { name: row.users?.name ?? null, avatar: row.users?.avatar ?? null }, { name: row.categories?.name ?? null, nameBn: row.categories?.nameBn ?? null }, stats);

  res.json({
    ...product,
    sellerLocation: row.users?.location ?? null,
    reviews: reviewRows.map((r) => ({
      id: r.review.id,
      productId: r.review.productId,
      buyerId: r.review.buyerId,
      buyerName: r.buyer?.name ?? "Unknown",
      buyerAvatar: r.buyer?.avatar ?? null,
      rating: r.review.rating,
      comment: r.review.comment ?? null,
      createdAt: r.review.createdAt.toISOString(),
    })),
  });
});

router.post("/products", requireAuth, async (req, res): Promise<void> => {
  if (req.user!.role !== "seller") {
    res.status(403).json({ error: "Only sellers can create products" });
    return;
  }

  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { title, titleBn, description, price, categorySlug, images, stock, kitchenId } = parsed.data;

  if (kitchenId != null) {
    const [kitchen] = await db.select().from(kitchensTable).where(eq(kitchensTable.id, kitchenId)).limit(1);
    if (!kitchen) {
      res.status(400).json({ error: "Kitchen not found" });
      return;
    }
    if (kitchen.ownerId !== req.user!.userId) {
      res.status(403).json({ error: "You do not own this kitchen" });
      return;
    }
  }

  const [product] = await db
    .insert(productsTable)
    .values({
      title,
      titleBn: titleBn ?? null,
      description,
      price: String(price),
      categorySlug,
      images: images ?? [],
      sellerId: req.user!.userId,
      stock,
      kitchenId: kitchenId ?? null,
    })
    .returning();

  const [row] = await db
    .select()
    .from(productsTable)
    .leftJoin(usersTable, eq(productsTable.sellerId, usersTable.id))
    .leftJoin(categoriesTable, eq(productsTable.categorySlug, categoriesTable.slug))
    .where(eq(productsTable.id, product.id))
    .limit(1);

  res.status(201).json(formatProduct(row.products, { name: row.users?.name ?? null, avatar: row.users?.avatar ?? null }, { name: row.categories?.name ?? null, nameBn: row.categories?.nameBn ?? null }, { avgRating: null, reviewCount: 0 }));
});

router.put("/products/:id", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  const params = UpdateProductParams.safeParse({ id });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [existing] = await db.select().from(productsTable).where(eq(productsTable.id, id)).limit(1);
  if (!existing) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  if (existing.sellerId !== req.user!.userId) {
    res.status(403).json({ error: "Not authorized" });
    return;
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.title !== undefined) updateData.title = parsed.data.title;
  if (parsed.data.titleBn !== undefined) updateData.titleBn = parsed.data.titleBn;
  if (parsed.data.description !== undefined) updateData.description = parsed.data.description;
  if (parsed.data.price !== undefined) updateData.price = String(parsed.data.price);
  if (parsed.data.categorySlug !== undefined) updateData.categorySlug = parsed.data.categorySlug;
  if (parsed.data.images !== undefined) updateData.images = parsed.data.images;
  if (parsed.data.stock !== undefined) updateData.stock = parsed.data.stock;
  if (parsed.data.isActive !== undefined) updateData.isActive = parsed.data.isActive;
  if (parsed.data.kitchenId !== undefined) updateData.kitchenId = parsed.data.kitchenId;

  await db.update(productsTable).set(updateData).where(eq(productsTable.id, id));

  const [row] = await db
    .select()
    .from(productsTable)
    .leftJoin(usersTable, eq(productsTable.sellerId, usersTable.id))
    .leftJoin(categoriesTable, eq(productsTable.categorySlug, categoriesTable.slug))
    .where(eq(productsTable.id, id))
    .limit(1);

  const statsMap = await getReviewStats([id]);
  res.json(formatProduct(row.products, { name: row.users?.name ?? null, avatar: row.users?.avatar ?? null }, { name: row.categories?.name ?? null, nameBn: row.categories?.nameBn ?? null }, statsMap.get(id) ?? { avgRating: null, reviewCount: 0 }));
});

router.delete("/products/:id", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  const params = DeleteProductParams.safeParse({ id });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [existing] = await db.select().from(productsTable).where(eq(productsTable.id, id)).limit(1);
  if (!existing) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  if (existing.sellerId !== req.user!.userId) {
    res.status(403).json({ error: "Not authorized" });
    return;
  }

  await db.delete(productsTable).where(eq(productsTable.id, id));
  res.json({ success: true, message: "Product deleted" });
});

export default router;
