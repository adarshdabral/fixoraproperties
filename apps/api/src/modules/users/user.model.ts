import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";
import { ROLES } from "@fixora/types";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true, index: true },
    phone: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true, select: false },

    role: { type: String, enum: ROLES, required: true, default: "BUYER" },

    isActive: { type: Boolean, default: true },
    emailVerifiedAt: { type: Date, default: null },

    /** Bumped on password change or explicit "logout everywhere" to invalidate outstanding refresh tokens. */
    tokenVersion: { type: Number, default: 0 },

    /**
     * Broker-specific operational fields. Kept on the User document rather
     * than a separate collection since brokers are a small, low-churn set;
     * revisit if broker profile data grows significantly.
     */
    brokerProfile: {
      type: new Schema(
        {
          title: { type: String, trim: true },
          active: { type: Boolean, default: true },
        },
        { _id: false }
      ),
      default: undefined,
    },

    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true }
);

userSchema.index({ role: 1 });

export type UserDocument = HydratedDocument<InferSchemaType<typeof userSchema>>;
export const UserModel = model("User", userSchema);
