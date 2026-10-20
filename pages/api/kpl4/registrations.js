import { getCollection } from "../../../lib/mongodb";
import { getUidFromRequest, requireAdmin } from "../../../lib/adminAuth";
import { getSettings } from "../../../lib/settings";

// New collection for KPL Season 4; existing data is not touched.
const COLLECTION = "kpl4_team_registrations";

const required = [
  "teamName",
  "captainName",
  "captainPhone",
  "captainEmail",
  "viceCaptainName",
  "viceCaptainPhone",
  "paymentScreenshot",
];

const clean = (v) => (typeof v === "string" ? v.trim().slice(0, 300) : "");

export default async function handler(req, res) {
  if (req.method === "GET") {
    // Admin only: list all registrations
    if (!(await requireAdmin(req, res))) return;
    const collection = await getCollection(COLLECTION);
    const docs = await collection.find({}).sort({ createdAt: -1 }).toArray();
    return res.status(200).json(docs.map((d) => ({ ...d, id: d._id.toString() })));
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { registrationOpen } = await getSettings();
    if (!registrationOpen) {
      return res.status(403).json({ error: "Team registration is currently closed" });
    }

    const uid = await getUidFromRequest(req);
    if (!uid) return res.status(401).json({ error: "Please sign in to register a team" });

    const body = req.body || {};
    const data = {
      teamName: clean(body.teamName),
      city: clean(body.city),
      captainName: clean(body.captainName),
      captainPhone: clean(body.captainPhone),
      captainEmail: clean(body.captainEmail),
      viceCaptainName: clean(body.viceCaptainName),
      viceCaptainPhone: clean(body.viceCaptainPhone),
      paymentScreenshot: clean(body.paymentScreenshot),
    };

    const missing = required.filter((k) => !data[k]);
    if (missing.length) {
      return res.status(400).json({ error: `Missing required fields: ${missing.join(", ")}` });
    }
    if (!/^\d{10}$/.test(data.captainPhone) || !/^\d{10}$/.test(data.viceCaptainPhone)) {
      return res.status(400).json({ error: "Phone numbers must be 10 digits" });
    }

    if (!/^\/api\/images\/payment_[\w-]+$/.test(data.paymentScreenshot)) {
      return res.status(400).json({ error: "Please upload your payment screenshot" });
    }

    const collection = await getCollection(COLLECTION);
    const existing = await collection.findOne({
      teamNameLower: data.teamName.toLowerCase(),
    });
    if (existing) {
      return res.status(409).json({ error: "A team with this name is already registered" });
    }

    const doc = {
      ...data,
      teamNameLower: data.teamName.toLowerCase(),
      registeredBy: uid,
      status: "pending",
      season: 4,
      createdAt: new Date(),
    };
    const result = await collection.insertOne(doc);
    return res.status(201).json({ id: result.insertedId.toString() });
  } catch (error) {
    console.error("Error registering team:", error);
    return res.status(500).json({ error: "Failed to register team" });
  }
}
