import { Router } from "express";
import { auth, allowRoles } from "../auth.js";
import { get_api_dashboard_9 } from "../controllers/dashboardController.js";

const router = Router();

router.get("/api/dashboard", auth, get_api_dashboard_9);

export default router;
