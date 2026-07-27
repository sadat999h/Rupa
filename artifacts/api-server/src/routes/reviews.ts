import { Router, type IRouter } from "express";
import { db, reviewsTable, usersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { CreateReviewBody, CreateReviewParams, GetProductReviewsParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/products/:productId/reviews", async (req, res): Promise<void> => {
  const params = GetProductReviewsParams.safeParse({ productId: req.params.productId });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const reviews = await db
    .select({ review: reviewsTable, buyer: usersTable })
    .from(reviewsTable)
    .leftJoin(usersTable, eq(reviewsTable.buyerId, usersTable.id))
    .where(eq(reviewsTable.productId, params.data.productId))
    .orderBy(desc(reviewsTable.createdAt));

  res.json(
    reviews.map((r) => ({
      id: r.review.id,
      productId: r.review.productId,
      buyerId: r.review.buyerId,
      buyerName: r.buyer?.name ?? "Unknown",
      buyerAvatar: r.buyer?.avatar ?? null,
      rating: r.review.rating,
      comment: r.review.comment ?? null,
      createdAt: r.review.createdAt.toISOString(),
    }))
  );
});

router.post("/products/:productId/reviews", requireAuth, async (req, res): Promise<void> => {
  const params = CreateReviewParams.safeParse({ productId: req.params.productId });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = CreateReviewBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [review] = await db
    .insert(reviewsTable)
    .values({
      productId: params.data.productId,
      buyerId: req.user!.userId,
      rating: parsed.data.rating,
      comment: parsed.data.comment ?? null,
    })
    .returning();

  const [buyer] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.userId)).limit(1);

  res.status(201).json({
    id: review.id,
    productId: review.productId,
    buyerId: review.buyerId,
    buyerName: buyer?.name ?? "Unknown",
    buyerAvatar: buyer?.avatar ?? null,
    rating: review.rating,
    comment: review.comment ?? null,
    createdAt: review.createdAt.toISOString(),
  });
});

export default router;
