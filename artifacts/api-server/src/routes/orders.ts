import { Router, type IRouter } from "express";
import { db, ordersTable, orderItemsTable, productsTable, usersTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { CreateOrderBody, GetOrdersQueryParams, GetOrderParams, UpdateOrderStatusBody, UpdateOrderStatusParams } from "@workspace/api-zod";

const router: IRouter = Router();

async function buildOrderResponse(orderId: number) {
  const [orderRow] = await db
    .select({ order: ordersTable })
    .from(ordersTable)
    .where(eq(ordersTable.id, orderId))
    .limit(1);

  if (!orderRow) return null;

  const [buyerRow, sellerRow, items] = await Promise.all([
    db.select().from(usersTable).where(eq(usersTable.id, orderRow.order.buyerId)).limit(1),
    db.select().from(usersTable).where(eq(usersTable.id, orderRow.order.sellerId)).limit(1),
    db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, orderId)),
  ]);

  const order = orderRow.order;

  return {
    id: order.id,
    buyerId: order.buyerId,
    buyerName: buyerRow[0]?.name ?? "Unknown",
    sellerId: order.sellerId,
    sellerName: sellerRow[0]?.name ?? "Unknown",
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
}

router.get("/orders", requireAuth, async (req, res): Promise<void> => {
  const params = GetOrdersQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const { role } = params.data;
  const userId = req.user!.userId;

  let query;
  if (role === "seller") {
    query = db.select().from(ordersTable).where(eq(ordersTable.sellerId, userId)).orderBy(desc(ordersTable.createdAt));
  } else {
    query = db.select().from(ordersTable).where(eq(ordersTable.buyerId, userId)).orderBy(desc(ordersTable.createdAt));
  }

  const orders = await query;
  const orderResponses = await Promise.all(orders.map((o) => buildOrderResponse(o.id)));
  res.json(orderResponses.filter(Boolean));
});

router.post("/orders", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { items, deliveryAddress, deliveryPhone, note, paymentMethod } = parsed.data;

  // Fetch products to get prices and seller info
  const productIds = items.map((i) => i.productId);
  const products = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, productIds[0])); // simplified - just use first seller

  if (products.length === 0) {
    res.status(400).json({ error: "Products not found" });
    return;
  }

  // Get all products for this order
  let allProducts: (typeof productsTable.$inferSelect)[] = [];
  for (const item of items) {
    const [p] = await db.select().from(productsTable).where(eq(productsTable.id, item.productId)).limit(1);
    if (p) allProducts.push(p);
  }

  if (allProducts.length === 0) {
    res.status(400).json({ error: "No valid products found" });
    return;
  }

  // Use the first product's seller (simplified - real app would handle multi-seller)
  const sellerId = allProducts[0].sellerId;

  // Calculate total
  const total = items.reduce((sum, item) => {
    const product = allProducts.find((p) => p.id === item.productId);
    return sum + (product ? parseFloat(String(product.price)) * item.quantity : 0);
  }, 0);

  const [order] = await db
    .insert(ordersTable)
    .values({
      buyerId: req.user!.userId,
      sellerId,
      total: String(total),
      paymentMethod,
      deliveryAddress,
      deliveryPhone,
      note: note ?? null,
      status: "pending",
      paymentStatus: paymentMethod === "cod" ? "pending" : "paid",
    })
    .returning();

  // Insert order items
  for (const item of items) {
    const product = allProducts.find((p) => p.id === item.productId);
    if (!product) continue;
    await db.insert(orderItemsTable).values({
      orderId: order.id,
      productId: item.productId,
      productTitle: product.title,
      productImage: (product.images ?? [])[0] ?? null,
      quantity: item.quantity,
      price: product.price,
    });
  }

  const response = await buildOrderResponse(order.id);
  res.status(201).json(response);
});

router.get("/orders/:id", requireAuth, async (req, res): Promise<void> => {
  const params = GetOrderParams.safeParse({ id: req.params.id });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, params.data.id)).limit(1);
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  // Only buyer or seller can see the order
  if (order.buyerId !== req.user!.userId && order.sellerId !== req.user!.userId) {
    res.status(403).json({ error: "Not authorized" });
    return;
  }

  const response = await buildOrderResponse(order.id);
  res.json(response);
});

router.patch("/orders/:id/status", requireAuth, async (req, res): Promise<void> => {
  const params = UpdateOrderStatusParams.safeParse({ id: req.params.id });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateOrderStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, params.data.id)).limit(1);
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  if (order.sellerId !== req.user!.userId) {
    res.status(403).json({ error: "Only the seller can update order status" });
    return;
  }

  await db.update(ordersTable).set({ status: parsed.data.status }).where(eq(ordersTable.id, params.data.id));

  const response = await buildOrderResponse(order.id);
  res.json(response);
});

export default router;
