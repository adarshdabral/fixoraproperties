import type { UserDocument } from "./user.model.js";

/**
 * Public-facing user shape. Never includes email/phone — those are private
 * contact details and must only ever reach the user themself or staff with
 * a legitimate reason (see SECURITY.md: seller contact protection).
 */
export interface PublicUserDTO {
  id: string;
  name: string;
  role: string;
}

/** Returned to the user about themself, or to admins/brokers who need contact info. */
export interface PrivateUserDTO extends PublicUserDTO {
  email: string;
  phone: string;
  isActive: boolean;
  createdAt: string;
}

export function toPublicUserDTO(user: UserDocument): PublicUserDTO {
  return {
    id: user.id,
    name: user.name,
    role: user.role,
  };
}

export function toPrivateUserDTO(user: UserDocument): PrivateUserDTO {
  return {
    ...toPublicUserDTO(user),
    email: user.email,
    phone: user.phone,
    isActive: user.isActive,
    createdAt: user.createdAt.toISOString(),
  };
}
