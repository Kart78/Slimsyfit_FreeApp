# Slimsyfit FreeApp — Separate Project Setup

This repository is a **new, standalone application**, not a branch, fork deployment, or overwrite of the original SlimSyFit production app.

## Architecture

- Frontend: React 18 + Vite
- Hosting: create a **new** Vercel project linked only to \`Kart78/Slimsyfit_FreeApp\`
- Authentication: Google OAuth / email/password using a **new** Supabase project
- User data: new Supabase Postgres table \`public.wellness_records\` with user-specific row-level security
- Offline/local mode: browser localStorage (not synchronized between devices)
- AI, Stripe, payment gateway, paid subscriptions, Fitbit, and mandatory connected devices: **none**

## 1. Run locally

\`\`\`powershell
git clone https://github.com/Kart78/Slimsyfit_FreeApp.git
cd Slimsyfit_FreeApp
npm install
npm run dev
\`\`\`

Open the development URL printed by Vite (usually http://localhost:5173).

Without cloud configuration, **Continue without an account** starts a device-only tracker.

## 2. Create a NEW Supabase project

Do not use credentials or database tables from the original SlimSyFit project.

1. Create a separate project at https://supabase.com/dashboard
2. In **SQL Editor**, run [supabase/schema.sql](supabase/schema.sql)
3. In **Project Settings → API**, copy the project URL and publishable/anon key.
4. Create a local file \`.env.local\` from \`.env.example\`:

\`\`\`dotenv
VITE_SUPABASE_URL=https://YOUR-NEW-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR-NEW-PUBLIC-ANON-KEY
\`\`\`

**Do not put the service_role key in VITE_ variables.** Vite exposes those values to the browser. The schema restricts each logged-in user to their own row through RLS.

## 3. Enable Google login in the NEW project

1. Supabase → Authentication → Providers → Google → enable
2. Create a separate Google OAuth client in Google Cloud Console
3. In that Google client, add the **new Supabase callback URL** displayed by Supabase, usually \`https://YOUR-NEW-PROJECT.supabase.co/auth/v1/callback\`
4. Enter Google Client ID and Client Secret inside Supabase Authentication
5. Supabase → Authentication → URL Configuration: add \`http://localhost:5173/**\` and your **new Vercel project URL** as allowed redirects

Do not reuse original app OAuth redirects or bind this app to \`slimsyfit.com\`.

## 4. New Vercel deployment

1. Vercel → **Add New → Project**
2. Import **Kart78/Slimsyfit_FreeApp**
3. Framework preset Vite; Build command \`npm run build\`; Output \`dist\`
4. Add \`VITE_SUPABASE_URL\` and \`VITE_SUPABASE_ANON_KEY\` for the **new** project
5. Deploy under a distinct Vercel hostname or new domain
6. Add its hostname to the new Supabase Authentication redirect URLs

Never import an existing Vercel SlimSyFit project, replace its connected repository, or overwrite its environment variables.

## 5. Account separation and storage

- Guest records are saved in device browser storage under the \`slimsyfit-freeapp:v1:guest\` namespace.
- Signed-in users have a separate browser key by their Supabase user ID, and a separate row in \`wellness_records\`.
- No paid subscription or AI API is required to use any screen.
- Cloud changes are saved after a short debounce; active multiple-device simultaneous edits can overwrite each other, so avoid editing the same account simultaneously on two devices during this initial version.
- "Delete tracking history" deletes the user data row and resets the tracker. It does **not** delete the authentication account; a complete account deletion workflow needs an authenticated server-side function.

## 6. Release checklist

- [ ] Google OAuth, signup, signout, and email confirmation work in the **new** Supabase project
- [ ] A new account sees an empty tracker with no sample/fake logs
- [ ] Water, meals, sleep, weight, movement, habits and fasting save and refresh properly
- [ ] Progress levels at 7 and 21 logged days work; achievements at 10-day milestones work
- [ ] Logged-in data syncs and respects per-user RLS
- [ ] Check new Vercel URL/mobile appearance
- [ ] Test on Android before packaging; use a **new** application ID and signing configuration
- [ ] Publish a dedicated privacy policy and account-deletion instructions
- [ ] Confirm no original SlimSyFit branding links, live data, billing services, secrets, or mobile package IDs are reused

## Build / test

\`\`\`powershell
npm test
npm run build
\`\`\`

The app is a web/PWA-friendly foundation. A **new Android package** has not been generated or published. The original SlimSyFit app remains unaffected.
