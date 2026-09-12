import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { UserModel, type UserDocument } from "../users/user.model.js";
import { AppError } from "../../utils/AppError.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/jwt.js";
import { sendEmail } from "../../utils/email.js";
import { env } from "../../config/env.js";
import { logger } from "../../config/logger.js";
import type { RegisterInput, LoginInput } from "@fixora/validation";

const SALT_ROUNDS = 12;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

export async function registerUser(input: RegisterInput): Promise<UserDocument> {
  const existing = await UserModel.findOne({ email: input.email });
  if (existing) throw AppError.conflict("An account with this email already exists");

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  return UserModel.create({
    name: input.name,
    email: input.email,
    phone: input.phone,
    passwordHash,
    role: input.role,
  });
}

export async function validateCredentials(input: LoginInput): Promise<UserDocument> {
  const user = await UserModel.findOne({ email: input.email }).select("+passwordHash");
  if (!user) throw AppError.unauthorized("Invalid email or password");
  if (!user.isActive) throw AppError.forbidden("This account has been deactivated");

  const match = await bcrypt.compare(input.password, user.passwordHash);
  if (!match) throw AppError.unauthorized("Invalid email or password");

  user.lastLoginAt = new Date();
  await user.save();

  return user;
}

export function issueTokens(user: UserDocument) {
  const accessToken = signAccessToken({ sub: user.id, role: user.role as never, tokenVersion: user.tokenVersion });
  const refreshToken = signRefreshToken({ sub: user.id, tokenVersion: user.tokenVersion });
  return { accessToken, refreshToken };
}

export async function rotateRefreshToken(refreshToken: string) {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw AppError.unauthorized("Invalid or expired session");
  }

  const user = await UserModel.findById(payload.sub);
  if (!user || !user.isActive) throw AppError.unauthorized("Invalid or expired session");
  if (user.tokenVersion !== payload.tokenVersion) throw AppError.unauthorized("Session revoked");

  return { user, ...issueTokens(user) };
}

/** Invalidates every outstanding access/refresh token for this user (password change, "logout everywhere"). */
export async function bumpTokenVersion(userId: string): Promise<void> {
  await UserModel.updateOne({ _id: userId }, { $inc: { tokenVersion: 1 } });
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Always resolves without revealing whether the email exists, to avoid
 * account enumeration. The raw token is only ever emailed to the user —
 * only its hash is persisted, mirroring how passwords are stored.
 */
export async function requestPasswordReset(email: string): Promise<void> {
  const user = await UserModel.findOne({ email });
  if (!user) return;

  const token = crypto.randomBytes(32).toString("hex");
  user.resetPasswordTokenHash = hashToken(token);
  user.resetPasswordExpiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);
  await user.save();

  const resetUrl = `${env.WEB_APP_URL}/auth/reset-password?token=${token}`;
  logger.info({ userId: user.id }, "Password reset requested");

  await sendEmail({
    to: user.email,
    subject: "Reset your Fixora Properties password",
    html: `<p>Click the link below to reset your password. This link expires in 1 hour.</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
  });
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const user = await UserModel.findOne({
    resetPasswordTokenHash: hashToken(token),
    resetPasswordExpiresAt: { $gt: new Date() },
  }).select("+resetPasswordTokenHash +resetPasswordExpiresAt");

  if (!user) throw AppError.badRequest("This reset link is invalid or has expired");

  user.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  user.resetPasswordTokenHash = null;
  user.resetPasswordExpiresAt = null;
  user.tokenVersion += 1;
  await user.save();
}
