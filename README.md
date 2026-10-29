# SOBJO

Gunnar & Ivanna's workshop on the web: Next.js (App Router) + TypeScript, Payload CMS, Postgres, Tailwind CSS and Motion.

## Run it

```bash
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:3000. With no `DATABASE_URL` in `.env`, every page renders from the placeholder content in `src/content/placeholder.ts`, so you can work on the UI without a database.

## Turn on the CMS

1. Create a Postgres database (Neon or Supabase free tier) and put its connection string in `DATABASE_URL`. Set `PAYLOAD_SECRET` to a long random string.
2. `npm run dev`. In development Payload creates the tables for you.
3. Open http://localhost:3000/addpost and create the first user.
4. `npm run seed` copies the placeholder projects, notebook entries and bench items into the database so you can edit them instead of starting empty. It skips anything that already exists.

When you change a collection in `src/collections`, run:

```bash
npm run generate:types
npm run payload migrate:create
```

and commit the new file in `src/migrations`. On Vercel, the `vercel-build` script runs `payload migrate` before `next build` whenever `DATABASE_URL` is set, so the production database is updated on deploy. Without it, the site deploys with the placeholder content.

## Where things live

| Page | Route | Content comes from |
| --- | --- | --- |
| Home (playable workshop) | `/` | `src/components/home/workshop-engine.ts`; featured projects and latest entries from the CMS |
| About | `/about` | `src/content/site.ts` (people, photos, interests) |
| Bench | `/bench` | CMS **Bench items** (equipment, hardware, software) |
| Projects | `/projects`, `/projects/[slug]` | CMS **Projects** |
| Notebook | `/notebook`, `/notebook/[slug]` | CMS **Notebook entries** (drafts stay hidden until published) |
| Say hi | `/say-hi` | Placeholder until the contact form is built |
| Editor | `/addpost` | Payload admin |

- Brand colors and the house type styles (`hl`, `mono`, `card`, `btn`, `dots`…) are in `src/app/(site)/globals.css`.
- Photos for the About page go in `public/` and are referenced from `src/content/site.ts`.
- Uploads go to the local `media/` folder in development, and to Vercel Blob once `BLOB_READ_WRITE_TOKEN` is set.
- Saving anything in the CMS refreshes the site's pages; otherwise pages refresh every 5 minutes.

## Not built yet

- The **Say hi** contact form (Resend + Cloudflare Turnstile). The `messages` collection is ready for it.
- Cloudflare Access in front of `/addpost`, and Cloudflare DNS. Both are set up in the Cloudflare dashboard, not in code.
