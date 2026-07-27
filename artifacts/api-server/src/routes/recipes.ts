import { Router, type IRouter } from "express";
import { db, recipesTable, usersTable } from "@workspace/db";
import { eq, ilike, desc, sql, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { CreateRecipeBody, GetRecipesQueryParams, GetRecipeParams } from "@workspace/api-zod";

const router: IRouter = Router();

function formatRecipe(recipe: typeof recipesTable.$inferSelect, author: { name: string | null; avatar: string | null }) {
  return {
    id: recipe.id,
    title: recipe.title,
    titleBn: recipe.titleBn ?? null,
    description: recipe.description,
    ingredients: recipe.ingredients ?? [],
    steps: recipe.steps ?? [],
    images: recipe.images ?? [],
    authorId: recipe.authorId,
    authorName: author.name ?? "Unknown",
    authorAvatar: author.avatar ?? null,
    isForSale: recipe.isForSale,
    price: recipe.price != null ? parseFloat(String(recipe.price)) : null,
    createdAt: recipe.createdAt.toISOString(),
  };
}

router.get("/recipes", async (req, res): Promise<void> => {
  const params = GetRecipesQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const { search, page = 1, limit = 12 } = params.data;
  const offset = (Number(page) - 1) * Number(limit);

  const conditions = search ? [ilike(recipesTable.title, `%${search}%`)] : [];

  const [rows, countResult] = await Promise.all([
    db
      .select({ recipe: recipesTable, author: usersTable })
      .from(recipesTable)
      .leftJoin(usersTable, eq(recipesTable.authorId, usersTable.id))
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(recipesTable.createdAt))
      .limit(Number(limit))
      .offset(offset),
    db
      .select({ count: sql<number>`CAST(COUNT(*) AS INTEGER)` })
      .from(recipesTable)
      .where(conditions.length ? and(...conditions) : undefined),
  ]);

  res.json({
    recipes: rows.map((r) => formatRecipe(r.recipe, { name: r.author?.name ?? null, avatar: r.author?.avatar ?? null })),
    total: Number(countResult[0]?.count) || 0,
    page: Number(page),
    limit: Number(limit),
  });
});

router.post("/recipes", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateRecipeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { title, titleBn, description, ingredients, steps, images, isForSale, price } = parsed.data;

  const [recipe] = await db
    .insert(recipesTable)
    .values({
      title,
      titleBn: titleBn ?? null,
      description,
      ingredients: ingredients ?? [],
      steps: steps ?? [],
      images: images ?? [],
      authorId: req.user!.userId,
      isForSale,
      price: price != null ? String(price) : null,
    })
    .returning();

  const [author] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.userId)).limit(1);

  res.status(201).json(formatRecipe(recipe, { name: author?.name ?? null, avatar: author?.avatar ?? null }));
});

router.get("/recipes/:id", async (req, res): Promise<void> => {
  const params = GetRecipeParams.safeParse({ id: req.params.id });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db
    .select({ recipe: recipesTable, author: usersTable })
    .from(recipesTable)
    .leftJoin(usersTable, eq(recipesTable.authorId, usersTable.id))
    .where(eq(recipesTable.id, params.data.id))
    .limit(1);

  if (!row) {
    res.status(404).json({ error: "Recipe not found" });
    return;
  }

  res.json(formatRecipe(row.recipe, { name: row.author?.name ?? null, avatar: row.author?.avatar ?? null }));
});

export default router;
