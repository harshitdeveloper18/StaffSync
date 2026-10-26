import { Router } from "express";
import { auth, allowRoles } from "../auth.js";
import { get_root_0, get_api_health_1, get_api_performance_reviews_14, post_api_performance_reviews_15 } from "../controllers/systemController.js";

const router = Router();

router.get("/", get_root_0);

router.get("/api/health", get_api_health_1);

router.get("/api/performance-reviews", auth, allowRoles("Manager", "HR", "Admin"), get_api_performance_reviews_14);

router.post("/api/performance-reviews", auth, allowRoles("Manager"), post_api_performance_reviews_15);

export default router;
