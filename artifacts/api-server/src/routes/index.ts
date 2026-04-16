import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import demoBookingsRouter from "./demo-bookings.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/demo-bookings", demoBookingsRouter);

export default router;
