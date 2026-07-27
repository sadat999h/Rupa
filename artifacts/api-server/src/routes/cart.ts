import { Router, type IRouter } from "express";
import { db, cartItemsTable, productsTable, usersTable } from "@workspace/db";
import { eq, and, inArray } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { AddToCartBody, RemoveFromCartParams } from "@workspace/api-zod";

const router: IRouter = Router();

async function buildCartResponse(userId: number) {
  const cartItems = await db
    .select({ cart: cartItemsTable, product: productsTable, seller: usersTable })
    .from(cartItemsTable)
    .leftJoin(productsTable, eq(cartItemsTable.productId, productsTable.id))
    .leftJoin(usersTable, eq(productsTable.sellerId, usersTable.id))
    .where(eq(cartItemsTable.userId, userId));

  const items = cartItems
    .filter((r) => r.product !== null)
    .map((r) => ({
      productId: r.cart.productId,
      productTitle: r.product!.title,
      productImage: (r.product!.images ?? [])[0] ?? null,
      price: parseFloat(String(r.product!.price)),
      quantity: r.cart.quantity,
      sellerName: r.seller?.name ?? "",
    }));

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return {
    items,
    total: Math.round(total * 100) / 100,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
  };
}

router.get("/cart", requireAuth, async (req, res): Promise<void> => {
  const cart = await buildCartResponse(req.user!.userId);
  res.json(cart);
});

router.post("/cart", requireAuth, async (req, res): Promise<void> => {
  const parsed = AddToCartBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { productId, quantity } = parsed.data;

  // Check product exists
  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, productId)).limit(1);
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  // Check if already in cart
  const [existing] = await db
    .select()
    .from(cartItemsTable)
    .where(and(eq(cartItemsTable.userId, req.user!.userId), eq(cartItemsTable.productId, productId)))
    .limit(1);

  if (existing) {
    await db
      .update(cartItemsTable)
      .set({ quantity: existing.quantity + quantity })
      .where(eq(cartItemsTable.id, existing.id));
  } else {
    await db.insert(cartItemsTable).values({ userId: req.user!.userId, productId, quantity });
  }

  const cart = await buildCartResponse(req.user!.userId);
  res.json(cart);
});

router.delete("/cart", requireAuth, async (req, res): Promise<void> => {
  await db.delete(cartItemsTable).where(eq(cartItemsTable.userId, req.user!.userId));
  res.json({ success: true, message: "Cart cleared" });
});

router.delete("/cart/:productId", requireAuth, async (req, res): Promise<void> => {
  const params = RemoveFromCartParams.safeParse({ productId: req.params.productId });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  await db
    .delete(cartItemsTable)
    .where(and(eq(cartItemsTable.userId, req.user!.userId), eq(cartItemsTable.productId, params.data.productId)));

  const cart = await buildCartResponse(req.user!.userId);
  res.json(cart);
});

export default router;
