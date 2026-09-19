import { Router } from "express";
import { validate } from "../../middleware/validate.js";
import { requireAuth } from "../../middleware/auth.js";
import { authRateLimit } from "../../middleware/rateLimit.js";
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from "../../shared/validation/index.js";
import * as authController from "./auth.controller.js";

const router = Router();

router.post("/register", authRateLimit, validate(registerSchema), authController.register);
router.post("/login", authRateLimit, validate(loginSchema), authController.login);
router.post("/refresh", authRateLimit, authController.refresh);
router.post("/logout", requireAuth(), authController.logout);
router.get("/me", requireAuth(), authController.me);
router.post("/forgot-password", authRateLimit, validate(forgotPasswordSchema), authController.forgotPassword);
router.post("/reset-password", authRateLimit, validate(resetPasswordSchema), authController.resetPassword);

export default router;
