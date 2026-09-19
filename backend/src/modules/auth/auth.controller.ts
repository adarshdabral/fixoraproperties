import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendCreated, sendSuccess } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/AppError.js";
import * as authService from "./auth.service.js";
import { setAuthCookies, clearAuthCookies } from "./auth.cookies.js";
import { toPrivateUserDTO } from "../users/user.dto.js";
import { recordAudit } from "../audit/audit.service.js";
import { AUTH_COOKIES } from "../../shared/config/index.js";
import type { RegisterInput, LoginInput, ForgotPasswordInput, ResetPasswordInput } from "../../shared/validation/index.js";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as RegisterInput;
  const user = await authService.registerUser(input);
  const { accessToken, refreshToken } = authService.issueTokens(user);
  setAuthCookies(res, accessToken, refreshToken);
  sendCreated(res, { user: toPrivateUserDTO(user) }, "Account created successfully");
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as LoginInput;
  const user = await authService.validateCredentials(input);
  const { accessToken, refreshToken } = authService.issueTokens(user);
  setAuthCookies(res, accessToken, refreshToken);
  await recordAudit({ req, actorId: user.id, actorRole: user.role, action: "LOGIN", resourceType: "User", resourceId: user.id });
  sendSuccess(res, { user: toPrivateUserDTO(user) }, "Logged in successfully");
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.[AUTH_COOKIES.refreshToken];
  if (!token) throw AppError.unauthorized("No active session");

  const { user, accessToken, refreshToken } = await authService.rotateRefreshToken(token);
  setAuthCookies(res, accessToken, refreshToken);
  sendSuccess(res, { user: toPrivateUserDTO(user) }, "Session refreshed");
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  if (req.user) {
    await recordAudit({ req, action: "LOGOUT", resourceType: "User", resourceId: req.user.id });
  }
  clearAuthCookies(res);
  sendSuccess(res, null, "Logged out successfully");
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body as ForgotPasswordInput;
  await authService.requestPasswordReset(email);
  // Always the same response, whether or not the email exists — prevents account enumeration.
  sendSuccess(res, null, "If an account exists for that email, a reset link has been sent.");
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, password } = req.body as ResetPasswordInput;
  await authService.resetPassword(token, password);
  sendSuccess(res, null, "Password reset successfully. Please log in with your new password.");
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const { UserModel } = await import("../users/user.model.js");
  const user = await UserModel.findById(req.user!.id);
  if (!user) throw AppError.unauthorized();
  sendSuccess(res, { user: toPrivateUserDTO(user) });
});
