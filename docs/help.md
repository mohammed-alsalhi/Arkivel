# Help & Features Guide

This guide covers all the features and tricks available in the wiki app.

## Getting Started

To create a new article, click **Create new article** in the sidebar or navigate to `/articles/new`.

Each article has:

- **Title** — the article name, also used to generate the URL slug
- **Content** — rich text body written in the editor
- **Category** — optional, for organizing articles into groups
- **Tags** — optional labels for cross-cutting topics
- **Excerpt** — short summary shown in search results and article lists

Articles can be saved as **drafts** (unpublished, admin-only) or **published** (visible to everyone).

## The Editor

The rich text editor provides a toolbar with these formatting options:

| Button | Action |
|--------|--------|
| **B** / **I** / **S** | Bold, Italic, Strikethrough |
| **H1** / **H2** / **H3** | Heading levels |
| **•** / **1.** | Bullet and ordered lists |
| **"** | Blockquote |
| **<>** | Code block |
| **—** | Horizontal rule |
| Link icon | Insert a URL link |
| Image icon | Upload an image |
| **[[]]** | Insert a wiki link |
| **Table** | Insert a table (see Tables section) |
| **Detect Links** | Scan text for potential wiki links |

**Markdown mode:** Click the `Markdown` button in the top-right corner of the editor to switch to raw markdown editing. Click `Rich Text` to switch back. Wiki links, bold, italic, and headings are preserved across modes.

**Templates:** When creating a new article, you can choose from predefined templates (Person, Place, Event, Thing, Group) that provide a starting structure with an infobox and sections.

## Wiki Links

Wiki links connect articles together. There are several ways to create them:

### Typing syntax

- Type `[[Article Name]]` — auto-converts to a wiki link when you close the brackets
- Type `[[Article Name|Display Text]]` — creates a link to "Article Name" but displays "Display Text"

### Link suggester

When you type `[[`, an autocomplete dropdown appears showing matching articles. Use **Arrow keys** to navigate, **Enter** to select, or **Escape** to dismiss. The dropdown searches as you type.

### Toolbar & keyboard

- Click the **[[]]** toolbar button — prompts for an article title. If text is selected, it becomes the display text.
- Press `Ctrl+Shift+L` (or `Cmd+Shift+L` on Mac) — same as the toolbar button.

### Link status

- Wiki links to existing articles appear in **blue**
- Links to articles that don't exist yet appear in **red** (broken links), which is a visual cue to create that article

## Link Detection

The **Detect Links** button in the editor toolbar scans your article text for phrases that match existing article titles.

- Matching phrases are highlighted with a dashed underline
- Hover over a highlight, then **click** to convert it into a wiki link
- The toolbar button shows a count badge (e.g. "Detect Links (5)") with remaining matches
- Text inside headings and existing wiki links is skipped
- Longer article titles take priority over shorter ones to avoid partial matches

## Search

The search bar in the top-right corner provides instant results as you type. Press **Enter** or click "See all results" for the full search page.

- Multi-word queries use **AND** logic — every word must appear somewhere in the article
- Results are ranked: exact title match > title starts with query > title contains query > content-only match
- Search covers article titles, content, and excerpts

## Categories & Tags

**Categories** are hierarchical groups shown in the sidebar. Each article can belong to one category. Categories can have sub-categories for deeper organization. Browse all categories at `/categories`.

**Tags** are hierarchical labels that can be assigned freely. An article can have multiple tags. Tags can have sub-tags for deeper organization, similar to categories. Tags appear at the bottom of articles and link to a tag page listing all articles with that tag. Browse all tags at `/tags`, which features a tag cloud with size-scaled tags.

## Revision History

Every time you save an article, the previous version is automatically preserved as a revision.

- Click the **History** tab on any article to see all past revisions
- Each revision shows the date, time, and content at that point
- Select any two revisions and click **Compare** to see a side-by-side diff
- Added text is highlighted in green and removed text in red

## Navigation & Organization

- **Backlinks:** At the bottom of each article, a "Pages that link here" section lists all articles that reference the current one via wiki links.
- **Table of contents:** Articles with multiple headings automatically get a table of contents at the top.
- **Breadcrumb navigation:** Article pages show the category hierarchy as clickable breadcrumbs.
- **Recent changes:** The Recent Changes page (`/recent-changes`) shows a timeline of all article edits grouped by date.
- **Disambiguation:** When you create an article with a title similar to existing ones, a notice appears linking to the similar articles.
- **Reading progress bar:** A progress indicator at the top of article pages shows how far you've scrolled.
- **Back to top button:** Appears when scrolling down for quick navigation back to the top.

## Import & Export

### Import

- **Web UI:** Go to `/import` and drag-and-drop files (.md, .txt, .html, .json)
- **CLI:** Run `npm run import -- path/to/files` for bulk import with `--draft`, `--category`, `--dry-run` flags
- Markdown files with frontmatter extract the title automatically
- JSON files can contain a single article object or an array of articles

### Export

- **PDF:** Click "Export PDF" on any article — uses your browser's print dialog
- **Markdown:** Click "Export Markdown" to download the article as a .md file

## Interactive Map

The interactive map feature is optional and disabled by default. When enabled (via the `NEXT_PUBLIC_MAP_ENABLED=true` environment variable), it adds a map page with:

- Multiple maps per wiki, each with its own background image
- Clickable polygon areas linked to articles
- Hover tooltips showing area names with a color tint
- Toggleable map layers (political boundaries, terrain, etc.)
- Zoomable maps with different detail levels at each zoom
- Map area search and filtering
- Edit mode for drawing new polygon areas (admin only)

### Editing areas (admin)

Toggle **Edit Mode** to access area management. In edit mode:

- **Draw new areas** — click the map to place polygon vertices, then click "Finish Drawing" to complete the shape
- **Select existing areas** — click any polygon to select it; an edit panel appears on the right
- **Edit properties** — change the label, linked article, or color of the selected area
- **Reshape polygons** — drag the white vertex handles to move individual polygon points in real-time
- **Color picker** — choose from 8 preset colors or pick any custom color via the color input
- **Delete areas** — click the delete button in the edit panel to remove an area
- Click empty space on the map to deselect the current area

## Administration

- **Multi-user login:** Register for an account or login with your credentials at `/login`. Roles: Viewer (read only), Editor (create/edit), Admin (full access).
- **Legacy admin login:** Go to `/admin` and enter the admin password (set via `ADMIN_SECRET` environment variable). Both login methods work side by side.
- **Local development:** If `ADMIN_SECRET` is empty, everyone has admin access automatically
- **Admin dashboard:** Access the admin dashboard for a review queue of articles needing approval, wiki statistics, webhook management, and plugin configuration.
- **Theme:** Toggle between light and dark mode using the sun/moon icon in the top-right corner
- **Customization:** Wiki name, tagline, welcome text, footer, and more are all configurable via `NEXT_PUBLIC_*` environment variables. See `.env.example` for the full list.

## Tables

The editor supports inserting and editing tables directly in your articles.

- Click the **Table** toolbar button to insert a 3×3 table with a header row
- When your cursor is inside a table, additional buttons appear: **+Row**, **+Col**, **-Row**, **-Col**, **xTable**
- Click cells to edit them directly; use Tab to move between cells
- Selected cells are highlighted with a blue tint
- Tables render with borders and header styling on both the editor and the article display

## Link Editing

When you hover over a link (either a regular URL link or a wiki link) in the editor, a floating bubble appears below it with two options:

- **Edit** — opens an inline text input to change the URL (for regular links) or the article title (for wiki links)
- **Remove** — removes the link but keeps the text in place

Press **Enter** to save your edit, or **Escape** to cancel. The bubble also appears when you navigate to a link via keyboard.

## Redirect Pages

When an article moves to a new URL, you can set up a redirect so the old slug automatically takes visitors to the new article.

- Open the article editor and fill in the **Redirect to** field with the target article's slug
- Visitors who navigate to the redirecting article will be automatically sent to the target
- Redirects still appear in search results — clicking them triggers the redirect
- Leave the redirect field empty for normal (non-redirecting) articles

## Discussion Pages

Every article has a **Discussion** tab where users can post comments and discuss the article content, similar to Wikipedia talk pages.

- Click the **Discussion** tab on any article to view and post comments
- Comments are open to everyone — no login required
- Enter an optional author name (defaults to "Anonymous")
- Comments are shown chronologically with timestamps
- Admins can delete individual comments

## Batch Operations

Admins can perform bulk actions on articles from the All Articles page (`/articles`).

- Select articles using the checkboxes in the first column, or use the header checkbox to select all
- **Set Category** — assign a category to all selected articles at once
- **Publish / Unpublish** — toggle visibility of selected articles
- **Delete** — permanently delete selected articles (requires confirmation)

Batch operations are only visible when logged in as admin.

## Footnotes & Citations

Add footnotes to your articles for citations and references:

- Click the **fn** toolbar button or press `Ctrl+Shift+F` to insert a footnote
- Enter the footnote text in the prompt
- Footnotes appear as numbered superscripts in the text
- A "Notes" section is automatically generated at the bottom of the article

## Code Blocks with Syntax Highlighting

Code blocks support syntax highlighting for many programming languages:

- Click the **<>** toolbar button to insert a code block
- You'll be prompted to enter a language (e.g. js, python, html, css, bash)
- Syntax highlighting is applied automatically in both the editor and article display
- Supports dark mode with adapted color schemes

## Article Status Workflow

Articles can have one of three statuses:

- **Draft** — work in progress, only visible to admins
- **Review** — ready for review, only visible to admins
- **Published** — visible to everyone

Set the status from the article edit page. Pinned articles appear at the top of their category page.

## User Accounts

The wiki supports multi-user accounts with role-based permissions:

- Register for an account at `/register` with username, email, and password
- Login at `/login` to start editing
- Roles: **Viewer** (read only), **Editor** (create/edit articles), **Admin** (full access)
- User profiles show contribution history at `/users/username`
- Legacy admin password login still works alongside user accounts

## Watchlist & Notifications

- Watch articles to get notified when they're edited
- Manage your watchlist from `/watchlist` in the sidebar
- The bell icon in the header shows unread notification count
- Click the bell to see recent notifications and mark them as read

## RSS Feeds & Public API

- **RSS:** Subscribe to `/feed.xml` for recent changes
- **Atom:** Available at `/feed/atom`
- **API:** Public REST API at `/api/v1/` with API key authentication. See `/api-docs` for documentation.

## Semantic Links & Relations

Beyond wiki links, you can create typed semantic relationships between articles:

- On any article's edit page, use the **Relations** section to add semantic links
- Available relation types: *related to*, *is part of*, *see also*, and more
- Relations are displayed on the article page and are visible in the Article Graph
- Relations are bidirectional — linking A to B also shows on B's page

## Multi-Language Translations

Articles can have translations in multiple languages:

- On an article's edit page, use the **Translations** tab to add content in other languages
- Each translation has its own title and content
- A language switcher appears on articles that have translations available

## Article Graph

Visualize the connections between your articles as an interactive graph:

- Visit the Article Graph page at `/graph` from the sidebar
- Nodes represent articles, colored by category
- Edges represent wiki links between articles
- Drag nodes to rearrange, scroll to zoom, and click to navigate
- Filter by category and control graph depth

## Keyboard Shortcuts

These shortcuts work inside the rich text editor. Replace Ctrl with Cmd on Mac.

| Shortcut | Action |
|----------|--------|
| `Ctrl+B` | Bold |
| `Ctrl+I` | Italic |
| `Ctrl+Shift+X` | Strikethrough |
| `Ctrl+Shift+L` | Insert wiki link |
| `Ctrl+Shift+7` | Ordered list |
| `Ctrl+Shift+8` | Bullet list |
| `Ctrl+Shift+B` | Blockquote |
| `Ctrl+Shift+E` | Code block |
| `Ctrl+Z` / `Ctrl+Shift+Z` | Undo / Redo |

> **Tip:** You can type `[[` anywhere in the editor to quickly search and link to existing articles without leaving the keyboard.

## Keyboard Shortcuts (Global)

| Shortcut | Action |
|----------|--------|
| `?` | Show keyboard shortcuts overlay |
| `/` | Focus search bar |
| `g` then `h` | Go to home page |
| `g` then `a` | Go to all articles |
| `g` then `n` | Create new article |
| `g` then `s` | Go to search |
| `g` then `r` | Go to recent changes |
| `g` then `g` | Go to article graph |
| `Esc` | Close dialog / blur input |
