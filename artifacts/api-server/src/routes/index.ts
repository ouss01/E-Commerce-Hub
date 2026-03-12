import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import auth from "./auth.js";
import products from "./products.js";
import categories from "./categories.js";
import orders from "./orders.js";
import users from "./users.js";
import wishlist from "./wishlist.js";
import reviews from "./reviews.js";
import newsletter from "./newsletter.js";
import admin from "./admin.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", auth);
router.use("/products", products);
router.use("/categories", categories);
router.use("/orders", orders);
router.use("/users", users);
router.use("/wishlist", wishlist);
router.use("/reviews", reviews);
router.use("/newsletter", newsletter);
router.use("/admin", admin);

export default router;
