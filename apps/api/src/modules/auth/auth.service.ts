import bcrypt from "bcryptjs";
import { UserModel, type UserDocument } from "../users/user.model.js";
import { AppError } from "../../utils/AppError.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/jwt.js";
import type { RegisterInput, LoginInput } from "@fixora/validation";

const SALT_ROUNDS = 12;

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
