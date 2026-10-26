import { Router } from "express";
import { auth, allowRoles } from "../auth.js";
import { get_api_announcements_23, post_api_announcements_24, delete_api_announcements_id_25, get_api_trainings_26, post_api_trainings_27 } from "../controllers/communicationsController.js";

const router = Router();

router.get("/api/announcements", auth, get_api_announcements_23);

router.post("/api/announcements", auth, allowRoles("Admin", "HR"), post_api_announcements_24);

router.delete("/api/announcements/:id", auth, allowRoles("Admin", "HR"), delete_api_announcements_id_25);

router.get("/api/trainings", auth, get_api_trainings_26);

router.post("/api/trainings", auth, allowRoles("Admin", "HR"), post_api_trainings_27);

export default router;
