# Elevated Library Fixed Package Notes

This fixed package focuses on:

- Mobile responsive header with slide-out menu.
- PWA install button files and admin-controlled visibility.
- Supabase Storage setup support.
- Guest mode / normal mode behavior.
- Guest checkout name + email support.
- Admin/user profile unauthorized fixes using bearer tokens.
- Admin API auth helper fixes for both cookie and bearer-token sessions.
- Admin CRUD/product/order buttons updated to use authenticated fetch.
- Schema and latest patch SQL updated with `site_mode`, `pwa_install_enabled`, welcome notice fields, `guest_name`, and profile fields.

## Important Supabase SQL

For an existing Supabase database, run:

```sql
-- file: supabase/latest_patch.sql
```

Copy the contents of `supabase/latest_patch.sql` into Supabase SQL Editor and run it.

## After replacing files

Run locally:

```bash
npm install
npm run build
npm run dev
```

Then push:

```bash
git add .
git commit -m "Apply mobile auth and PWA fixes"
git push
```
