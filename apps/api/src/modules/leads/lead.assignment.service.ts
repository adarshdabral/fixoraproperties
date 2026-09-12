import { UserModel } from "../users/user.model.js";
import { LeadModel } from "./lead.model.js";

const OPEN_STATUSES = ["new", "contacted", "qualified", "visit_scheduled", "negotiation"];

/**
 * Broker assignment as a swappable strategy, per the product requirement to
 * never hardcode "if lead then Vansh" branching. The default strategy is a
 * load-based round robin: the active broker with the fewest currently-open
 * leads gets the next one. Admins can always override via
 * lead.service#reassignLead(), which is what LEADS_ASSIGN protects.
 *
 * To add a different strategy later (e.g. by city, by specialization),
 * change only this function — nothing else in the codebase should know how
 * assignment is decided.
 */
export async function assignBroker(): Promise<string | null> {
  const activeBrokers = await UserModel.find({ role: "BROKER", isActive: true, "brokerProfile.active": true }).select(
    "_id"
  );
  if (activeBrokers.length === 0) return null;

  const brokerIds = activeBrokers.map((b) => b.id as string);
  const openCounts = await LeadModel.aggregate<{ _id: string; count: number }>([
    { $match: { assignedTo: { $in: activeBrokers.map((b) => b._id) }, status: { $in: OPEN_STATUSES } } },
    { $group: { _id: "$assignedTo", count: { $sum: 1 } } },
  ]);

  const countByBroker = new Map(openCounts.map((c) => [c._id.toString(), c.count]));
  let leastLoadedId = brokerIds[0]!;
  let leastLoad = countByBroker.get(leastLoadedId) ?? 0;

  for (const id of brokerIds) {
    const load = countByBroker.get(id) ?? 0;
    if (load < leastLoad) {
      leastLoad = load;
      leastLoadedId = id;
    }
  }

  return leastLoadedId;
}
