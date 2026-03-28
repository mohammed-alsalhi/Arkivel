import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Features",
  description: "A complete overview of everything the wiki can do.",
};

export default function FeaturesPage() {
  return (
    <div>
      <h1
        className="text-[1.7rem] font-normal text-heading border-b border-border pb-1 mb-1"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Features
      </h1>
      <p className="text-[13px] text-muted mb-5">
        A complete overview of everything the wiki can do. For step-by-step instructions see the{" "}
        <Link href="/help">Help &amp; Features Guide</Link>.
      </p>

      {/* Writing & Editing */}
      <div className="wiki-portal mb-4">
        <div className="wiki-portal-header">Writing &amp; Editing</div>
        <div className="wiki-portal-body text-[13px]">
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Rich text editor</strong> — Tiptap-based WYSIWYG editor with toolbar, slash commands, and drag-and-drop block reordering</li>
            <li><strong>Markdown mode</strong> — toggle between rich text and raw Markdown at any time</li>
            <li><strong>Slash commands</strong> — type <code className="bg-surface-hover px-1 text-[12px]">/</code> for Mermaid diagrams, math blocks, Excalidraw drawings, data tables, decision trees, headings, and more; includes user snippets via <code className="bg-surface-hover px-1 text-[12px]">/snippet</code></li>
            <li><strong>Inline AI rewrite</strong> — select text and click &ldquo;AI Rewrite&rdquo; in the toolbar; optionally provide an instruction; requires <code className="bg-surface-hover px-1 text-[12px]">OPENAI_API_KEY</code></li>
            <li><strong>Editor snippets</strong> — define reusable HTML blocks at <Link href="/settings/snippets">/settings/snippets</Link>; insert via the slash-command menu</li>
            <li><strong>TOC generator</strong> — toolbar button extracts all headings and inserts a linked table of contents at the cursor</li>
            <li><strong>Mermaid diagrams</strong> — flowcharts, sequence diagrams, Gantt charts, and more rendered inline</li>
            <li><strong>Math (KaTeX)</strong> — inline <code className="bg-surface-hover px-1 text-[12px]">$...$</code> and block <code className="bg-surface-hover px-1 text-[12px]">$$...$$</code> math expressions</li>
            <li><strong>Excalidraw drawings</strong> — embed interactive whiteboard sketches directly in articles</li>
            <li><strong>Data tables</strong> — paste CSV or JSON to create sortable, filterable tables with CSV download</li>
            <li><strong>Decision trees</strong> — define yes/no trees as JSON; renders as an interactive SVG</li>
            <li><strong>Pull quotes</strong> — large centred serif blockquote for emphasis; insert via <code className="bg-surface-hover px-1 text-[12px]">/pull quote</code> or <kbd>Mod+Shift+Q</kbd></li>
            <li><strong>Smart typography</strong> — auto-converts <code className="bg-surface-hover px-1 text-[12px]">--</code> → em dash, <code className="bg-surface-hover px-1 text-[12px]">...</code> → ellipsis, and straight quotes to curly quotes as you type</li>
            <li><strong>Outline builder</strong> — AI-assisted panel generates H2/H3 section headings from the article title; supports Encyclopedic, Tutorial, and Reference styles; inserts headings directly into the editor</li>
            <li><strong>AI alt-text suggestions</strong> — image caption prompt is pre-filled with an AI-suggested description derived from the filename (or heuristic if AI not configured)</li>
            <li><strong>Superscript / subscript</strong> — x² / x₂ toolbar buttons for inline superscript and subscript text</li>
            <li><strong>Text highlighting</strong> — 6-colour highlight picker in toolbar (yellow, green, blue, pink, orange, purple) with one-click clear</li>
            <li><strong>Accordion / FAQ blocks</strong> — insert native collapsible <code className="bg-surface-hover px-1 text-[12px]">&lt;details&gt;</code> blocks via <code className="bg-surface-hover px-1 text-[12px]">/accordion</code></li>
            <li><strong>Two-column layout</strong> — responsive side-by-side grid block via <code className="bg-surface-hover px-1 text-[12px]">/two-column layout</code></li>
            <li><strong>YouTube / Vimeo embeds</strong> — paste a video URL via <code className="bg-surface-hover px-1 text-[12px]">/youtube</code>; auto-converts to a responsive 16:9 iframe</li>
            <li><strong>GitHub Gist embeds</strong> — embed a Gist link via <code className="bg-surface-hover px-1 text-[12px]">/github gist</code></li>
            <li><strong>Article todo checklist</strong> — per-article task list; readers check off items, admins add and remove tasks; shows completion progress</li>
            <li><strong>AI grammar &amp; style check</strong> — collapsible panel below editor analyses text for errors, warnings, and style suggestions; Apply buttons fix issues inline; falls back to heuristic checks when AI is not configured</li>
            <li><strong>Footnotes &amp; citations</strong> — inline footnote references auto-numbered via CSS counters</li>
            <li><strong>Syntax highlighting</strong> — code blocks with language detection and theme-aware colours</li>
            <li><strong>Voice dictation</strong> — click the microphone button to insert speech at the cursor</li>
            <li><strong>Article templates</strong> — Person, Place, Event, Thing, Group templates with infobox scaffolding</li>
            <li><strong>Image upload</strong> — drag-and-drop or toolbar insert; stored via Vercel Blob; optional caption displayed as styled <code className="bg-surface-hover px-1 text-[12px]">&lt;figcaption&gt;</code> below the image</li>
            <li><strong>Auto-revisions</strong> — every save snapshots the previous state automatically</li>
          </ul>
        </div>
      </div>

      {/* Knowledge Organization */}
      <div className="wiki-portal mb-4">
        <div className="wiki-portal-header">Knowledge Organization</div>
        <div className="wiki-portal-body text-[13px]">
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Wiki links</strong> — <code className="bg-surface-hover px-1 text-[12px]">[[Article Name]]</code> syntax with autocomplete; broken links shown in red</li>
            <li><strong>Backlinks</strong> — every article shows which other articles link to it</li>
            <li><strong>Semantic relations</strong> — link articles with typed relations (is-part-of, related-to, etc.)</li>
            <li><strong>Hierarchical categories</strong> — tree-structured categories in the sidebar; each article belongs to one; optional banner image per category; follow a category with the &ldquo;Watch&rdquo; button to track new articles</li>
            <li><strong>Hierarchical tags</strong> — many-to-many; browse all at <Link href="/tags">/tags</Link> with a size-scaled tag cloud</li>
            <li><strong>Redirects</strong> — set a &ldquo;Redirect to&rdquo; slug to forward old URLs automatically</li>
            <li><strong>Disambiguation</strong> — notice on articles with ambiguous titles</li>
            <li><strong>Article status</strong> — Draft, Review, Published; non-published articles hidden from non-admins</li>
            <li><strong>Password-protected articles</strong> — set an optional access password; non-admin readers see a password gate that unlocks for the session</li>
            <li><strong>Pinned articles</strong> — pin important articles to the top of category pages</li>
            <li><strong>Custom metadata schemas</strong> — define typed fields (text, number, date, boolean, select) per category at <Link href="/admin/metadata-schemas">/admin/metadata-schemas</Link></li>
            <li><strong>Concept maps</strong> — visual relationship graph per category at <code className="bg-surface-hover px-1 text-[12px]">/categories/[slug]/concept-map</code></li>
            <li><strong>Article graph</strong> — D3 force-directed graph of all wiki-link connections at <Link href="/graph">/graph</Link></li>
            <li><strong>Tag synonyms</strong> — define alternate aliases per tag (e.g. &ldquo;JS&rdquo; → &ldquo;JavaScript&rdquo;) at <code className="bg-surface-hover px-1 text-[12px]">/api/tags/[id]/synonyms</code></li>
          </ul>
        </div>
      </div>

      {/* Discovery & Navigation */}
      <div className="wiki-portal mb-4">
        <div className="wiki-portal-header">Discovery &amp; Navigation</div>
        <div className="wiki-portal-body text-[13px]">
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Full-text search</strong> — AND-logic multi-word search with relevance ranking; instant results as you type</li>
            <li><strong>Word-count search filter</strong> — advanced search includes min/max word count range to find articles by length</li>
            <li><strong>Search analytics</strong> — every query is logged; admin page at <Link href="/admin/search-analytics">/admin/search-analytics</Link> shows daily volume, top queries, and zero-result queries to find content gaps</li>
            <li><strong>30-day view sparkline</strong> — article stats panel shows a mini bar chart of daily page views for the past 30 days</li>
            <li><strong>Article freshness badge</strong> — colour-coded badge (Fresh/Recent/Aging/Stale) next to the &ldquo;Last edited&rdquo; date on every article</li>
            <li><strong>Reading streak</strong> — consecutive days a user has read articles; shown as a dashboard widget</li>
            <li><strong>Federated search</strong> — fans out to peer wiki instances and merges results under &ldquo;Results from other wikis&rdquo;</li>
            <li><strong>Explore mode</strong> — guided walk through articles using semantic similarity at <Link href="/explore">/explore</Link></li>
            <li><strong>Random article</strong> — <Link href="/random">/random</Link> jumps to a random published article</li>
            <li><strong>Recent changes</strong> — timeline of all edits grouped by date at <Link href="/recent-changes">/recent-changes</Link></li>
            <li><strong>Activity feed</strong> — stream of recent contributions at <Link href="/activity">/activity</Link></li>
            <li><strong>Timeline view</strong> — chronological view of articles at <Link href="/timeline">/timeline</Link></li>
            <li><strong>Smart collections</strong> — saved searches with filters (tags, category, author, date range) at <Link href="/collections">/collections</Link></li>
            <li><strong>Bookmarks</strong> — save articles with optional notes at <Link href="/bookmarks">/bookmarks</Link></li>
            <li><strong>Reading lists</strong> — ordered sequences of articles, shareable via link at <Link href="/reading-lists">/reading-lists</Link></li>
            <li><strong>TIL (Today I Learned)</strong> — post short (280-char) notes at <Link href="/til">/til</Link></li>
            <li><strong>Scratchpad</strong> — persistent personal scratch space at <Link href="/scratchpad">/scratchpad</Link></li>
            <li><strong>Session reading trail</strong> — breadcrumb of your current session&apos;s navigation at the bottom of each article</li>
            <li><strong>Reading history</strong> — browser-local log of the last 50 articles you visited, with relative timestamps; accessible at <Link href="/history">/history</Link></li>
            <li><strong>Last-visit badge</strong> — article header shows &ldquo;You read this X ago&rdquo; on return visits without any server call</li>
            <li><strong>Sticky article header</strong> — slim floating bar with article title, Edit and Top links appears after scrolling past the article title</li>
            <li><strong>Table of contents</strong> — auto-generated for articles with multiple headings</li>
            <li><strong>Popularity leaderboard</strong> — <Link href="/popular">/popular</Link> ranks published articles by reads × 2 + reactions</li>
            <li><strong>Article comparison</strong> — side-by-side view of two live articles at <code className="bg-surface-hover px-1 text-[12px]">/compare?a=slug1&amp;b=slug2</code></li>
            <li><strong>&ldquo;You might also like&rdquo;</strong> — sidebar widget on article pages suggesting up to 5 articles sharing the same tags</li>
            <li><strong>Contributor leaderboard</strong> — <Link href="/leaderboard">/leaderboard</Link> ranks users by total revision count</li>
            <li><strong>Discussion index</strong> — <Link href="/discussions">/discussions</Link> lists all open threads across every article</li>
            <li><strong>Activity heat map</strong> — GitHub-style contribution calendar on <Link href="/activity">/activity</Link> showing daily edit count over the past 52 weeks</li>
            <li><strong>Wiki stats page</strong> — public <Link href="/stats">/stats</Link> shows total articles, words, categories, tags, contributors, revisions, and a top-contributors leaderboard</li>
            <li><strong>Mentions feed</strong> — <Link href="/mentions">/mentions</Link> lists all discussions that mention <code className="bg-surface-hover px-1 text-[12px]">@username</code> for the logged-in user</li>
            <li><strong>Article Q&amp;A</strong> — collapsible panel at the bottom of each article; ask any question and get an answer grounded in wiki content with cited sources</li>
            <li><strong>Edit suggestions</strong> — readers can click &ldquo;Suggest edit&rdquo; on any article to propose a correction; admins review and accept/reject at <Link href="/admin/suggestions">/admin/suggestions</Link></li>
            <li><strong>Reader retention analytics</strong> — scroll depth distribution per article at <Link href="/admin/retention">/admin/retention</Link></li>
            <li><strong>Referrer tracking</strong> — incoming traffic sources tracked per article per day; aggregated view at <Link href="/admin/referrers">/admin/referrers</Link></li>
            <li><strong>Satisfaction star rating</strong> — 1–5 star widget on every article page; per-session upsert; average and count shown in real time</li>
            <li><strong>Hot articles widget</strong> — &ldquo;Trending this week&rdquo; panel on the homepage sidebar showing the top-5 most-viewed articles in the last 7 days</li>
            <li><strong>Scroll position memory</strong> — article scroll position saved to browser storage; restored automatically on return visits</li>
          </ul>
        </div>
      </div>

      {/* Article Page */}
      <div className="wiki-portal mb-4">
        <div className="wiki-portal-header">Article Page</div>
        <div className="wiki-portal-body text-[13px]">
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Reading time estimator</strong> — &ldquo;~X min read&rdquo; computed at 200 wpm displayed in every article&apos;s metadata line</li>
            <li><strong>Draft share links</strong> — admins generate a secret-token URL (<code className="bg-surface-hover px-1 text-[12px]">/share/[token]</code>) so non-admins can preview a draft without publishing</li>
            <li><strong>Expiry warning banner</strong> — yellow inline banner when an article&apos;s <em>reviewDueAt</em> is within 30 days</li>
            <li><strong>Mark as verified</strong> — admin button stamps <em>lastVerifiedAt</em>; date shown as a ✓ badge in the article byline</li>
            <li><strong>Article series navigation</strong> — prev/next links between articles belonging to a series</li>
            <li><strong>See also</strong> — curated links to related articles, managed by admins</li>
            <li><strong>Changelog panel</strong> — collapsible list of the last 5 edits with authors and diff links</li>
            <li><strong>Word goal progress</strong> — progress bar shown until the article reaches its target word count</li>
            <li><strong>Floating table of contents</strong> — sticky sidebar TOC with active-section highlighting on wide screens (&ge;1280 px)</li>
            <li><strong>Article stats panel</strong> — collapsible panel showing reads, reactions, word count, quality score, and article age</li>
            <li><strong>Article flags</strong> — admin-assigned labels (e.g. &ldquo;Needs images&rdquo;, &ldquo;Outdated&rdquo;) displayed as orange badge chips near the title</li>
            <li><strong>Article co-authors</strong> — link additional contributors to an article; co-author names appear in the byline</li>
            <li><strong>Named snapshots</strong> — manually save a labeled snapshot of any article beyond the automatic revisions</li>
            <li><strong>Reading mode</strong> — distraction-free reading toggle; hides header and sidebar, widens content; press <kbd>R</kbd> or the toolbar button to toggle</li>
            <li><strong>Cover image focal point</strong> — click to set a focal point on the cover image so cropped displays always center on the subject</li>
            <li><strong>Duplicate article</strong> — admin toolbar button clones any article as a new draft, preserving all content, tags, and category</li>
            <li><strong>Print stylesheet</strong> — press <kbd>Ctrl+P</kbd> / <kbd>Cmd+P</kbd> for a clean print view: all chrome hidden, full-width content, external link URLs appended</li>
            <li><strong>Reading level badge</strong> — Flesch Reading Ease score computed from article text and shown as a colour-coded badge (Very Easy → Very Complex)</li>
            <li><strong>Glossary hover cards</strong> — defined terms in article text are underlined with a dotted accent; hovering shows a floating definition card</li>
            <li><strong>In Brief summary</strong> — when an article has a short summary, it is displayed as a highlighted callout at the top of the content</li>
            <li><strong>Heading permalink links</strong> — hovering over any heading reveals a ¶ link that copies the anchor URL to the clipboard</li>
          </ul>
        </div>
      </div>

      {/* Personal Dashboard */}
      <div className="wiki-portal mb-4">
        <div className="wiki-portal-header">Personal Dashboard</div>
        <div className="wiki-portal-body text-[13px]">
          <p className="mb-2">
            A personalizable homepage at <Link href="/dashboard">/dashboard</Link> with a draggable widget grid.
          </p>
          <ul className="list-disc pl-5 space-y-0.5">
            <li>Available widgets: Recent articles, Watchlist, Recent edits, Random article, Scratchpad preview, Wiki stats, Notifications</li>
            <li>Toggle widgets on/off and reorder via &ldquo;Customize&rdquo; mode</li>
            <li>Layout saved to your user preferences and restored on next visit</li>
          </ul>
        </div>
      </div>

      {/* Learning & Retention */}
      <div className="wiki-portal mb-4">
        <div className="wiki-portal-header">Learning &amp; Retention</div>
        <div className="wiki-portal-body text-[13px]">
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Learning paths</strong> — curated ordered sequences of articles with per-path progress tracking at <Link href="/learning-paths">/learning-paths</Link></li>
            <li><strong>Flashcards</strong> — create decks from articles; SM-2 spaced repetition with 0–5 grading at <Link href="/flashcards">/flashcards</Link></li>
            <li><strong>AI quizzes</strong> — Claude generates 5 multiple-choice questions from any article for self-testing</li>
            <li><strong>Reading progress</strong> — mark articles as read; category pages show a completion ring</li>
            <li><strong>Presentation mode</strong> — any article opens as a full-screen slideshow at <code className="bg-surface-hover px-1 text-[12px]">/present/[slug]</code>; each H2/H3 is a slide</li>
            <li><strong>Watchlist digest</strong> — optional daily email summary of watched article changes at <Link href="/watchlist/digest">/watchlist/digest</Link></li>
          </ul>
        </div>
      </div>

      {/* Collaboration */}
      <div className="wiki-portal mb-4">
        <div className="wiki-portal-header">Collaboration</div>
        <div className="wiki-portal-body text-[13px]">
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Real-time co-editing</strong> — simultaneous editing with cursor presence via Yjs/y-prosemirror</li>
            <li><strong>Discussions</strong> — threaded comments on every article; <code className="bg-surface-hover px-1 text-[12px]">@mention</code> triggers notifications</li>
            <li><strong>Article reactions</strong> — Helpful, Insightful, Outdated, Confusing via the reaction bar</li>
            <li><strong>Change requests</strong> — propose edits without direct write access at <Link href="/change-requests">/change-requests</Link></li>
            <li><strong>Article forks</strong> — propose a full rewrite; admins review/merge/reject at <Link href="/forks">/forks</Link></li>
            <li><strong>Review workflow</strong> — assign reviewers and track inline feedback at <Link href="/reviews">/reviews</Link></li>
            <li><strong>Knowledge bounties</strong> — request new articles; contributors claim and fulfil them at <Link href="/bounties">/bounties</Link></li>
            <li><strong>Expert badges</strong> — admin-granted per category; highlighted in revision history and bylines</li>
            <li><strong>Article certification</strong> — &ldquo;Verified by experts&rdquo; badge after review by 2+ experts</li>
            <li><strong>Contributor achievements</strong> — First edit, 10/100 edits, streak badges, category expert; unlocked with toast notification</li>
          </ul>
        </div>
      </div>

      {/* AI Features */}
      <div className="wiki-portal mb-4">
        <div className="wiki-portal-header">AI Features</div>
        <div className="wiki-portal-body text-[13px]">
          <p className="mb-2">AI features degrade gracefully when API keys are absent.</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Writing coach</strong> — Flesch-Kincaid score, passive-voice count, sentence-length stats, and AI suggestions in the editor</li>
            <li><strong>Article summaries</strong> — auto-generated on save; used as the page meta description</li>
            <li><strong>Semantic search</strong> — vector embeddings via OpenAI blend meaning-based results with keyword matches</li>
            <li><strong>Duplicate detection</strong> — warns when a new article is semantically similar to an existing one</li>
            <li><strong>Knowledge gaps</strong> — surfaces referenced-but-uncreated topics at <Link href="/admin/knowledge-gaps">/admin/knowledge-gaps</Link></li>
            <li><strong>Category suggestions</strong> — Claude suggests topics missing from a category</li>
            <li><strong>Quiz generation</strong> — 5 multiple-choice questions generated per article by Claude</li>
            <li><strong>Translation</strong> — machine-translate articles via DeepL or Google Translate (requires API key)</li>
          </ul>
        </div>
      </div>

      {/* Whiteboards */}
      <div className="wiki-portal mb-4">
        <div className="wiki-portal-header">Whiteboards</div>
        <div className="wiki-portal-body text-[13px]">
          <p className="mb-2">
            Standalone Excalidraw canvases at <Link href="/whiteboards">/whiteboards</Link> — separate from article-embedded drawings.
          </p>
          <ul className="list-disc pl-5 space-y-0.5">
            <li>Create unlimited named canvases; auto-save to the database 2 seconds after each change</li>
            <li>Edit titles inline; full Excalidraw toolkit (shapes, text, arrows, images)</li>
            <li>Embed any whiteboard in an article via the Excalidraw slash command</li>
          </ul>
        </div>
      </div>

      {/* Web Clipping */}
      <div className="wiki-portal mb-4">
        <div className="wiki-portal-header">Web Clipping</div>
        <div className="wiki-portal-body text-[13px]">
          <p className="mb-2">Capture content from the web directly into the wiki without switching context.</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Browser extension</strong> — Manifest V3 Chrome/Edge/Brave extension; popup pre-fills title and selected text, lets you set category, saves as draft via the API. Install guide at <Link href="/clipper-extension">/clipper-extension</Link>.</li>
            <li><strong>Bookmarklet</strong> — drag-to-install JavaScript bookmark; clips any page URL + title (or selected text) as a draft article. Install at <Link href="/bookmarklet">/bookmarklet</Link>.</li>
            <li>Selected text is wrapped in a blockquote with a source link; page HTML has nav/scripts stripped automatically</li>
          </ul>
        </div>
      </div>

      {/* Import & Export */}
      <div className="wiki-portal mb-4">
        <div className="wiki-portal-header">Import &amp; Export</div>
        <div className="wiki-portal-body text-[13px]">
          <p className="mb-1 font-bold text-heading">Import</p>
          <ul className="list-disc pl-5 mb-3 space-y-0.5">
            <li><strong>File upload</strong> — drag-and-drop <code className="bg-surface-hover px-1 text-[12px]">.md</code>, <code className="bg-surface-hover px-1 text-[12px]">.txt</code>, <code className="bg-surface-hover px-1 text-[12px]">.html</code>, or <code className="bg-surface-hover px-1 text-[12px]">.json</code> at <Link href="/import">/import</Link></li>
            <li><strong>Obsidian vault</strong> — upload a <code className="bg-surface-hover px-1 text-[12px]">.zip</code>; front matter and <code className="bg-surface-hover px-1 text-[12px]">[[wikilinks]]</code> resolved automatically</li>
            <li><strong>Notion</strong> — connect integration token and import a page tree</li>
            <li><strong>Confluence</strong> — paste or upload a Confluence HTML export; title and content extracted, macros stripped</li>
          </ul>
          <p className="mb-1 font-bold text-heading">Export</p>
          <ul className="list-disc pl-5 space-y-0.5">
            <li>PDF (browser print), Markdown (<code className="bg-surface-hover px-1 text-[12px]">.md</code>), ePub 3, Word (.docx) — per article via the <strong>Export ▾</strong> menu</li>
            <li>Category export — entire category as multi-chapter ePub or zip from the admin area</li>
            <li><strong>Bulk ZIP export</strong> — download the entire wiki (or a single category) as a <code className="bg-surface-hover px-1 text-[12px]">.zip</code> of Markdown files, one per article, organised in category subfolders with YAML front-matter</li>
          </ul>
        </div>
      </div>

      {/* APIs & Integrations */}
      <div className="wiki-portal mb-4">
        <div className="wiki-portal-header">APIs &amp; Integrations</div>
        <div className="wiki-portal-body text-[13px]">
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>REST API v1</strong> — <code className="bg-surface-hover px-1 text-[12px]">/api/v1/</code> with <code className="bg-surface-hover px-1 text-[12px]">X-API-Key</code> auth. See <Link href="/api-docs">API Documentation</Link>.</li>
            <li><strong>REST API v2</strong> — pagination cursors, field selection</li>
            <li><strong>GraphQL API</strong> — <code className="bg-surface-hover px-1 text-[12px]">/api/graphql</code> powered by graphql-yoga; includes GraphiQL playground. Queries for articles, categories, tags, revisions, search, and stats.</li>
            <li><strong>RSS &amp; Atom feeds</strong> — <code className="bg-surface-hover px-1 text-[12px]">/feed.xml</code> and <code className="bg-surface-hover px-1 text-[12px]">/feed/atom</code></li>
            <li><strong>Webhooks</strong> — HTTP callbacks dispatched on article events; delivery log at <Link href="/admin/webhooks">/admin/webhooks</Link></li>
            <li><strong>Embeds</strong> — iframe-safe embed tokens per article at <code className="bg-surface-hover px-1 text-[12px]">/embed/[token]</code></li>
            <li><strong>Slack</strong> — <code className="bg-surface-hover px-1 text-[12px]">/wiki &lt;query&gt;</code> slash command to search from Slack</li>
            <li><strong>Discord</strong> — <code className="bg-surface-hover px-1 text-[12px]">/wiki</code> slash command in Discord</li>
            <li><strong>Issue links</strong> — link GitHub, Jira, or Linear issues to articles with inline status badges</li>
            <li><strong>Federated peers</strong> — configure peer wiki instances for cross-wiki search at <Link href="/admin/federated-peers">/admin/federated-peers</Link></li>
          </ul>
        </div>
      </div>

      {/* Interactive Map */}
      <div className="wiki-portal mb-4">
        <div className="wiki-portal-header">Interactive Map</div>
        <div className="wiki-portal-body text-[13px]">
          <p className="mb-2">Optional feature. Enable with <code className="bg-surface-hover px-1 text-[12px]">NEXT_PUBLIC_MAP_ENABLED=true</code>.</p>
          <ul className="list-disc pl-5 space-y-0.5">
            <li>Multiple maps with custom background images and named layers</li>
            <li>Clickable polygon areas linked to articles with hover tooltips</li>
            <li>Different marker detail levels per zoom tier</li>
            <li>Admin edit mode: draw, reshape, recolor, link to articles</li>
          </ul>
        </div>
      </div>

      {/* Accessibility */}
      <div className="wiki-portal mb-4">
        <div className="wiki-portal-header">Accessibility &amp; Reading Comfort</div>
        <div className="wiki-portal-body text-[13px]">
          <ul className="list-disc pl-5 space-y-0.5">
            <li><strong>Dyslexia mode</strong> — OpenDyslexic font, increased spacing, warm background tint (persists across sessions)</li>
            <li><strong>RTL toggle</strong> — switch article content to right-to-left reading direction</li>
            <li><strong>Audio narration</strong> — text-to-speech via ElevenLabs (if configured) or browser synthesis; includes speed control</li>
            <li><strong>Machine translation</strong> — DeepL or Google Translate (requires API key)</li>
            <li><strong>Skip-to-content link</strong> — visible on keyboard focus on every page</li>
            <li><strong>Keyboard shortcuts overlay</strong> — press <kbd>?</kbd> anywhere to open a categorized shortcuts modal (navigation, article, editor, general)</li>
            <li><strong>Keyboard shortcut customization</strong> — remap navigation chords at <Link href="/settings/shortcuts">/settings/shortcuts</Link>; overrides saved in browser localStorage</li>
            <li><strong>Article lock</strong> — editor page acquires a 10-minute lock; other users see a &ldquo;Being edited by X&rdquo; warning with admin force-unlock option</li>
          </ul>
        </div>
      </div>

      {/* Administration */}
      <div className="wiki-portal mb-4">
        <div className="wiki-portal-header">Administration</div>
        <div className="wiki-portal-body text-[13px]">
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Roles</strong> — Viewer (read only), Editor (create/edit), Admin (full access)</li>
            <li><strong>Multi-user accounts</strong> — registration, profiles at <code className="bg-surface-hover px-1 text-[12px]">/users/[username]</code>, settings at <Link href="/settings">/settings</Link></li>
            <li><strong>Admin dashboard</strong> — review queue, statistics, embed tokens at <Link href="/admin">/admin</Link></li>
            <li><strong>Announcement banner</strong> — post a site-wide notice (info/warning/success/error) with optional expiry at <Link href="/admin/announcements">/admin/announcements</Link>; users can dismiss per session</li>
            <li><strong>Analytics</strong> — scroll depth heatmap, navigation paths at <Link href="/admin/analytics">/admin/analytics</Link></li>
            <li><strong>Performance metrics</strong> — system metrics at <Link href="/admin/metrics">/admin/metrics</Link></li>
            <li><strong>Health score</strong> — A–F grade for link coverage, freshness, stub %, search gaps at <Link href="/admin/health">/admin/health</Link></li>
            <li><strong>Content lint</strong> — broken links, missing excerpts, orphans at <Link href="/admin/lint">/admin/lint</Link></li>
            <li><strong>Stale articles</strong> — articles not updated in 180+ days at <Link href="/admin/staleness">/admin/staleness</Link></li>
            <li><strong>Embeddings coverage</strong> — semantic search index per article at <Link href="/admin/embeddings">/admin/embeddings</Link></li>
            <li><strong>Plugins</strong> — enable/disable wiki plugins at <Link href="/admin/plugins">/admin/plugins</Link></li>
            <li><strong>Webhooks</strong> — configure HTTP callbacks at <Link href="/admin/webhooks">/admin/webhooks</Link></li>
            <li><strong>Templates</strong> — manage reusable article templates at <Link href="/admin/templates">/admin/templates</Link></li>
            <li><strong>Theme</strong> — site-wide colour and typography at <Link href="/admin/theme">/admin/theme</Link></li>
            <li><strong>Macros</strong> — define reusable content macros at <Link href="/admin/macros">/admin/macros</Link></li>
            <li><strong>Content schedule</strong> — schedule article publishing at <Link href="/admin/content-schedule">/admin/content-schedule</Link></li>
            <li><strong>Kanban board</strong> — manage articles as cards in a Kanban workflow at <Link href="/admin/kanban">/admin/kanban</Link></li>
            <li><strong>Audit log</strong> — complete admin action log at <Link href="/admin/audit-log">/admin/audit-log</Link></li>
            <li><strong>Import tools</strong> — Confluence, Notion, Obsidian import at <Link href="/admin/import">/admin/import</Link></li>
            <li><strong>Category merge</strong> — merge two categories at <Link href="/admin/categories">/admin/categories</Link>; all articles and sub-categories from the source are reassigned to the target, then the source is deleted</li>
            <li><strong>Word-count distribution</strong> — histogram of article lengths at <Link href="/admin/word-count">/admin/word-count</Link> with longest/shortest tables and average word count</li>
            <li><strong>Batch operations</strong> — bulk-assign category, publish/unpublish, or delete from <Link href="/articles">/articles</Link></li>
            <li><strong>Tag management</strong> — rename, recolor, and delete tags inline at <Link href="/admin/tags">/admin/tags</Link> with article count and filterable list</li>
            <li><strong>Bulk tag operations</strong> — apply or remove a tag from multiple selected articles at once via the article list batch action bar</li>
            <li><strong>PWA / installable app</strong> — web app manifest enables the wiki to be installed on mobile and desktop home screens with a standalone display mode</li>
            <li><strong>External link click tracking</strong> — outbound link clicks logged per article; admin view at <Link href="/admin/external-links">/admin/external-links</Link></li>
            <li><strong>Prefetch on hover</strong> — internal article links are prefetched on mouse-over for near-instant navigation</li>
            <li><strong>Font size preference</strong> — S/M/L/XL reading size selector in the article toolbar; persisted to browser storage</li>
            <li><strong>Focus paragraph mode</strong> — dims all non-hovered paragraphs for distraction-free reading; toggle in article toolbar, persisted</li>
            <li><strong>Saved search alerts</strong> — per-saved-search notification alerts; when new articles match a saved query the user gets an in-app notification; manageable at <Link href="/settings/saved-searches">/settings/saved-searches</Link></li>
            <li><strong>Speed reader (RSVP)</strong> — flashes one word at a time from the article; ORP pivot character highlighted in accent colour; 150/250/400/600 WPM modes; progress bar; Start/Pause/Resume controls in article toolbar</li>
            <li><strong>Article blame view</strong> — paragraph-level authorship at <code className="bg-surface-hover px-1 text-[12px]">/articles/[slug]/blame</code>; each paragraph colour-coded by the revision that introduced it with editor name, date, and edit summary</li>
            <li><strong>Article polls</strong> — admins attach polls to articles; readers vote once per session; vote counts revealed after voting or when poll is closed; admins can close, reopen, or delete polls</li>
            <li><strong>Reading ETA</strong> — live <code className="bg-surface-hover px-1 text-[12px]">~X min left</code> counter in the article byline that decreases as you scroll; disappears on completion</li>
            <li><strong>Night reading mode</strong> — warm sepia-toned dark theme toggled via moon button in article toolbar; persisted to browser storage</li>
            <li><strong>Search history</strong> — browser-local list of last 20 successful searches; shown as clickable chips on the search page when no query is entered; clearable</li>
            <li><strong>High-contrast mode</strong> — pure black background with white text and yellow accents for maximum readability; toggle in article toolbar; persisted</li>
            <li><strong>Text-only mode</strong> — hides all images, figures, and media from article content for distraction-free reading; toolbar toggle; persisted</li>
            <li><strong>Content warning tags</strong> — admins add CW labels (spoilers, violence, mature, etc.) to articles; shown as a dismissible amber banner before article body</li>
            <li><strong>Content gap analysis</strong> — admin dashboard at <Link href="/admin/content-gaps">/admin/content-gaps</Link> shows zero-result and low-result search queries to highlight missing wiki topics</li>
            <li><strong>Theme customizer</strong> — floating color-swatch button in article toolbar; HSL hue slider picks the accent color live; persisted to browser storage</li>
            <li><strong>Font preference</strong> — dropdown in article toolbar to switch article body font between Default, Serif, Sans, or Mono; persisted to browser storage</li>
            <li><strong>Article quick notes</strong> — collapsible private note panel on every article page; stored only in the browser; save and delete controls</li>
            <li><strong>Maintenance mode</strong> — admin toggle at <Link href="/admin/maintenance">/admin/maintenance</Link> displays a site-wide yellow banner when the wiki is under maintenance</li>
            <li><strong>Cleanup tags</strong> — admins mark articles with attention flags (Needs Images, Needs Expansion, Needs Citations, Needs Review, Stub, Outdated); shown as orange notice on article page</li>
            <li><strong>Article adoption</strong> — admins can mark articles as abandoned; article page shows a banner with a one-click adopt button for editors</li>
            <li><strong>Copy as plain text</strong> — toolbar button strips all HTML and copies the article body as plain text to the clipboard</li>
            <li><strong>Scheduled announcements</strong> — set a future go-live time on announcements; hidden from users until the scheduled date arrives</li>
            <li><strong>Read-only mode</strong> — admin toggle at <Link href="/admin/read-only">/admin/read-only</Link>; blue banner and blocks non-admin edits when active</li>
            <li><strong>Revision pruning</strong> — admin tool to preview and delete old revisions beyond a configurable threshold (keep latest N per article)</li>
            <li><strong>User activity log</strong> — admin view of any user&apos;s full revision history with article, edit summary, and date</li>
            <li><strong>Session management</strong> — view all active sessions at <Link href="/settings/sessions">/settings/sessions</Link> with device and IP; revoke individual or all other sessions</li>
            <li><strong>AI tag suggestions</strong> — &ldquo;AI suggest&rdquo; button in article edit form automatically suggests and applies relevant existing tags</li>
            <li><strong>AI category suggestions</strong> — &ldquo;AI suggest&rdquo; button on the category picker auto-selects the best-fit category based on article content</li>
            <li><strong>AI title suggestions</strong> — &ldquo;AI suggest&rdquo; button on the title field returns 5 clickable alternative encyclopedic titles</li>
            <li><strong>Featured article badge</strong> — admins can mark articles as Featured; a gold star badge appears in the article title area</li>
            <li><strong>Auto-save indicator</strong> — article edit form auto-saves draft to localStorage after 2 s of inactivity; shows &ldquo;Unsaved changes&rdquo; / &ldquo;Draft saved&rdquo; status above the editor</li>
            <li><strong>Character count</strong> — displayed alongside word count in the article byline; abbreviated for large articles</li>
            <li><strong>Did-you-mean suggestions</strong> — zero-result searches suggest the closest matching article title as a clickable link</li>
            <li><strong>Tag cloud</strong> — <Link href="/tags/cloud">/tags/cloud</Link> shows all tags sized proportionally by article count</li>
            <li><strong>Writing velocity</strong> — admin chart at <Link href="/admin/writing-velocity">/admin/writing-velocity</Link> shows words added per week over the last 12 weeks</li>
            <li><strong>Custom branding</strong> — name, tagline, welcome text, footer via <code className="bg-surface-hover px-1 text-[12px]">NEXT_PUBLIC_*</code> environment variables</li>
          </ul>
        </div>
      </div>

      <div className="wiki-notice">
        For detailed usage instructions and keyboard shortcuts, see the <Link href="/help">Help &amp; Features Guide</Link>.
        For API reference, see <Link href="/api-docs">API Documentation</Link>.
      </div>
    </div>
  );
}
