import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import userRoutes from "../modules/users/user.routes.js";
import propertyRoutes from "../modules/properties/property.routes.js";
import shortlistRoutes from "../modules/shortlists/shortlist.routes.js";
import inquiryRoutes from "../modules/inquiries/inquiry.routes.js";
import leadRoutes from "../modules/leads/lead.routes.js";
import adminRoutes from "../modules/admin/admin.routes.js";
import settingsRoutes from "../modules/settings/settings.routes.js";
import mediaRoutes from "../modules/media/media.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/properties", propertyRoutes);
router.use("/shortlists", shortlistRoutes);
router.use("/inquiries", inquiryRoutes);
router.use("/leads", leadRoutes);
router.use("/admin", adminRoutes);
router.use("/settings", settingsRoutes);
router.use("/media", mediaRoutes);

// Additional module routers (negotiations, transactions, commissions, ai,
// whatsapp, notifications, analytics, uploads) are mounted here as each
// module is implemented — see docs/ARCHITECTURE.md for the full API map.

export default router;
