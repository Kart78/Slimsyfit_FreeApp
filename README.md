# Slimsyfit FreeApp

Independent, free, manual wellness tracker. This repository is separate from the original SlimSyFit application. No AI APIs, Stripe, billing, subscription gates, or original production data.

## Setup

1. Run `npm install` and `npm run dev`.
2. Cloud sync uses the dedicated Supabase project **slimsyfit-free** (`rvplxwcoqdlpfchbhlkp`, us-east-2), separate from the original SlimSyFit project. `supabase/schema.sql` and the `delete-account` function are deployed there; Vercel has `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` set.
3. Copy `.env.example` to `.env.local`, fill in your **new** Supabase URL and public anon key (never the service-role key).
4. Enable Google in Supabase Auth Providers and configure the new project's callback/redirect URLs.
5. Deploy this repository as a **new** Vercel project. Never point it to the original SlimSyFit domain or reuse original production environment variables.

Until configured, it runs in local mode with on-device storage. See the full setup instructions in `SETUP.md`.
