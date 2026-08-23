<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/942b3fec-97a3-4b06-b684-d174c70fa472

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in [.env.local](.env.local)
   (Supabase Dashboard → Project Settings → API Keys)
4. Run the app:
   `npm run dev`

## Supabase

The archive lives in Postgres, not `localStorage`. The Supabase project is still named
**grapebox** (`ap-northeast-2`, ref `bcksoueakvqymycchvrp`) from before the app was renamed
to NoteBox — renaming it in the dashboard is cosmetic and does not change the ref or any URL.

### Schema

| Table | Purpose |
| --- | --- |
| `public.categories` | Per-user categories. Five Korean defaults are seeded on signup by the `handle_new_user` trigger. |
| `public.archive_items` | The archived text / links / images. `category_id` is `ON DELETE SET NULL`, which is what the UI shows as **카테고리 없음**. |

Both tables have RLS enabled with owner-only policies (`auth.uid() = user_id`) for
select / insert / update / delete, so a signed-in user can only ever reach their own rows.

Images may also be stored in the private `archive-images` bucket, where policies scope
each user to their own `{user_id}/` folder.

### Code layout

- `src/lib/supabase.ts` — the browser client
- `src/lib/api.ts` — auth, CRUD, image upload, and the one-time `localStorage` import
- `src/lib/database.types.ts` — generated types; regenerate after schema changes with
  `supabase gen types typescript --project-id bcksoueakvqymycchvrp`
- `src/AuthGate.tsx` — email/password sign-in gate wrapping the app

### Migrating existing data

On first load after signing in, anything left in the old `omnivault_items_v4` /
`omnivault_categories_v4` `localStorage` keys is imported once and stamped with
`omnivault_migrated_v4`, so it will not be imported twice.
