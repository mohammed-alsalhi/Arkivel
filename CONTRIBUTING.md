# Contributing

Thanks for your interest in contributing to Arkivel! This guide will help you get started.

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (local or remote)
- Git

### Setup

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/arkivel.git
cd arkivel

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your DATABASE_URL (and optionally ADMIN_SECRET)

# Push schema to database
npx prisma db push

# Seed default categories (optional)
node prisma/seed.mjs

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). With no `ADMIN_SECRET` set, you'll have admin access automatically.

## Development Workflow

1. **Create a branch** from `main` for your feature or fix
2. **Make your changes** — see the project structure in [ARCHITECTURE.md](ARCHITECTURE.md)
3. **Test locally** — run `npm run build` to catch TypeScript errors
4. **Submit a pull request** with a clear description of what changed and why

## Project Structure

See [ARCHITECTURE.md](ARCHITECTURE.md) for a detailed breakdown of the codebase, database models, and design patterns.

## Common Tasks

### Adding a new API route
1. Create the route file under `src/app/api/`
2. For admin-only routes, use `requireAdmin(await isAdmin())`
3. For role-based routes, use `requireRole(user, 'editor')` with the appropriate role
4. Use the Prisma client from `src/lib/prisma.ts`

### Adding a new page
1. Create the page under `src/app/` following Next.js App Router conventions
2. Server components are the default; add `"use client"` only when needed
3. Use existing CSS classes (`.wiki-tabs`, `.wiki-infobox`, `.wiki-notice`, etc.)

### Modifying the database schema
1. Edit `prisma/schema.prisma`
2. Run `npx prisma generate` to regenerate the client
3. Run `npx prisma db push` to apply changes
4. Delete `.next/` if you see stale client errors

### Adding an infobox field schema
1. Edit `src/lib/infobox-schema.ts`
2. Add fields to the relevant category in `INFOBOX_SCHEMAS`
3. Supported field types: `text`, `textarea`, `number`, `wikilink`, `list`

### Adding a new Tiptap extension
1. Create the extension in `src/components/editor/`
2. Register it in the `extensions` array in `TiptapEditor.tsx`
3. Add toolbar controls in `EditorToolbar.tsx` if needed

## Code Style

- **TypeScript** — all source files use TypeScript with strict mode
- **Tailwind CSS** — utility-first styling; avoid inline styles except for CSS variables
- **CSS variables** — use theme variables (`text-foreground`, `bg-surface`, etc.) for colors
- **Server components** — prefer server components; use `"use client"` only for interactivity
- **Minimal dependencies** — avoid adding new packages unless clearly necessary

## What We're Looking For

Contributions of all kinds are welcome:

- **Bug fixes** — especially around edge cases in the editor or wiki link resolution
- **New features** — see [ROADMAP.md](ROADMAP.md) for planned features
- **Documentation** — improvements to README, help page, or code comments
- **Performance** — optimizations to database queries, rendering, or bundle size
- **Accessibility** — keyboard navigation, screen reader support, ARIA attributes
- **Tests** — the project has CI (lint + type-check + build via GitHub Actions) but no test suite yet; adding one would be very valuable (see [ROADMAP.md](ROADMAP.md))

## Reporting Issues

Use [GitHub Issues](https://github.com/mohammed-alsalhi/arkivel/issues) to report bugs or request features. Include:

- Steps to reproduce (for bugs)
- Expected vs actual behavior
- Browser and OS information
- Screenshots if applicable

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
