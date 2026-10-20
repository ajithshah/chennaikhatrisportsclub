import { getCollection } from "./mongodb";

// Feature toggles managed by the super admin. Stored in the new `app_settings` collection.
export const SETTING_DEFAULTS = {
  registrationOpen: false, // KPL Season 4 team registration
  showTeamInfo: false, // team name + "View Team" on profiles
};

export async function getSettings() {
  const collection = await getCollection("app_settings");
  const doc = await collection.findOne({ _id: "features" });
  const settings = { ...SETTING_DEFAULTS };
  for (const key of Object.keys(SETTING_DEFAULTS)) {
    if (typeof doc?.[key] === "boolean") settings[key] = doc[key];
  }
  return settings;
}
