import { ObjectId } from "mongodb";
import { getCollection } from "../../../../lib/mongodb";
import { requireAdmin } from "../../../../lib/adminAuth";

const clean = (v) => (typeof v === "string" ? v.trim().slice(0, 300) : "");

const editableRequired = [
  "teamName",
  "captainName",
  "captainPhone",
  "captainEmail",
  "viceCaptainName",
  "viceCaptainPhone",
];

// Admin only: edits (PUT) or deletes (DELETE) one KPL Season 4 registration.
export default async function handler(req, res) {
  if (req.method !== "DELETE" && req.method !== "PUT") {
    res.setHeader("Allow", ["PUT", "DELETE"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  if (!(await requireAdmin(req, res))) return;

  const { id } = req.query;
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid registration id" });
  }

  if (req.method === "PUT") {
    try {
      const body = req.body || {};
      const data = {
        teamName: clean(body.teamName),
        shortName: clean(body.shortName),
        city: clean(body.city),
        ownerName: clean(body.ownerName),
        captainName: clean(body.captainName),
        captainPhone: clean(body.captainPhone),
        captainEmail: clean(body.captainEmail),
        viceCaptainName: clean(body.viceCaptainName),
        viceCaptainPhone: clean(body.viceCaptainPhone),
      };

      const missing = editableRequired.filter((k) => !data[k]);
      if (missing.length) {
        return res.status(400).json({ error: `Missing required fields: ${missing.join(", ")}` });
      }
      if (!/^\d{10}$/.test(data.captainPhone) || !/^\d{10}$/.test(data.viceCaptainPhone)) {
        return res.status(400).json({ error: "Phone numbers must be 10 digits" });
      }

      const collection = await getCollection("kpl4_team_registrations");
      const _id = new ObjectId(id);
      const teamNameLower = data.teamName.toLowerCase();
      const duplicate = await collection.findOne({ teamNameLower, _id: { $ne: _id } });
      if (duplicate) {
        return res.status(409).json({ error: "A team with this name is already registered" });
      }

      const result = await collection.updateOne(
        { _id },
        { $set: { ...data, teamNameLower, updatedAt: new Date() } }
      );
      if (result.matchedCount === 0) {
        return res.status(404).json({ error: "Registration not found" });
      }
      return res.status(200).json({ success: true, ...data });
    } catch (error) {
      console.error("Error updating registration:", error);
      return res.status(500).json({ error: "Failed to update registration" });
    }
  }

  try {
    const collection = await getCollection("kpl4_team_registrations");
    const registration = await collection.findOne({ _id: new ObjectId(id) });
    if (!registration) {
      return res.status(404).json({ error: "Registration not found" });
    }

    await collection.deleteOne({ _id: new ObjectId(id) });

    // Remove the uploaded screenshot too, but only if it is one of this feature's uploads.
    const match = /^\/api\/images\/(payment_[\w-]+)$/.exec(registration.paymentScreenshot || "");
    if (match) {
      const images = await getCollection("images");
      await images.deleteOne({ _id: match[1], category: "kpl4_payment" });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error deleting registration:", error);
    return res.status(500).json({ error: "Failed to delete registration" });
  }
}
