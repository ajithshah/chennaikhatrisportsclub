import { getCollection } from "../../lib/mongodb";
import { getSettings, sanitizeSettingsUpdate } from "../../lib/settings";
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
      const { updates, error } = sanitizeSettingsUpdate(req.body);
      if (error) return res.status(400).json({ error });

      const before = await getSettings();
      const collection = await getCollection("app_settings");
      await collection.updateOne(
        { _id: "features" },
        { $set: { ...updates, updatedAt: new Date() } },
        { upsert: true }
      );

      // When the QR image is replaced or removed, delete the old uploaded image
      if (updates.paymentQrUrl !== undefined && before.paymentQrUrl && before.paymentQrUrl !== updates.paymentQrUrl) {
        const oldId = before.paymentQrUrl.replace("/api/images/", "");
        const images = await getCollection("images");
        await images.deleteOne({ _id: oldId, category: "payment_qr" });
      }

      return res.status(200).json({ settings: await getSettings(), canManage: true });
    } catch (error) {
      console.error("Error saving settings:", error);
      return res.status(500).json({ error: "Failed to save settings" });
    }
  }

  res.setHeader("Allow", ["GET", "PUT"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
