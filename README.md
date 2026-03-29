# Arkivel

The self-hosted knowledge platform. Build a personal knowledge base, team handbook, or worldbuilding encyclopedia — on infrastructure you own.

**Features:** Rich text editor with wiki links and syntax highlighting, footnotes/citations, revision history with inline diff, dark mode, sub-categories, nested tags, article templates, full-text search with filters, interactive map with layers, article graph visualization, multi-user auth with roles, RSS/Atom feeds, public REST API, webhooks, MediaWiki import, PDF/Markdown/HTML/ZIP export, article status workflow, watchlist & notifications, disambiguation pages, plugin system, reading time estimator, draft share links, article comparison view, popularity & contributor leaderboards, expiry warning banners, "you might also like" recommendations, mark-as-verified workflow, tag synonyms, discussion index, named article snapshots, article co-authors, article flags, floating table of contents, article stats panel, revision history CSV export, distraction-free reading mode, activity contribution heat map, wiki stats dashboard, mentions feed, article editor lock, one-click revision restore, cover image focal point picker, categorized keyboard shortcuts overlay, search query analytics, image captions, password-protected articles, category cover images, site-wide announcement banner, per-article 30-day view sparkline, TOC generator in editor, custom editor snippets, article freshness badge, reading streak tracker, category watchlist, inline AI text rewrite, category merge tool, word-count distribution chart, keyboard shortcut customization, wiki creation timeline, glossary system with hover-card definitions, reading level badge, pull quote blocks, heading permalink links, category statistics dashboard, In Brief summary callout, smart typography (curly quotes, em dash, ellipsis), browser-local reading history, sticky article header, last-visit badge, AI outline builder, AI alt-text suggestions, article Q&A widget, edit suggestions with admin review, reader retention analytics, referrer tracking, superscript/subscript, text highlighting, accordion/FAQ blocks, two-column layout, YouTube/Vimeo embeds, GitHub Gist embeds, satisfaction star rating, hot articles trending widget, per-article todo checklist, tag rename/management admin, word-count range search filter, AI grammar/style check panel in editor, bulk tag add/remove on article list, scroll position memory, PWA manifest (installable), external link click tracking, prefetch on hover, font size preference, focus paragraph mode, saved search alerts, RSVP speed reader with ORP highlighting, article blame view (paragraph-level authorship), article polls with session-based voting, live reading ETA counter, night reading mode (warm sepia), browser-local search history, high-contrast accessibility mode, text-only reading mode, content warning tags (dismissible CW banners), content gap analysis admin dashboard, HSL accent theme customizer, article font preference (serif/sans/mono), per-article private quick notes (localStorage), maintenance mode with site-wide banner, cleanup tags (needs-images/expansion/citations/review/stub/outdated) with orange notice banners, article adoption workflow, copy article as plain text, scheduled announcements (go-live datetime), read-only mode with site-wide banner, revision pruning admin tool, user activity log admin page, session management (view/revoke active sessions), AI tag and category suggestions in article editor, writing velocity weekly bar chart, featured article badge, AI title suggestions, auto-save indicator in editor, character count in article byline, did-you-mean search suggestions, tag cloud page, article width preference, local timezone timestamps, category growth chart, image lightbox, AI section expander in editor, bulk JSON export, per-article analytics tab, series progress tracker, vertical timeline blocks, Twitter/X embed blocks, series table of contents, bulk article JSON import, editor zen mode, word frequency cloud, dead-end article finder, duplicate content detector, orphan article finder, writing session goal with real-time progress bar, long article splitter suggestions, random article with category filter, new articles feed widget, top referrers dashboard, tag usage trends heat-map, analytics CSV export.

## Deploy to Vercel (Recommended)

The fastest way to get Arkivel running. You can also deploy anywhere that runs Node.js — see [Run Locally](#run-locally) and [Deploy to a Custom Domain](#deploy-to-a-custom-domain) for other options.

### 1. Set up the database

Create a free PostgreSQL database on [Neon](https://neon.tech):
1. Sign up and create a new project
2. Copy the connection string (looks like `postgresql://user:pass@host/dbname?sslmode=require`)

### 2. Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fmohammed-alsalhi%2Farkivel&env=DATABASE_URL,ADMIN_SECRET&envDescription=DATABASE_URL%3A%20PostgreSQL%20connection%20string.%20ADMIN_SECRET%3A%20Password%20for%20admin%20access.&project-name=arkivel)

Or manually:
1. Fork this repository
2. Import it in [Vercel](https://vercel.com/new)
3. Add environment variables (see below)
4. Deploy

### 3. Configure environment variables

A `.env.example` template is included in the repo with all available variables and descriptions. Copy it to `.env` and fill in your values:

```bash
cp .env.example .env
```

Only `DATABASE_URL` and `ADMIN_SECRET` are required — everything else has sensible defaults and is optional. Here's the full list:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `ADMIN_SECRET` | Yes | Password to access admin features |
| `NEXT_PUBLIC_ARKIVEL_NAME` | No | Site name shown in header and metadata (default: `Arkivel`) |
| `NEXT_PUBLIC_ARKIVEL_TAGLINE` | No | Short tagline in the top bar (default: `The self-hosted knowledge platform`) |
| `NEXT_PUBLIC_ARKIVEL_DESCRIPTION` | No | Meta description for SEO |
| `NEXT_PUBLIC_ARKIVEL_WELCOME_TEXT` | No | Welcome message on the home page |
| `NEXT_PUBLIC_ARKIVEL_FOOTER_TEXT` | No | Footer text after the site name |
| `NEXT_PUBLIC_MAP_ENABLED` | No | Set to `true` to enable the interactive map page |
| `NEXT_PUBLIC_MAP_LABEL` | No | Label for the map in navigation (default: `Map`) |
| `NEXT_PUBLIC_MAP_IMAGE` | No | Path or URL to the map background image |
| `NEXT_PUBLIC_DEFAULT_LOCALE` | No | Default locale for the wiki (default: `en`) |
| `NEXT_PUBLIC_ARTICLES_PER_PAGE` | No | Articles per page in listings (default: `20`) |
| `NEXT_PUBLIC_MAX_UPLOAD_SIZE` | No | Max image upload size in bytes (default: `5242880` / 5 MB) |
| `NEXT_PUBLIC_ENABLE_REGISTRATION` | No | Enable user registration (default: `true`) |
| `NEXT_PUBLIC_ENABLE_DISCUSSIONS` | No | Enable article discussion threads (default: `true`) |
| `BLOB_READ_WRITE_TOKEN` | No | Vercel Blob token for image uploads |

### Additional Features

- **RSS Feed:** Subscribe at `/feed.xml` (RSS 2.0) or `/feed/atom` (Atom)
- **Public API:** REST API at `/api/v1/` with API key auth — see `/api-docs` for documentation
- **Webhooks:** Configure webhook URLs for article create/update/delete events
- **User Accounts:** Multi-user auth with viewer/editor/admin roles at `/register` and `/login`
- **Article Graph:** Interactive D3 network visualization at `/graph`
- **MediaWiki Import:** Import `.xml` MediaWiki dumps alongside .md, .txt, .html, .json formats
- **CI/CD:** GitHub Actions workflow included for linting, type-checking, and building

> **Tip:** Variables starting with `NEXT_PUBLIC_` are baked in at build time. If you change them, you'll need to redeploy/rebuild for the changes to take effect.

### 4. Seed categories (optional)

After deploying, you can seed default categories by running the seed script, or just create categories manually through the admin interface.

## Run Locally

### Prerequisites
- Node.js 18+
- PostgreSQL database (local or remote)

### Setup

```bash
# Clone the repository
git clone https://github.com/mohammed-alsalhi/arkivel.git
cd arkivel

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL and ADMIN_SECRET
```

### Start the database

**Option A: Use a remote database (Neon, Supabase, etc.)**

Set `DATABASE_URL` in `.env` to your connection string.

**Option B: Use a local PostgreSQL**

```bash
# If using Docker:
docker run --name arkivel-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=wiki -p 5432:5432 -d postgres

# Set in .env:
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/wiki"
```

### Run

```bash
# Push the schema to your database
npx prisma db push

# (Optional) Seed default categories
node prisma/seed.mjs

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). If `ADMIN_SECRET` is empty in `.env`, you'll have admin access automatically.

## Deploy to a Custom Domain

### Option 1: Vercel (easiest)

After deploying to Vercel, go to your project settings > Domains and add your custom domain. Vercel handles SSL automatically.

### Option 2: Self-host with Node.js

```bash
# Build the production bundle
npm run build

# Start the production server
npm start
```

The app runs on port 3000 by default. Put it behind a reverse proxy (Nginx, Caddy) for SSL and custom domain:

**Nginx example:**
```nginx
server {
    listen 443 ssl;
    server_name wiki.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Caddy example (auto SSL):**
```
wiki.yourdomain.com {
    reverse_proxy localhost:3000
}
```

### Option 3: Docker

A `Dockerfile` and `docker-compose.yml` are included in the repo:

```bash
# Using Docker Compose (includes PostgreSQL):
docker compose up -d

# Or build and run manually:
docker build -t arkivel .
docker run -p 3000:3000 --env-file .env arkivel
```

## License

MIT
