# Slimsyfit FreeApp

Independent, free, manual wellness tracker. This repository is separate from the original SlimSyFit application. No AI APIs, Stripe, billing, subscription gates, or original production data.

## Setup

1. Run `npm install` and `npm run dev`.
2. For private Google login and multi-device sync, create a **new** Supabase project and execute `supabase/schema.sql` in its SQL Editor.
3. Copy `.env.example` to `.env.local`, fill in your **new** Supabase URL and public anon key (never the service-role key).
4. Enable Google in Supabase Auth Providers and configure the new project's callback/redirect URLs.
5. Deploy this repository as a **new** Vercel project. Never point it to the original SlimSyFit domain or reuse original production environment variables.

Until configured, it runs in local mode with on-device storage. See the full setup instructions in `SETUP.md`.
