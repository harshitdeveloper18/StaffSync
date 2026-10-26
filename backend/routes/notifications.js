import { Router } from "express";
import { auth, allowRoles } from "../auth.js";
import { get_api_notifications_2, patch_api_notifications_id_read_3 } from "../controllers/notificationsController.js";

const router = Router();

router.get("/api/notifications", auth, get_api_notifications_2);

router.patch("/api/notifications/:id/read", auth, patch_api_notifications_id_read_3);

export default router;
