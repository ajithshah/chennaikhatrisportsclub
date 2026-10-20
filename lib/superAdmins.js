import { getCollection } from "./mongodb";

// Super admin emails live in the `app_settings` collection (document _id "superAdmins").
// If that document doesn't exist yet, the SUPER_ADMIN_EMAILS environment variable is used as a
// first-run fallback so nobody is locked out.
export async function getSuperAdminEmails() {
  const collection = await getCollection("app_settings");
  const doc = await collection.findOne({ _id: "superAdmins" });
  if (Array.isArray(doc?.emails)) {
    return doc.emails.map((e) => String(e).trim().toLowerCase()).filter(Boolean);
  }
  return (process.env.SUPER_ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}
