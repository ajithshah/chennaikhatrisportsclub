// Defaults for every setting the super admin can change. Safe to import on the client and server.
export const SETTING_DEFAULTS = {
  // On/off switches
  registrationOpen: false, // KPL Season 4 team registration
  showTeamInfo: false, // team name + "View Team" on profiles
  season3Visible: false, // /team, /schedule, /auction pages (and their data) visible to everyone
  oneTapEnabled: true, // Google One Tap auto sign-in prompt
  signupsOpen: true, // allow brand-new members to join
  bannerEnabled: true, // scrolling announcement banner on the home page

  // Values
  bannerLines: [
    "🔥 KPL Season 4 is here! Team registration opens Saturday, 24th October 2026",
    "💰 Registration Fee: Rs. 6000/-",
    "🏏 KPL Season 4 on 23rd & 24th January 2027",
  ],
  organizers: [
    { name: "Vinod Kumar", phone: "9840880873" },
    { name: "Sushil", phone: "9841712284" },
    { name: "Rajini", phone: "9841526709" },
  ],
  upiId: "",
  paymentQrUrl: "",
};

export const BOOLEAN_SETTINGS = [
  "registrationOpen",
  "showTeamInfo",
  "season3Visible",
  "oneTapEnabled",
  "signupsOpen",
  "bannerEnabled",
];
