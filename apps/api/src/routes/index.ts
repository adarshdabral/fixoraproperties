import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import userRoutes from "../modules/users/user.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);

// Additional module routers (properties, search, shortlists, inquiries,
// leads, negotiations, transactions, commissions, ai, whatsapp,
// notifications, analytics, admin, uploads) are mounted here as each
// module is implemented — see docs/ARCHITECTURE.md for the full API map.

export default router;
