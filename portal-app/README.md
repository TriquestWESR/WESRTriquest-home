# WESR Triquest Portal (Admin + Provider + Participant)
## What this is
Production portal built with Next.js + Supabase. Hidden app (no public links from the main site).
## Run locally
1) Copy `.env.example` to `.env` and fill with your Supabase URL + keys.
2) Create a Supabase project → open SQL Editor → paste the SQL from `node scripts/db-apply.js` output.
3) `npm i` then `npm run dev` (default port 5173).
## Minimal production steps
- Deploy this folder as its own app (e.g., Render, Vercel). Add your domain as an authorized URL in Supabase Auth.
- Configure Email/Password sign-in in Supabase.
- Create first admin user in Supabase, insert a row into `roles` with role='WESR_ADMIN' and user_id = that user's UUID.
- Create providers and assign roles in the DB (admin UI wiring can be extended).
## Next increments
- Flesh out API routes to read/write via service role or Supabase Edge Functions.
- Build the full Admin CRUD forms, Provider class wizard, and Exam renderer (using the spec docs already in your main site).
- Add certificate PDF generation + verification endpoint, and Stripe later for billing (current table records usage for monthly invoicing).

## Admin Console setup
- Add `SUPABASE_SERVICE_ROLE` to `.env` (server-only key from Supabase Settings → API).
- Apply schema + migrations:
  ```bash
  cd portal-app
  node scripts/db-apply.js
  ```
  Copy the output and run it in the Supabase SQL Editor.
- After sign-in, the login page stores `window.supabaseToken` which admin pages use in their `Authorization: Bearer <token>` headers.
- All admin API routes (`/api/admin/*`) use `requireAdmin()` guard which verifies the token and checks for `WESR_ADMIN` role.
- Admin pages:
  - `/admin/config` - Edit pass threshold, expiry, difficulty mix, disciplines, role tags
  - `/admin/tr-sections` - CRUD for TR sections (create, retire/unretire, version, question counts)
  - `/admin/providers` - Create/disable providers, assign roles to users by email

## IMPORTANT
- Do NOT add any links from the existing public pages. This app stands alone in /portal-app.
- Keep robots noindex by default (set in layout metadata).
- Ensure all pages use the Inter+Tailwind theme and rounded-2xl neutral cards to visually match the main site.
