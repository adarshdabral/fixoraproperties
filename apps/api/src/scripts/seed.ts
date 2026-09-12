/**
 * Idempotent seed script — safe to re-run. Upserts by email so it never
 * duplicates accounts. The platform must never depend on this data being
 * present (see docs/DATABASE.md); it exists purely to exercise every role
 * during development.
 */
import bcrypt from "bcryptjs";
import { connectDatabase, disconnectDatabase } from "../config/db.js";
import { logger } from "../config/logger.js";
import { UserModel } from "../modules/users/user.model.js";
import { PropertyModel } from "../modules/properties/property.model.js";
import { generateUniqueSlug } from "../modules/properties/property.slug.js";

const SEED_PASSWORD = "Passw0rd1!";

interface SeedUser {
  name: string;
  email: string;
  phone: string;
  role: "SUPER_ADMIN" | "ADMIN" | "BROKER" | "SELLER" | "BUYER";
  brokerProfile?: { title: string; active: boolean };
}

const SEED_USERS: SeedUser[] = [
  { name: "Fixora Super Admin", email: "superadmin@fixora.dev", phone: "9000000001", role: "SUPER_ADMIN" },
  { name: "Fixora Admin", email: "admin@fixora.dev", phone: "9000000002", role: "ADMIN" },
  {
    name: "Vansh Kakkar",
    email: "vansh.kakkar@fixora.dev",
    phone: "9000000003",
    role: "BROKER",
    brokerProfile: { title: "Fixora Representative", active: true },
  },
  {
    name: "Dr. Neeraj Sengar",
    email: "neeraj.sengar@fixora.dev",
    phone: "9000000004",
    role: "BROKER",
    brokerProfile: { title: "Fixora Representative", active: true },
  },
  { name: "Demo Seller", email: "seller@fixora.dev", phone: "9000000005", role: "SELLER" },
  { name: "Demo Buyer", email: "buyer@fixora.dev", phone: "9000000006", role: "BUYER" },
];

async function seedUsers() {
  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 12);
  const ids: Record<string, string> = {};

  for (const u of SEED_USERS) {
    const user = await UserModel.findOneAndUpdate(
      { email: u.email },
      {
        $setOnInsert: {
          name: u.name,
          email: u.email,
          phone: u.phone,
          passwordHash,
          role: u.role,
          brokerProfile: u.brokerProfile,
        },
      },
      { upsert: true, new: true }
    );
    ids[u.email] = user.id;
    logger.info(`Seeded user: ${u.email} (${u.role})`);
  }
  return ids;
}

async function seedDemoProperty(sellerId: string) {
  const existing = await PropertyModel.findOne({ title: "Demo Published 3BHK in Chandigarh" });
  if (existing) return;

  const slug = await generateUniqueSlug("Demo Published 3BHK in Chandigarh");
  await PropertyModel.create({
    sellerId,
    title: "Demo Published 3BHK in Chandigarh",
    slug,
    description:
      "A seeded, published demo listing so the public search and property pages have real data to render in development.",
    propertyType: "apartment",
    category: "apartments",
    listingType: "sale",
    location: { address: "Sector 22", city: "Chandigarh", state: "Chandigarh", pincode: "160022" },
    price: { amount: 8000000, currency: "INR", negotiable: true },
    specifications: { bedrooms: 3, bathrooms: 2, area: 1450, areaUnit: "sqft", parking: 1 },
    amenities: ["parking", "lift", "power backup"],
    constructionStatus: "ready_to_move",
    possessionStatus: "immediate",
    status: "published",
    featured: true,
  });
  logger.info("Seeded demo published property");
}

async function main() {
  await connectDatabase();
  const ids = await seedUsers();
  await seedDemoProperty(ids["seller@fixora.dev"]!);
  logger.info(`Seed complete. All seeded accounts share the password: ${SEED_PASSWORD}`);
  await disconnectDatabase();
}

main().catch((err) => {
  logger.error({ err }, "Seed script failed");
  process.exit(1);
});
