import { getCollection } from "../../lib/mongodb";
import { getSettings, SETTING_DEFAULTS } from "../../lib/settings";
import { isSuperAdminRequest } from "../../lib/adminAuth";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "GET") {
    try {
      const settings = await getSettings();
      const canManage = await isSuperAdminRequest(req);
      return res.status(200).json({ settings, canManage });
    } catch (error) {
      console.error("Error loading settings:", error);
      return res.status(500).json({ error: "Failed to load settings" });
    }
  }

  if (req.method === "PUT") {
    if (!(await isSuperAdminRequest(req))) {
      return res.status(403).json({ error: "Only the super admin can change settings" });
    }
    try {
      const updates = {};
      for (const key of Object.keys(SETTING_DEFAULTS)) {
        if (typeof req.body?.[key] === "boolean") updates[key] = req.body[key];
      }
      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: "No valid settings provided" });
      }
      const collection = await getCollection("app_settings");
      await collection.updateOne(
        { _id: "features" },
        { $set: { ...updates, updatedAt: new Date() } },
        { upsert: true }
      );
      return res.status(200).json({ settings: await getSettings(), canManage: true });
    } catch (error) {
      console.error("Error saving settings:", error);
      return res.status(500).json({ error: "Failed to save settings" });
    }
  }

  res.setHeader("Allow", ["GET", "PUT"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
