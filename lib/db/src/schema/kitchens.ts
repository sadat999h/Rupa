import { Router, type IRouter } from "express";
import { db, kitchensTable, usersTable, productsTable, categoriesTable, reviewsTable } from "@workspace/db";
import { eq, and, or, ilike, desc, sql } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { GetKitchensQueryParams, CreateKitchenBody, UpdateKitchenBody, UpdateKitchenParams } from "@workspace/api-zod";

const router: IRouter = Router();

function formatKitchen(
  kitchen: typeof kitchensTable.$inferSelect,
  owner: { name: string | null; avatar: string | null },
  foodItemCount: number
) {
  return {
    id: kitchen.id,
    ownerId: kitchen.ownerId,
    ownerName: owner.name ?? "",
    ownerAvatar: owner.avatar ?? null,
    name: kitchen.name,
    nameBn: kitchen.nameBn ?? null,
    description: kitchen.description,
    cuisineType: kitchen.cuisineType ?? null,
    coverImage: kitchen.coverImage ?? null,
    location: kitchen.location ?? null,
    phone: kitchen.phone ?? null,
    isOpen: kitchen.isOpen,
    foodItemCount,
    createdAt: kitchen.createdAt.toISOString(),
  };
}

async function getFoodItemCounts(kitchenIds: number[]) {
  if (kitchenIds.length === 0) return new Map<number, number>();
  const rows = await db
    .select({ kitchenId: productsTable.kitchenId, cnt: sql<number>`CAST(COUNT(*) AS INTEGER)` })
    .from(productsTable)
    .where(and(sql`${productsTable.kitchenId} = ANY(${kitchenIds})`, eq(productsTable.isActive, true)))
    .groupBy(productsTable.kitchenId);
  const map = new Map<number, number>();
  for (const r of rows) {
    if (r.kitchenId != null) map.set(r.kitchenId, Number(r.cnt));
  }
  return map;
}

router.get("/kitchens", async (req, res): Promise<void> => {
  const params = GetKitchensQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const { search, page = 1, limit = 12 } = params.data;

  const conditions = [eq(kitchensTable.isOpen, true)];
  if (search) {
    conditions.push(
      or(ilike(kitchensTable.name, `%${search}%`), ilike(kitchensTable.location, `%${search}%`), ilike(kitchensTable.cuisineType, `%${search}%`))!
    );
  }

  const offset = (Number(page) - 1) * Number(limit);

  const [rows, countResult] = await Promise.all([
    db
      .select()
      .from(kitchensTable)
      .leftJoin(usersTable, eq(kitchensTable.ownerId, usersTable.id))
      .where(and(...conditions))
      .orderBy(desc(kitchensTable.createdAt))
      .limit(Number(limit))
      .offset(offset),
    db
      .select({ count: sql<number>`CAST(COUNT(*) AS INTEGER)` })
      .from(kitchensTable)
      .where(and(...conditions)),
  ]);

  const ids = rows.map((r) => r.kitchens.id);
  const countsMap = await getFoodItemCounts(ids);

  res.json({
    kitchens: rows.map((r) => formatKitchen(r.kitchens, { name: r.users?.name ?? null, avatar: r.users?.avatar ?? null }, countsMap.get(r.kitchens.id) ?? 0)),
    total: Number(countResult[0]?.count) || 0,
    page: Number(page),
    limit: Number(limit),
  });
});

router.get("/kitchens/mine", requireAuth, async (req, res): Promise<void> => {
  const [row] = await db
    .select()
    .from(kitchensTable)
    .leftJoin(usersTable, eq(kitchensTable.ownerId, usersTable.id))
    .where(eq(kitchensTable.ownerId, req.user!.userId))
    .limit(1);

  if (!row) {
    res.status(404).json({ error: "You don't have a kitchen yet" });
    return;
  }

  const foodItems = await db
    .select()
    .from(productsTable)
    .leftJoin(usersTable, eq(productsTable.sellerId, usersTable.id))
    .leftJoin(categoriesTable, eq(productsTable.categorySlug, categoriesTable.slug))
    .where(eq(productsTable.kitchenId, row.kitchens.id))
    .orderBy(desc(productsTable.createdAt));

  const countsMap = await getFoodItemCounts([row.kitchens.id]);

  res.json({
    ...formatKitchen(row.kitchens, { name: row.users?.name ?? null, avatar: row.users?.avatar ?? null }, countsMap.get(row.kitchens.id) ?? 0),
    foodItems: foodItems.map((f) => ({
      id: f.products.id,
      title: f.products.title,
      titleBn: f.products.titleBn ?? null,
      description: f.products.description,
      price: parseFloat(String(f.products.price)),
      categorySlug: f.products.categorySlug,
      categoryName: f.categories?.name ?? "",
      categoryNameBn: f.categories?.nameBn ?? "",
      images: f.products.images ?? [],
      sellerId: f.products.sellerId,
      sellerName: f.users?.name ?? "",
      sellerAvatar: f.users?.avatar ?? null,
      stock: f.products.stock,
      isActive: f.products.isActive,
      avgRating: null,
      reviewCount: 0,
      kitchenId: f.products.kitchenId ?? null,
      createdAt: f.products.createdAt.toISOString(),
    })),
  });
});

router.get("/kitchens/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid kitchen id" });
    return;
  }

  const [row] = await db
    .select()
    .from(kitchensTable)
    .leftJoin(usersTable, eq(kitchensTable.ownerId, usersTable.id))
    .where(eq(kitchensTable.id, id))
    .limit(1);

  if (!row) {
    res.status(404).json({ error: "Kitchen not found" });
    return;
  }

  const foodItems = await db
    .select()
    .from(productsTable)
    .leftJoin(usersTable, eq(productsTable.sellerId, usersTable.id))
    .leftJoin(categoriesTable, eq(productsTable.categorySlug, categoriesTable.slug))
    .where(and(eq(productsTable.kitchenId, id), eq(productsTable.isActive, true)))
    .orderBy(desc(productsTable.createdAt));

  const countsMap = await getFoodItemCounts([id]);

  res.json({
    ...formatKitchen(row.kitchens, { name: row.users?.name ?? null, avatar: row.users?.avatar ?? null }, countsMap.get(id) ?? 0),
    foodItems: foodItems.map((f) => ({
      id: f.products.id,
      title: f.products.title,
      titleBn: f.products.titleBn ?? null,
      description: f.products.description,
      price: parseFloat(String(f.products.price)),
      categorySlug: f.products.categorySlug,
      categoryName: f.categories?.name ?? "",
      categoryNameBn: f.categories?.nameBn ?? "",
      images: f.products.images ?? [],
      sellerId: f.products.sellerId,
      sellerName: f.users?.name ?? "",
      sellerAvatar: f.users?.avatar ?? null,
      stock: f.products.stock,
      isActive: f.products.isActive,
      avgRating: null,
      reviewCount: 0,
      kitchenId: f.products.kitchenId ?? null,
      createdAt: f.products.createdAt.toISOString(),
    })),
  });
});

router.post("/kitchens", requireAuth, async (req, res): Promise<void> => {
  if (req.user!.role !== "seller") {
    res.status(403).json({ error: "Only sellers can create a kitchen" });
    return;
  }

  const [existing] = await db.select().from(kitchensTable).where(eq(kitchensTable.ownerId, req.user!.userId)).limit(1);
  if (existing) {
    res.status(409).json({ error: "You already have a kitchen" });
    return;
  }

  const parsed = CreateKitchenBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { name, nameBn, description, cuisineType, coverImage, location, phone } = parsed.data;

  const [kitchen] = await db
    .insert(kitchensTable)
    .values({
      ownerId: req.user!.userId,
      name,
      nameBn: nameBn ?? null,
      description,
      cuisineType: cuisineType ?? null,
      coverImage: coverImage ?? null,
      location: location ?? null,
      phone: phone ?? null,
    })
    .returning();

  const [owner] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.userId)).limit(1);

  res.status(201).json(formatKitchen(kitchen, { name: owner?.name ?? null, avatar: owner?.avatar ?? null }, 0));
});

router.put("/kitchens/:id", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  const params = UpdateKitchenParams.safeParse({ id });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateKitchenBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [existing] = await db.select().from(kitchensTable).where(eq(kitchensTable.id, id)).limit(1);
  if (!existing) {
    res.status(404).json({ error: "Kitchen not found" });
    return;
  }
  if (existing.ownerId !== req.user!.userId) {
    res.status(403).json({ error: "Not authorized" });
    return;
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
  if (parsed.data.nameBn !== undefined) updateData.nameBn = parsed.data.nameBn;
  if (parsed.data.description !== undefined) updateData.description = parsed.data.description;
  if (parsed.data.cuisineType !== undefined) updateData.cuisineType = parsed.data.cuisineType;
  if (parsed.data.coverImage !== undefined) updateData.coverImage = parsed.data.coverImage;
  if (parsed.data.location !== undefined) updateData.location = parsed.data.location;
  if (parsed.data.phone !== undefined) updateData.phone = parsed.data.phone;
  if (parsed.data.isOpen !== undefined) updateData.isOpen = parsed.data.isOpen;

  await db.update(kitchensTable).set(updateData).where(eq(kitchensTable.id, id));

  const [row] = await db
    .select()
    .from(kitchensTable)
    .leftJoin(usersTable, eq(kitchensTable.ownerId, usersTable.id))
    .where(eq(kitchensTable.id, id))
    .limit(1);

  const countsMap = await getFoodItemCounts([id]);
  res.json(formatKitchen(row.kitchens, { name: row.users?.name ?? null, avatar: row.users?.avatar ?? null }, countsMap.get(id) ?? 0));
});

export default router;
