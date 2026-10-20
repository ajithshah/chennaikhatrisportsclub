import { getSettings } from "./settings";
import { requireAdmin } from "./adminAuth";

// Season 3 data (teams, matches, auction) is readable by everyone only while the super admin
// has "Season 3 pages" switched on; otherwise only admins can read it.
// Sends a 401/403 and returns false when the request is not allowed.
export async function allowSeason3Read(req, res) {
  try {
    const { season3Visible } = await getSettings();
    if (season3Visible) return true;
  } catch (error) {
    console.error("Failed to read settings:", error);
  }
  return requireAdmin(req, res);
}
