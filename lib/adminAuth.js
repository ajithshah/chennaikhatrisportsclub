import { getCollection } from "./mongodb";

const FIREBASE_API_KEY = "AIzaSyArUZ5V8YGNq3pPJG92RfjPAJE_9TSf3g8";

// Returns { uid, email } for the request's Bearer token, or null if missing/invalid.
export async function getUserFromRequest(req) {
  const header = req.headers.authorization || "";
  const idToken = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!idToken) return null;

  const lookup = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    }
  );
  if (!lookup.ok) return null;
  const { users } = await lookup.json();
  const user = users?.[0];
  return user?.localId ? { uid: user.localId, email: user.email || "" } : null;
}

// Returns the Firebase uid for the request's Bearer token, or null if missing/invalid.
export async function getUidFromRequest(req) {
  return (await getUserFromRequest(req))?.uid || null;
}

// Super admins are listed (comma separated) in the SUPER_ADMIN_EMAILS environment variable.
export async function isSuperAdminRequest(req) {
  try {
    const user = await getUserFromRequest(req);
    if (!user?.email) return false;
    const allowed = (process.env.SUPER_ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    return allowed.includes(user.email.toLowerCase());
  } catch (error) {
    console.error("Super admin check failed:", error);
    return false;
  }
}

// Sends a 401/403 and returns false unless the request comes from an admin user.
export async function requireAdmin(req, res) {
  try {
    const uid = await getUidFromRequest(req);
    if (!uid) {
      res.status(401).json({ error: "Authentication required" });
      return false;
    }
    const usersCollection = await getCollection("users");
    const userDoc = await usersCollection.findOne({ _id: uid });
    if (!userDoc?.isAdmin) {
      res.status(403).json({ error: "Admin access required" });
      return false;
    }
    return true;
  } catch (error) {
    console.error("Admin check failed:", error);
    res.status(500).json({ error: "Authorization check failed" });
    return false;
  }
}
