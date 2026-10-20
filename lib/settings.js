import { getCollection } from "./mongodb";
import { SETTING_DEFAULTS, BOOLEAN_SETTINGS } from "./settingDefaults";

export { SETTING_DEFAULTS };

const QR_URL_PATTERN = /^\/api\/images\/qr_[\w-]+$/;

// Settings are stored in the `app_settings` collection (document _id "features").
export async function getSettings() {
  const collection = await getCollection("app_settings");
  const doc = await collection.findOne({ _id: "features" });
  const settings = { ...SETTING_DEFAULTS };

  for (const key of BOOLEAN_SETTINGS) {
    if (typeof doc?.[key] === "boolean") settings[key] = doc[key];
  }
  if (Array.isArray(doc?.bannerLines)) settings.bannerLines = doc.bannerLines;
  if (Array.isArray(doc?.organizers)) settings.organizers = doc.organizers;
  if (typeof doc?.upiId === "string") settings.upiId = doc.upiId;
  if (typeof doc?.paymentQrUrl === "string") settings.paymentQrUrl = doc.paymentQrUrl;
  return settings;
}

// Validates a partial settings update. Returns { updates } or { error }.
export function sanitizeSettingsUpdate(body = {}) {
  const updates = {};

  for (const key of BOOLEAN_SETTINGS) {
    if (typeof body[key] === "boolean") updates[key] = body[key];
  }

  if (body.bannerLines !== undefined) {
    if (!Array.isArray(body.bannerLines)) return { error: "Announcement lines must be a list" };
    const lines = body.bannerLines
      .map((l) => (typeof l === "string" ? l.trim() : ""))
      .filter(Boolean);
    if (lines.length > 10) return { error: "Use at most 10 announcement lines" };
    if (lines.some((l) => l.length > 200)) return { error: "Each announcement line must be under 200 characters" };
    updates.bannerLines = lines;
  }

  if (body.organizers !== undefined) {
    if (!Array.isArray(body.organizers)) return { error: "Organizers must be a list" };
    const organizers = [];
    for (const o of body.organizers) {
      const name = typeof o?.name === "string" ? o.name.trim() : "";
      const phone = typeof o?.phone === "string" ? o.phone.replace(/\D/g, "").slice(-10) : "";
      if (!name && !phone) continue;
      if (!name || name.length > 60) return { error: "Each organizer needs a name (up to 60 characters)" };
      if (!/^[6-9]\d{9}$/.test(phone)) return { error: `Enter a valid 10-digit phone number for ${name}` };
      organizers.push({ name, phone });
    }
    if (organizers.length === 0) return { error: "Add at least one organizer" };
    if (organizers.length > 8) return { error: "Use at most 8 organizers" };
    updates.organizers = organizers;
  }

  if (body.upiId !== undefined) {
    const upiId = typeof body.upiId === "string" ? body.upiId.trim() : "";
    if (upiId && !/^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(upiId)) {
      return { error: "Enter a valid UPI ID, like name@bank" };
    }
    updates.upiId = upiId;
  }

  if (body.paymentQrUrl !== undefined) {
    const url = typeof body.paymentQrUrl === "string" ? body.paymentQrUrl.trim() : "";
    if (url && !QR_URL_PATTERN.test(url)) return { error: "Invalid QR image" };
    updates.paymentQrUrl = url;
  }

  if (Object.keys(updates).length === 0) return { error: "No valid settings provided" };
  return { updates };
}
