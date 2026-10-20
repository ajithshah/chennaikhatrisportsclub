# Chennai Khatri Sports Club

Website for the Chennai Khatri Sports Club and its **Khatri Premier League (KPL)** cricket tournament.
Members sign in with Google, manage their profile, and (for KPL Season 4) teams register online.
Admins manage users, teams, schedules and registrations from an admin panel.

## Tech stack

- [Next.js](https://nextjs.org) 15 (pages router) and React 19
- React-Bootstrap / Bootstrap 4, CSS modules
- Firebase Authentication (Google sign-in, Google One Tap)
- MongoDB (via the `mongodb` driver) for all data, images included
- Deployed on Vercel

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

Create a `.env.local` file in the project root:

| Variable | Purpose |
| --- | --- |
| `MONGO_URI` | MongoDB connection string |
| `MONGO_DB` | Database name |
| `MONGO_COLLECTION` | Legacy collection setting |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google web client ID for One Tap auto sign-in (optional; One Tap stays off without it) |
| `SUPER_ADMIN_EMAILS` | Optional first-run fallback only. Super admins are normally stored in the database (see below) |

> Only run `npm run dev` **or** `npm run build` at one time. Both write to the `.next` folder, and mixing them
> gives "missing manifest" errors. If that happens, stop the server, delete `.next` and start again.

Other scripts: `npm run build`, `npm start`. The `scripts/` folder holds one-off data scripts (seeding teams,
migrating auction players).

## Pages

| Route | What it is |
| --- | --- |
| `/` | Home: KPL Season 4 hero, announcement banner, gallery, sign in |
| `/about`, `/contact` | Club story, organizers; contact numbers, map, socials |
| `/kpl-season-4` | KPL Season 4 details and "Register Your Team" button |
| `/team-registration` | Season 4 team registration form with payment QR and screenshot upload |
| `/profile`, `/profile/edit` | Member profile and editing |
| `/team`, `/schedule`, `/auction` | Season 3 pages (admin-only unless switched on, see Settings) |
| `/adminpanel` | Admin dashboard |
| `/adminpanel/users` | Manage users |
| `/adminpanel/cricket` | Manage KPL cricket teams |
| `/adminpanel/matches` | Match schedule |
| `/adminpanel/kpl4` | KPL Season 4 registrations: view, edit, delete, print |
| `/adminpanel/settings` | Site settings (super admin only) |

## Roles

- **Member:** any signed-in user.
- **Admin:** `isAdmin: true` on the user's document. Can open the admin panel and see Season 3 data.
- **Super admin:** can change site settings. The list of super admin emails is stored in MongoDB
  (`app_settings`, document `_id: "superAdmins"`) and is edited under **Admin Panel → Site Settings → Access**.
  Emails must match the Google account the person signs in with. You can't remove yourself or the last super admin.

## Site settings (super admin)

`/adminpanel/settings` changes behaviour for all users immediately, without a deploy:

- **Switches:** KPL Season 4 registration open, Season 3 pages visible to everyone, team info on profiles,
  new member sign-ups, Google One Tap, announcement banner.
- **Content:** announcement banner lines, organizer names and phone numbers (Contact page).
- **Payment:** payment QR image upload and UPI ID (shown on the registration form).
- **Access:** manage super admins.

Defaults live in `lib/settingDefaults.js`; validation in `lib/settings.js`. The public `GET /api/settings`
returns the current values; only super admins can `PUT`.

## Data (MongoDB collections)

| Collection | Contents |
| --- | --- |
| `users` | Member profiles (document `_id` is the Firebase uid) |
| `cricket_teams`, `matches` | KPL Season 3 teams and match schedule |
| `cricket_auction_teams`, `cricket_auction_players` | Season 3 auction data |
| `kpl4_team_registrations` | KPL Season 4 team registrations |
| `app_settings` | Site settings (`features`) and super admins (`superAdmins`) |
| `images` | Uploaded images stored as base64 (profile photos, payment screenshots, payment QR), served by `/api/images/[id]` |

Season 3 data is kept in the database and hidden from non-admins by the "Season 3 pages" switch; nothing is deleted.

## API notes

- API routes live in `pages/api`. Admin-only routes verify the caller's Firebase ID token on the server
  (`lib/adminAuth.js`); the browser attaches it with `lib/authFetch.js`.
- Reads of Season 3 data (`/api/teams`, `/api/matches`, `/api/auction/*`) are blocked for non-admins while the Season 3 switch is off.
  Writes to those routes are not restricted yet.
- `POST /api/kpl4/registrations` requires sign-in and an open registration; `GET`, `PUT` and `DELETE` are admin-only.
- Sign-ups: when "New member sign-ups" is off, `POST /api/users` refuses to create new users.

## Project structure

```
Components/   UI components (pages' content, admin panel, profile, home, ...)
pages/        Next.js routes and API routes
lib/          MongoDB client, client data helpers, settings, server auth helpers
utils/        Sign-in / sign-out helpers
firebase/     Firebase client setup
styles/       Global CSS
public/       Static images and videos
scripts/      One-off data scripts
```

## Release rules

_Add your release rules here._
