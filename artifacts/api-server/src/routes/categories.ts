import { Router, type IRouter } from "express";
import { db, categoriesTable, productsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/categories", async (_req, res): Promise<void> => {
  const categories = await db
    .select({
      id: categoriesTable.id,
      name: categoriesTable.name,
      nameBn: categoriesTable.nameBn,
      slug: categoriesTable.slug,
      icon: categoriesTable.icon,
      productCount: sql<number>`CAST(COUNT(${productsTable.id}) AS INTEGER)`,
    })
    .from(categoriesTable)
    .leftJoin(
      productsTable,
      sql`${productsTable.categorySlug} = ${categoriesTable.slug} AND ${productsTable.isActive} = true`
    )
    .groupBy(categoriesTable.id)
    .orderBy(categoriesTable.id);

  res.json(
    categories.map((c) => ({
      id: c.id,
      name: c.name,
      nameBn: c.nameBn,
      slug: c.slug,
      icon: c.icon,
      productCount: Number(c.productCount) || 0,
    }))
  );
});

export default router;
