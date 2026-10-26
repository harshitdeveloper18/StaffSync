import { Router } from "express";
import { auth, allowRoles } from "../auth.js";
import { get_api_users_7, patch_api_users_id_role_8, get_api_employees_10, post_api_employees_11, put_api_employees_id_12, put_api_profile_13, delete_api_employees_id_16 } from "../controllers/employeesController.js";

const router = Router();

router.get("/api/users", auth, allowRoles("Admin"), get_api_users_7);

router.patch("/api/users/:id/role", auth, allowRoles("Admin"), patch_api_users_id_role_8);

router.get("/api/employees", auth, get_api_employees_10);

router.post("/api/employees", auth, allowRoles("Admin", "HR"), post_api_employees_11);

router.put("/api/employees/:id", auth, allowRoles("Admin", "HR"), put_api_employees_id_12);

router.put("/api/profile", auth, put_api_profile_13);

router.delete("/api/employees/:id", auth, allowRoles("Admin", "HR"), delete_api_employees_id_16);

export default router;
