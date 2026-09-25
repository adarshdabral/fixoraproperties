import { Router } from "express";
import { validate } from "../../middleware/validate.js";
import { requireAuth, optionalAuth } from "../../middleware/auth.js";
import { authRateLimit, refreshRateLimit } from "../../middleware/rateLimit.js";
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from "../../shared/validation/index.js";
import * as authController from "./auth.controller.js";

const router = Router();

router.post("/register", authRateLimit, validate(registerSchema), authController.register);
router.post("/login", authRateLimit, validate(loginSchema), authController.login);
router.post("/refresh", refreshRateLimit, authController.refresh);
// optionalAuth, not requireAuth: logout must still clear cookies once the 15-minute access token has expired.
router.post("/logout", optionalAuth(), authController.logout);
router.get("/me", requireAuth(), authController.me);
router.post("/forgot-password", authRateLimit, validate(forgotPasswordSchema), authController.forgotPassword);
router.post("/reset-password", authRateLimit, validate(resetPasswordSchema), authController.resetPassword);

export default router;
