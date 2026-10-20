import { ObjectId } from "mongodb";
import { getCollection } from "../../../../lib/mongodb";
import { requireAdmin } from "../../../../lib/adminAuth";

// Admin only: deletes one KPL Season 4 registration (and its payment screenshot).
export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    res.setHeader("Allow", ["DELETE"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  if (!(await requireAdmin(req, res))) return;

  const { id } = req.query;
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid registration id" });
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
