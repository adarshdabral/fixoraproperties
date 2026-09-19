import type { UserDocument } from "./user.model.js";
import type { PublicUserDTO, PrivateUserDTO } from "@fixora/types";

export type { PublicUserDTO, PrivateUserDTO };

/**
 * Public-facing user shape. Never includes email/phone — those are private
 * contact details and must only ever reach the user themself or staff with
 * a legitimate reason (see SECURITY.md: seller contact protection).
 */
export function toPublicUserDTO(user: UserDocument): PublicUserDTO {
  return {
    id: user.id,
    name: user.name,
    role: user.role,
  };
}

/** Returned to the user about themself, or to admin staff who need contact info. */
export function toPrivateUserDTO(user: UserDocument): PrivateUserDTO {
  return {
    ...toPublicUserDTO(user),
    email: user.email,
    phone: user.phone,
    isActive: user.isActive,
    createdAt: user.createdAt.toISOString(),
  };
}
