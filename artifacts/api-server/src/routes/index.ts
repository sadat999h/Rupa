import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import categoriesRouter from "./categories";
import productsRouter from "./products";
import reviewsRouter from "./reviews";
import recipesRouter from "./recipes";
import sellersRouter from "./sellers";
import cartRouter from "./cart";
import ordersRouter from "./orders";
import dashboardRouter from "./dashboard";
import marketplaceRouter from "./marketplace";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(categoriesRouter);
router.use(productsRouter);
router.use(reviewsRouter);
router.use(recipesRouter);
router.use(sellersRouter);
router.use(cartRouter);
router.use(ordersRouter);
router.use(dashboardRouter);
router.use(marketplaceRouter);

export default router;
