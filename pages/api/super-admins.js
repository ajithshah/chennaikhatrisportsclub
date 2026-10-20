import { getCollection } from "../../lib/mongodb";
import { getSuperAdminEmails } from "../../lib/superAdmins";
import { getUserFromRequest, isSuperAdminRequest } from "../../lib/adminAuth";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Super admin only: read or replace the list of super admin emails.
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (!(await isSuperAdminRequest(req))) {
    return res.status(403).json({ error: "Only a super admin can manage super admins" });
  }

  if (req.method === "GET") {
    try {
      return res.status(200).json({ emails: await getSuperAdminEmails() });
    } catch (error) {
      console.error("Error loading super admins:", error);
      return res.status(500).json({ error: "Failed to load super admins" });
    }
  }

  if (req.method === "PUT") {
    try {
      if (!Array.isArray(req.body?.emails)) {
        return res.status(400).json({ error: "Provide a list of emails" });
      }
      const emails = [
        ...new Set(
          req.body.emails
            .map((e) => (typeof e === "string" ? e.trim().toLowerCase() : ""))
            .filter(Boolean)
        ),
      ];
      if (emails.length === 0) return res.status(400).json({ error: "Keep at least one super admin" });
      if (emails.length > 10) return res.status(400).json({ error: "Use at most 10 super admins" });
      const invalid = emails.find((e) => !EMAIL_PATTERN.test(e));
      if (invalid) return res.status(400).json({ error: `"${invalid}" is not a valid email` });

      // Never let a super admin remove themselves (avoids locking everyone out)
      const me = await getUserFromRequest(req);
      if (!emails.includes((me?.email || "").toLowerCase())) {
        return res.status(400).json({ error: "You can't remove your own email" });
      }

      const collection = await getCollection("app_settings");
      await collection.updateOne(
        { _id: "superAdmins" },
        { $set: { emails, updatedAt: new Date() } },
        { upsert: true }
      );
      return res.status(200).json({ emails });
    } catch (error) {
      console.error("Error saving super admins:", error);
      return res.status(500).json({ error: "Failed to save super admins" });
    }
  }

  res.setHeader("Allow", ["GET", "PUT"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
