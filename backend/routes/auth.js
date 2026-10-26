import { Router } from "express";
import { auth, allowRoles } from "../auth.js";
import { post_api_auth_login_4, post_api_auth_register_5, get_api_auth_me_6 } from "../controllers/authController.js";

const router = Router();

router.post("/api/auth/login", post_api_auth_login_4);

router.post("/api/auth/register", post_api_auth_register_5);

router.get("/api/auth/me", auth, get_api_auth_me_6);

export default router;
