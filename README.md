# Elevated Library

Next.js App Router + Supabase + Cloudflare R2 + Resend manual-payment PDF selling website.

## Included
- Public homepage, products, product details, categories, FAQ, how-it-works, coming soon, notify me
- Manual bKash/Nagad order submit
- Guest checkout with secure token link
- Logged-in checkout with dashboard
- Admin: orders, products, categories, payment methods, FAQ, notices, coming soon, settings
- R2 private PDF upload/download using signed URLs
- Supabase Auth + PostgreSQL + RLS
- Vercel Cron for expiring pending orders
- Bangla-English mixed + English toggle
- Dark/light mode

## Fixed after review
- Pinned stable dependency versions instead of risky `latest` versions
- Added encrypted guest token storage so verification email can send the correct guest download link
- Added stricter banned/suspended user checks before dashboard/download/checkout
- Added safer numeric/date payload handling in admin simple CRUD forms
- Added `access_token_encrypted` column to SQL schema
- Added R2 CORS reminder for browser PDF upload

## Run locally
1. Copy `.env.example` to `.env.local`
2. Fill Supabase/R2/Resend variables
3. Run Supabase SQL from `supabase/schema.sql`
4. Install and run:

```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

## Owner setup
1. Register with `dev.get.in.touch@gmail.com`
2. In Supabase SQL Editor run:

```sql
update public.profiles
set role = 'owner', status = 'active'
where email = 'dev.get.in.touch@gmail.com';
```

## Cloudflare R2
Create private bucket `elevated-library-pdfs`, create S3 API token, set env variables.

For browser upload from the admin panel, add R2 bucket CORS like this from Cloudflare R2 bucket settings:

```json
[
  {
    "AllowedOrigins": ["http://localhost:3000", "https://YOUR-VERCEL-DOMAIN.vercel.app"],
    "AllowedMethods": ["GET", "PUT", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

## Resend
Use Resend API key and set `EMAIL_FROM`. For production, verify a custom domain when possible.

## Vercel
Add all env variables from `.env.example`, deploy, then update Supabase Auth Site URL and redirect URLs.
