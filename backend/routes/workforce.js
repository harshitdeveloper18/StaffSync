import { Router } from "express";
import { auth, allowRoles } from "../auth.js";
import { get_api_leaves_17, post_api_leaves_18, patch_api_leaves_id_19, get_api_attendance_20, post_api_attendance_check_in_21, post_api_attendance_check_out_22 } from "../controllers/workforceController.js";

const router = Router();

router.get("/api/leaves", auth, get_api_leaves_17);

router.post("/api/leaves", auth, post_api_leaves_18);

router.patch("/api/leaves/:id", auth, allowRoles("Admin", "HR", "Manager"), patch_api_leaves_id_19);

router.get("/api/attendance", auth, get_api_attendance_20);

router.post("/api/attendance/check-in", auth, post_api_attendance_check_in_21);

router.post("/api/attendance/check-out", auth, post_api_attendance_check_out_22);

export default router;
