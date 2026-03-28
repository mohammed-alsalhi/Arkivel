import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help",
};

export default function HelpPage() {
  return (
    <div>
      <h1
        className="text-[1.7rem] font-normal text-heading border-b border-border pb-1 mb-3"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Help &amp; Features Guide
      </h1>

      <p className="text-[13px] text-muted mb-4">
        This guide covers all features available in the wiki. Use the sections below to learn how to create, edit, organize, and get the most from your articles.
        For a feature overview see <Link href="/features">Features</Link>.
      </p>

      {/* Getting Started */}
      <div className="wiki-portal mb-4">
        <div className="wiki-portal-header">Getting Started</div>
        <div className="wiki-portal-body text-[13px]">
          <p className="mb-2">
            To create a new article, click <Link href="/articles/new">Create new article</Link> in the sidebar or navigate to <Link href="/articles/new">/articles/new</Link>.
          </p>
          <p className="mb-2">Each article has:</p>
          <ul className="list-disc pl-5 mb-2 space-y-0.5">
            <li><strong>Title</strong> &mdash; the article name, used to generate the URL slug</li>
            <li><strong>Content</strong> &mdash; rich text body written in the Tiptap editor</li>
            <li><strong>Category</strong> &mdash; optional, for organizing articles into groups</li>
            <li><strong>Tags</strong> &mdash; optional labels for cross-cutting topics</li>
            <li><strong>Excerpt</strong> &mdash; short summary shown in search results and article lists</li>
            <li><strong>Status</strong> &mdash; Draft (admin-only), Review, or Published (visible to all)</li>
          </ul>
        </div>
      </div>

      {/* The Editor */}
      <div className="wiki-portal mb-4">
        <div className="wiki-portal-header">The Editor</div>
        <div className="wiki-portal-body text-[13px]">
          <p className="mb-2">The rich text editor provides a toolbar with formatting options:</p>
          <ul className="list-disc pl-5 mb-2 space-y-0.5">
            <li><strong>B / I / S</strong> &mdash; Bold, Italic, Strikethrough</li>
            <li><strong>H1 / H2 / H3</strong> &mdash; Heading levels</li>
            <li><strong>&bull; / 1.</strong> &mdash; Bullet and ordered lists</li>
            <li><strong>&ldquo;</strong> &mdash; Blockquote</li>
            <li><strong>&lt;&gt;</strong> &mdash; Code block with syntax highlighting</li>
            <li><strong>&mdash;</strong> &mdash; Horizontal rule</li>
            <li><strong>Link icon</strong> &mdash; Insert a URL link</li>
            <li><strong>Image icon</strong> &mdash; Upload an image</li>
            <li><strong>[[]]</strong> &mdash; Insert a wiki link</li>
            <li><strong>Table</strong> &mdash; Insert a table</li>
            <li><strong>Detect Links</strong> &mdash; Scan text for potential wiki links</li>
            <li><strong>fn</strong> &mdash; Insert a footnote / citation</li>
            <li><strong>Mermaid</strong> &mdash; Insert a diagram (via slash command <code className="bg-surface-hover px-1 text-[12px]">/mermaid</code>)</li>
            <li><strong>&Sigma;</strong> &mdash; Insert a math expression (KaTeX)</li>
            <li><strong>Microphone</strong> &mdash; Voice dictation (browser speech recognition)</li>
          </ul>
          <p className="mb-2">
            <strong>Slash commands:</strong> Type <code className="bg-surface-hover px-1 text-[12px]">/</code> anywhere in the editor to open the command palette. Commands include: Mermaid diagram, Math block, Excalidraw drawing, Data table, Decision tree, heading/list types, accordion/FAQ block, two-column layout, YouTube/Vimeo video embed, GitHub Gist embed, and your saved snippets via <code className="bg-surface-hover px-1 text-[12px]">/snippet</code>.
          </p>
          <p className="mb-2">
            <strong>Markdown mode:</strong> Click the <code className="bg-surface-hover px-1 text-[12px]">Markdown</code> button to switch to raw markdown editing. Click <code className="bg-surface-hover px-1 text-[12px]">Rich Text</code> to switch back.
          </p>
          <p className="mb-2">
            <strong>Templates:</strong> When creating a new article, choose from predefined templates (Person, Place, Event, Thing, Group) that provide a starting structure with an infobox and sections.
          </p>
          <p className="mb-2">
            <strong>Outline builder:</strong> A collapsible panel below the editor generates a structured list of section headings from the article title. Choose Encyclopedic, Tutorial, or Reference style. Click <strong>Insert into article</strong> to add the headings as editable H2/H3 nodes.
          </p>
          <p className="mb-2">
            <strong>AI alt-text:</strong> When you upload an image, the caption prompt is pre-filled with a suggested description based on the filename (AI-enhanced when <code className="bg-surface-hover px-1 text-[12px]">AI_API_KEY</code> is configured).
          </p>
          <p>
            <strong>Grammar &amp; style checker:</strong> A collapsible &ldquo;Grammar &amp; style&rdquo; panel below the editor checks your text for issues. Click <strong>Check now</strong> to analyse; each issue shows a severity (error / warning / style) with an <strong>Apply</strong> button to fix it inline.
          </p>
        </div>
      </div>

      {/* Rich Content Blocks */}
      <div className="wiki-portal mb-4">
        <div className="wiki-portal-header">Rich Content Blocks</div>
        <div className="wiki-portal-body text-[13px]">
          <p className="mb-2">Beyond standard text, the editor supports specialized content blocks inserted via slash commands:</p>
          <ul className="list-disc pl-5 mb-2 space-y-1">
            <li><strong>Mermaid diagrams</strong> &mdash; write <code className="bg-surface-hover px-1 text-[12px]">graph TD; A--&gt;B</code> syntax; renders as a flowchart, sequence diagram, Gantt chart, etc. on the article page</li>
            <li><strong>Math (KaTeX)</strong> &mdash; inline math with <code className="bg-surface-hover px-1 text-[12px]">$...$</code> and block math with <code className="bg-surface-hover px-1 text-[12px]">$$...$$</code></li>
            <li><strong>Excalidraw</strong> &mdash; embed an interactive whiteboard drawing; stored as JSON and rendered read-only on the article page</li>
            <li><strong>Data table</strong> &mdash; paste CSV or JSON data to create a sortable, filterable table with a CSV download button</li>
            <li><strong>Decision tree</strong> &mdash; define a yes/no tree as JSON; renders as an interactive SVG with expand/collapse</li>
          </ul>
          <p><strong>Voice dictation:</strong> Click the microphone button in the toolbar to speak &mdash; your words are inserted at the cursor using the browser&apos;s speech recognition.</p>
        </div>
      </div>

      {/* Presentation Mode */}
      <div className="wiki-portal mb-4">
        <div className="wiki-portal-header">Presentation Mode</div>
        <div className="wiki-portal-body text-[13px]">
          <p>
            Click <strong>Present</strong> in the article action bar to open the article as a slideshow. Each H2 / H3 heading becomes a new slide. Use arrow keys or click to advance. Press <kbd>Esc</kbd> to exit.
          </p>
        </div>
      </div>

      {/* Article Action Bar */}
      <div className="wiki-portal mb-4">
        <div className="wiki-portal-header">Article Action Bar</div>
        <div className="wiki-portal-body text-[13px]">
          <p className="mb-2">The toolbar below the article title provides quick actions grouped into four sections:</p>
          <ul className="list-disc pl-5 space-y-0.5">
            <li><strong>Present</strong> &mdash; open as a slideshow</li>
            <li><strong>Bookmark</strong> &mdash; save to your personal bookmarks with an optional note</li>
            <li><strong>+ List</strong> &mdash; add to one of your reading lists</li>
            <li><strong>Copy link</strong> &mdash; copy the article URL to the clipboard</li>
            <li><strong>Share</strong> &mdash; native share sheet (or clipboard fallback)</li>
            <li><strong>Print</strong> &mdash; clean print layout (hides navigation UI)</li>
            <li><strong>Export ▾</strong> &mdash; download as PDF, Markdown, ePub, or Word (.docx)</li>
            <li><strong>Aa</strong> &mdash; toggle dyslexia-friendly font and spacing</li>
            <li><strong>RTL</strong> &mdash; toggle right-to-left reading direction for the article</li>
            <li><strong>Translate ▾</strong> &mdash; machine-translate to another language (requires API key)</li>
          </ul>
        </div>
      </div>

      {/* Wiki Links */}
      <div className="wiki-portal mb-4">
        <div className="wiki-portal-header">Wiki Links</div>
        <div className="wiki-portal-body text-[13px]">
          <p className="mb-1 font-bold text-heading">Typing syntax</p>
          <ul className="list-disc pl-5 mb-3 space-y-0.5">
            <li>Type <code className="bg-surface-hover px-1 text-[12px]">[[Article Name]]</code> &mdash; auto-converts to a wiki link</li>
            <li>Type <code className="bg-surface-hover px-1 text-[12px]">[[Article Name|Display Text]]</code> &mdash; link with custom display text</li>
          </ul>
          <p className="mb-1 font-bold text-heading">Link suggester</p>
          <p className="mb-3">
            Type <code className="bg-surface-hover px-1 text-[12px]">[[</code> to open the autocomplete dropdown. Use arrow keys to navigate, Enter to select, Escape to dismiss.
          </p>
          <p className="mb-1 font-bold text-heading">Link status</p>
          <p className="mb-2">
            Links to existing articles appear in <span className="text-wiki-link">blue</span>. Links to missing articles appear in <span className="text-wiki-link-broken">red</span> &mdash; a cue to create that article.
          </p>
          <p className="mb-1 font-bold text-heading">Keyboard shortcut</p>
          <p>Press <code className="bg-surface-hover px-1 text-[12px]">Ctrl+Shift+L</code> (Cmd on Mac) to insert a wiki link.</p>
        </div>
      </div>

      {/* Search */}
      <div className="wiki-portal mb-4">
        <div className="wiki-portal-header">Search</div>
        <div className="wiki-portal-body text-[13px]">
          <ul className="list-disc pl-5 space-y-0.5">
            <li>The search bar provides instant results as you type; press <strong>Enter</strong> for the <Link href="/search">full search page</Link></li>
            <li>Multi-word queries use <strong>AND</strong> logic — every word must appear somewhere in the article</li>
            <li>Results are ranked: exact title match &gt; starts with &gt; title contains &gt; content-only</li>
            <li><strong>Semantic search:</strong> set <code className="bg-surface-hover px-1 text-[12px]">OPENAI_API_KEY</code> to blend AI-ranked results based on meaning, not just keywords</li>
            <li><strong>Federated search:</strong> when peer wikis are configured, results from other wikis appear in a separate section on the search page automatically</li>
          </ul>
        </div>
      </div>

      {/* AI Features */}
      <div className="wiki-portal mb-4">
        <div className="wiki-portal-header">AI Features</div>
        <div className="wiki-portal-body text-[13px]">
          <p className="mb-2">AI features are gated on environment variables and degrade gracefully when keys are absent.</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Writing Coach</strong> &mdash; collapsible panel at the bottom of the editor. Shows Flesch-Kincaid readability score, passive-voice count, sentence length stats, and AI suggestions.</li>
            <li><strong>Article summaries</strong> &mdash; auto-generated on save; used as the page meta description.</li>
            <li><strong>Semantic search</strong> &mdash; vector embeddings via OpenAI. Requires <code className="bg-surface-hover px-1 text-[12px]">OPENAI_API_KEY</code>.</li>
            <li><strong>Knowledge gaps</strong> &mdash; <Link href="/admin/knowledge-gaps">/admin/knowledge-gaps</Link> lists referenced but uncreated article titles, sorted by incoming-link count.</li>
            <li><strong>Duplicate detection</strong> &mdash; checks for semantically similar existing articles when creating a new one.</li>
            <li><strong>Category suggestions</strong> &mdash; Claude suggests topics missing from a category.</li>
            <li><strong>Quiz generation</strong> &mdash; Claude generates 5 multiple-choice questions from any article for self-testing.</li>
          </ul>
        </div>
      </div>

      {/* Learning & Retention */}
      <div className="wiki-portal mb-4">
        <div className="wiki-portal-header">Learning &amp; Retention</div>
        <div className="wiki-portal-body text-[13px]">
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Learning Paths</strong> &mdash; curated sequences of articles. Browse at <Link href="/learning-paths">/learning-paths</Link> or create your own. Progress is tracked per path.</li>
            <li><strong>Flashcards</strong> &mdash; create flashcards from any article. Review due cards at <Link href="/flashcards">/flashcards</Link> using the SM-2 spaced repetition algorithm (grade 0–5 after each card).</li>
            <li><strong>Quizzes</strong> &mdash; AI-generated multiple choice questions per article. Results saved to your quiz history.</li>
            <li><strong>Reading progress</strong> &mdash; mark articles as read. Track completion by category via the progress ring on category pages.</li>
            <li><strong>Email digest</strong> &mdash; opt in under Settings → Digest to receive a scheduled summary email of watchlist changes.</li>
          </ul>
        </div>
      </div>

      {/* Discovery & Navigation */}
      <div className="wiki-portal mb-4">
        <div className="wiki-portal-header">Discovery &amp; Navigation</div>
        <div className="wiki-portal-body text-[13px]">
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Bookmarks</strong> &mdash; save articles with optional notes at <Link href="/bookmarks">/bookmarks</Link>.</li>
            <li><strong>Reading Lists</strong> &mdash; organize articles into ordered lists at <Link href="/reading-lists">/reading-lists</Link>. Lists can be made public and shared via a link.</li>
            <li><strong>Smart Collections</strong> &mdash; saved searches with filters (tags, category, author, date range) at <Link href="/collections">/collections</Link>.</li>
            <li><strong>TIL (Today I Learned)</strong> &mdash; post short (280-char) notes at <Link href="/til">/til</Link>. Tag them for discovery.</li>
            <li><strong>Explore mode</strong> &mdash; guided walk through articles using semantic similarity at <Link href="/explore">/explore</Link>.</li>
            <li><strong>Session reading trail</strong> &mdash; collapsible breadcrumb at the bottom of each article showing your navigation history for the current session.</li>
            <li><strong>Reading history</strong> &mdash; browser-local list of the last 50 articles you visited, with relative timestamps, at <Link href="/history">/history</Link>. No server data stored.</li>
            <li><strong>Last-visit badge</strong> &mdash; on return visits, articles show &ldquo;You read this X ago&rdquo; in the article header.</li>
            <li><strong>Sticky article header</strong> &mdash; a slim floating bar with the article title, Edit and Top links appears after scrolling past the article&apos;s heading.</li>
            <li><strong>Article Q&amp;A</strong> &mdash; &ldquo;Ask a question&rdquo; panel at the bottom of every article; answers are grounded in wiki content and cite source articles.</li>
            <li><strong>Suggest edit</strong> &mdash; a &ldquo;Suggest edit&rdquo; link at the bottom of every article opens an inline form where anyone can propose a correction; admins review suggestions at <Link href="/admin/suggestions">/admin/suggestions</Link>.</li>
            <li><strong>Popularity leaderboard</strong> &mdash; <Link href="/popular">/popular</Link> ranks published articles by read and reaction activity.</li>
            <li><strong>Article comparison</strong> &mdash; open two articles side by side at <code className="bg-surface-hover px-1 text-[12px]">/compare?a=slug1&amp;b=slug2</code>.</li>
            <li><strong>Contributor leaderboard</strong> &mdash; <Link href="/leaderboard">/leaderboard</Link> shows top editors ranked by revision count.</li>
            <li><strong>Discussion index</strong> &mdash; <Link href="/discussions">/discussions</Link> lists all open discussion threads across every article, filterable by article slug and author.</li>
            <li><strong>Activity heat map</strong> &mdash; <Link href="/activity">/activity</Link> shows a GitHub-style contribution calendar of daily edit counts over the past 52 weeks.</li>
            <li><strong>Wiki stats</strong> &mdash; <Link href="/stats">/stats</Link> displays total articles, word count, categories, tags, contributors, revisions, weekly active users, and a top-contributors leaderboard.</li>
            <li><strong>Mentions feed</strong> &mdash; <Link href="/mentions">/mentions</Link> lists every discussion thread that mentions your <code className="bg-surface-hover px-1 text-[12px]">@username</code> (requires login).</li>
          </ul>
        </div>
      </div>

      {/* Article Page */}
      <div className="wiki-portal mb-4">
        <div className="wiki-portal-header">Article Page Features</div>
        <div className="wiki-portal-body text-[13px]">
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Reading time</strong> &mdash; every article shows &ldquo;~X min read&rdquo; in the byline, estimated at 200 words per minute.</li>
            <li><strong>Reading mode</strong> &mdash; click &ldquo;Reading mode&rdquo; in the article toolbar (or press <kbd>R</kbd>) to enter a distraction-free view that hides the header and sidebar. Press again or <kbd>R</kbd> to exit.</li>
            <li><strong>Draft share links</strong> &mdash; admins can generate a secret URL (<code className="bg-surface-hover px-1 text-[12px]">POST /api/articles/[id]/share-token</code>) so anyone with the link can preview a draft at <code className="bg-surface-hover px-1 text-[12px]">/share/[token]</code> without needing to log in.</li>
            <li><strong>Expiry warning banner</strong> &mdash; a yellow notice appears when an article&apos;s <em>Review due</em> date is within 30 days, prompting editors to verify its accuracy.</li>
            <li><strong>Mark as verified</strong> &mdash; admins see a &ldquo;Mark as verified&rdquo; button at the bottom of each article. Clicking it stamps the current date as <em>lastVerifiedAt</em>, shown as a &ldquo;✓ Verified&rdquo; badge in the byline.</li>
            <li><strong>&ldquo;You might also like&rdquo;</strong> &mdash; up to 5 related articles sharing the same tags are suggested at the bottom of each article.</li>
            <li><strong>Floating table of contents</strong> &mdash; on wide screens (&ge;1280 px) a fixed sidebar TOC highlights the section currently in view.</li>
            <li><strong>Article stats panel</strong> &mdash; collapsible panel at the bottom of every article showing read count, reaction count, word count, quality score, article age, and a 30-day view sparkline.</li>
            <li><strong>Article flags</strong> &mdash; admins assign short labels (e.g. &ldquo;Needs images&rdquo;, &ldquo;Outdated&rdquo;) that appear as orange badges near the article title.</li>
            <li><strong>Article co-authors</strong> &mdash; admins link additional contributors to an article; their names appear in the byline after the primary author.</li>
            <li><strong>Named snapshots</strong> &mdash; admins can save a labeled snapshot of the current article state (e.g. &ldquo;v1.0 – before major rewrite&rdquo;) via <code className="bg-surface-hover px-1 text-[12px]">POST /api/articles/[id]/snapshots</code>.</li>
            <li><strong>Cover image focal point</strong> &mdash; in the article edit form, click or drag on the cover image preview to set a focal point (X%/Y%). The focal point is stored as <em>coverFocalX</em>/<em>coverFocalY</em> and applied as <code className="bg-surface-hover px-1 text-[12px]">object-position</code> when the image is displayed.</li>
          </ul>
        </div>
      </div>

      {/* Collaboration */}
      <div className="wiki-portal mb-4">
        <div className="wiki-portal-header">Collaboration</div>
        <div className="wiki-portal-body text-[13px]">
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Article reactions</strong> &mdash; mark articles as Helpful, Insightful, Outdated, or Confusing via the reaction bar at the bottom.</li>
            <li><strong>Star rating</strong> &mdash; rate any article 1–5 stars using the rating widget below the reaction bar; your rating is saved per session, and the average and count are shown live.</li>
            <li><strong>Article checklist</strong> &mdash; per-article todo list below the article; readers can check off tasks; admins add and delete tasks via the inline form.</li>
            <li><strong>Article forks</strong> &mdash; propose a complete rewrite of any article. Admins review, merge, or reject forks at <Link href="/forks">/forks</Link>.</li>
            <li><strong>Knowledge bounties</strong> &mdash; request articles on specific topics at <Link href="/bounties">/bounties</Link>. Contributors can claim and fulfil them.</li>
            <li><strong>Expert badges</strong> &mdash; admins grant expert badges per category. Expert contributors are highlighted in revision history and bylines.</li>
            <li><strong>Article certification</strong> &mdash; admins can certify articles reviewed by at least two experts. Certified articles show a &ldquo;Verified by experts&rdquo; badge.</li>
            <li><strong>Discussions</strong> &mdash; every article has a Discussion tab. Mention <code className="bg-surface-hover px-1 text-[12px]">@username</code> to notify a contributor.</li>
            <li><strong>Article lock</strong> &mdash; opening the editor acquires a 10-minute lock. Other users editing the same article simultaneously see a &ldquo;Being edited by X&rdquo; warning banner; admins can force-unlock.</li>
            <li><strong>Revision restore</strong> &mdash; on the article history page, click &ldquo;restore&rdquo; next to any revision to revert to it (current content is auto-saved as a new revision first).</li>
          </ul>
        </div>
      </div>

      {/* Accessibility */}
      <div className="wiki-portal mb-4">
        <div className="wiki-portal-header">Accessibility &amp; Reading Comfort</div>
        <div className="wiki-portal-body text-[13px]">
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Dyslexia mode (Aa)</strong> &mdash; click <em>Aa</em> in the action bar to switch to OpenDyslexic font with increased spacing and a warm background tint. Persists across sessions.</li>
            <li><strong>RTL toggle</strong> &mdash; click <em>RTL</em> to switch article content to right-to-left reading direction.</li>
            <li><strong>Audio narration</strong> &mdash; click <em>Listen</em> on any article to hear it read aloud. Uses ElevenLabs if configured; otherwise browser speech synthesis. Includes speed control.</li>
            <li><strong>Machine translation</strong> &mdash; click <em>Translate ▾</em> and select a language. Creates a draft translation via DeepL or Google Translate (requires API key).</li>
            <li><strong>Skip-to-content link</strong> &mdash; first focusable element on every page, visible on keyboard focus.</li>
          </ul>
        </div>
      </div>

      {/* Categories & Tags */}
      <div className="wiki-portal mb-4">
        <div className="wiki-portal-header">Categories &amp; Tags</div>
        <div className="wiki-portal-body text-[13px]">
          <p className="mb-2">
            <strong>Categories</strong> are hierarchical groups shown in the sidebar. Each article belongs to one category. Browse all at <Link href="/categories">Categories</Link>.
          </p>
          <p>
            <strong>Tags</strong> are hierarchical labels; an article can have multiple tags. Browse all at <Link href="/tags">Tags</Link>, which shows a size-scaled tag cloud.
          </p>
        </div>
      </div>

      {/* Revision History */}
      <div className="wiki-portal mb-4">
        <div className="wiki-portal-header">Revision History</div>
        <div className="wiki-portal-body text-[13px]">
          <ul className="list-disc pl-5 space-y-0.5">
            <li>Every save auto-snapshots the current state as a revision</li>
            <li>Click the <strong>History</strong> tab on any article to see all past revisions</li>
            <li>Select two revisions and click <strong>Compare</strong> for a side-by-side diff</li>
            <li>Added text shown in <span className="bg-diff-added px-1">green</span>, removed in <span className="bg-diff-removed px-1">red</span></li>
          </ul>
        </div>
      </div>

      {/* Import & Export */}
      <div className="wiki-portal mb-4">
        <div className="wiki-portal-header">Import &amp; Export</div>
        <div className="wiki-portal-body text-[13px]">
          <p className="mb-1 font-bold text-heading">Import</p>
          <ul className="list-disc pl-5 mb-3 space-y-0.5">
            <li><strong>File upload:</strong> drag-and-drop <code className="bg-surface-hover px-1 text-[12px]">.md</code>, <code className="bg-surface-hover px-1 text-[12px]">.txt</code>, <code className="bg-surface-hover px-1 text-[12px]">.html</code>, or <code className="bg-surface-hover px-1 text-[12px]">.json</code> at <Link href="/import">Import</Link></li>
            <li><strong>Obsidian vault:</strong> upload a <code className="bg-surface-hover px-1 text-[12px]">.zip</code> at <Link href="/import/obsidian">/import/obsidian</Link>. Front matter and <code className="bg-surface-hover px-1 text-[12px]">[[wikilinks]]</code> are resolved automatically.</li>
            <li><strong>Notion:</strong> connect your Notion integration token and import a page tree at <Link href="/import/notion">/import/notion</Link>.</li>
          </ul>
          <p className="mb-1 font-bold text-heading">Export</p>
          <ul className="list-disc pl-5 space-y-0.5">
            <li><strong>PDF</strong> &mdash; print-ready window using your browser&apos;s print dialog</li>
            <li><strong>Markdown</strong> &mdash; downloads as a <code className="bg-surface-hover px-1 text-[12px]">.md</code> file</li>
            <li><strong>ePub</strong> &mdash; downloads as a valid ePub 3 e-book</li>
            <li><strong>Word (.docx)</strong> &mdash; downloads as a Microsoft Word document</li>
            <li><strong>Category export:</strong> export an entire category as a multi-chapter ePub or zip from the admin area</li>
            <li><strong>Bulk ZIP export:</strong> download the entire wiki (or one category) as a <code className="bg-surface-hover px-1 text-[12px]">.zip</code> of Markdown files from the <Link href="/export">Export</Link> page — one <code className="bg-surface-hover px-1 text-[12px]">.md</code> per article with YAML front-matter, organised in category subfolders</li>
          </ul>
          <p className="mt-2">All export formats are in the <strong>Export ▾</strong> dropdown on every article page.</p>
          <p className="mb-1 mt-3 font-bold text-heading">Confluence import</p>
          <p className="mb-1">Upload a Confluence HTML export file or paste the HTML directly at <Link href="/admin/import">/admin/import</Link>. The title is extracted from the page heading and Confluence macros are stripped. The result is saved as a draft article.</p>
        </div>
      </div>

      {/* Web Clipping */}
      <div className="wiki-portal mb-4">
        <div className="wiki-portal-header">Web Clipping</div>
        <div className="wiki-portal-body text-[13px]">
          <p className="mb-2">Save content from the web directly into the wiki without leaving your browser.</p>
          <p className="mb-1 font-bold text-heading">Browser extension</p>
          <p className="mb-2">
            Install the Manifest V3 browser extension (Chrome, Edge, Brave) from <Link href="/clipper-extension">/clipper-extension</Link>. Click the extension popup on any page: the title and selected text are pre-filled; choose a category and click <strong>Save to Wiki</strong>. The article is created as a draft and the popup offers &ldquo;Open editor&rdquo; to refine it.
          </p>
          <p className="mb-1 font-bold text-heading">Bookmarklet</p>
          <p>
            Go to <Link href="/bookmarklet">/bookmarklet</Link> and drag the button to your bookmarks bar (or copy the code). Click the bookmarklet on any page to clip the URL, title, and selected text as a draft article. Selected text is wrapped in a blockquote with a source link; full-page HTML has nav/headers/scripts stripped.
          </p>
        </div>
      </div>

      {/* Whiteboards */}
      <div className="wiki-portal mb-4">
        <div className="wiki-portal-header">Whiteboards</div>
        <div className="wiki-portal-body text-[13px]">
          <p className="mb-2">
            Create standalone Excalidraw canvases at <Link href="/whiteboards">/whiteboards</Link>. These are separate from the Excalidraw blocks you can embed inside articles.
          </p>
          <ul className="list-disc pl-5 space-y-0.5">
            <li>Create unlimited named canvases; the canvas auto-saves 2 seconds after each change</li>
            <li>Edit the title inline at the top of the editor</li>
            <li>Full Excalidraw toolkit: shapes, text, arrows, images, freehand drawing</li>
          </ul>
        </div>
      </div>

      {/* Dashboard */}
      <div className="wiki-portal mb-4">
        <div className="wiki-portal-header">Personal Dashboard</div>
        <div className="wiki-portal-body text-[13px]">
          <p className="mb-2">
            Your personalized homepage at <Link href="/dashboard">/dashboard</Link> shows a grid of widgets you can rearrange and toggle.
          </p>
          <ul className="list-disc pl-5 space-y-0.5">
            <li><strong>Available widgets:</strong> Recent articles, Watchlist, Recent edits, Random article, Scratchpad preview, Wiki stats, Notifications</li>
            <li>Click <strong>Customize</strong> to show/hide widgets and drag cards to reorder them</li>
            <li>Layout is saved to your user preferences and restored on every visit</li>
          </ul>
        </div>
      </div>

      {/* Analytics */}
      <div className="wiki-portal mb-4">
        <div className="wiki-portal-header">Analytics &amp; Wiki Health</div>
        <div className="wiki-portal-body text-[13px]">
          <ul className="list-disc pl-5 space-y-0.5">
            <li><strong>Analytics dashboard</strong> &mdash; scroll depth heatmap, reader navigation paths, search gap tracking</li>
            <li><strong>Search analytics</strong> &mdash; <Link href="/admin/search-analytics">/admin/search-analytics</Link> shows daily search volume, top queries with average result counts, and zero-result queries to surface content gaps</li>
            <li><strong>Search gaps</strong> &mdash; <Link href="/admin/search-gaps">/admin/search-gaps</Link> shows top zero-result queries</li>
            <li><strong>Stale articles</strong> &mdash; <Link href="/admin/staleness">/admin/staleness</Link> lists articles not updated in 180+ days</li>
            <li><strong>Wiki health score</strong> &mdash; <Link href="/admin/health">/admin/health</Link> gives an A–F grade: link coverage, freshness, stub %, search gap %, certification %</li>
            <li><strong>Embeddings coverage</strong> &mdash; <Link href="/admin/embeddings">/admin/embeddings</Link> shows AI embedding status per article</li>
          </ul>
        </div>
      </div>

      {/* Achievements */}
      <div className="wiki-portal mb-4">
        <div className="wiki-portal-header">Contributor Achievements</div>
        <div className="wiki-portal-body text-[13px]">
          <p className="mb-2">Achievements are awarded automatically based on contribution activity:</p>
          <ul className="list-disc pl-5 space-y-0.5">
            <li><strong>First edit, 10 edits, 100 edits</strong> &mdash; contribution milestones</li>
            <li><strong>7-day streak / 30-day streak</strong> &mdash; editing on consecutive days</li>
            <li><strong>Category expert</strong> &mdash; significant contributions to a single category</li>
          </ul>
          <p className="mt-2">Unlock notifications appear as a toast after saving.</p>
        </div>
      </div>

      {/* Integrations */}
      <div className="wiki-portal mb-4">
        <div className="wiki-portal-header">Integrations</div>
        <div className="wiki-portal-body text-[13px]">
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Slack:</strong> <code className="bg-surface-hover px-1 text-[12px]">/wiki &lt;query&gt;</code> slash command to search articles from Slack. Requires <code className="bg-surface-hover px-1 text-[12px]">SLACK_SIGNING_SECRET</code>.</li>
            <li><strong>Discord:</strong> <code className="bg-surface-hover px-1 text-[12px]">/wiki</code> slash command in Discord. Requires <code className="bg-surface-hover px-1 text-[12px]">DISCORD_PUBLIC_KEY</code>.</li>
            <li><strong>Issue links:</strong> link GitHub, Jira, or Linear issues to articles. Status badges appear inline on the article page.</li>
            <li><strong>Embeds:</strong> generate an embed token for any article. The view at <code className="bg-surface-hover px-1 text-[12px]">/embed/[token]</code> is iframe-safe with no navigation.</li>
          </ul>
        </div>
      </div>

      {/* Map */}
      <div className="wiki-portal mb-4">
        <div className="wiki-portal-header">Interactive Map</div>
        <div className="wiki-portal-body text-[13px]">
          <p className="mb-2">Optional feature, disabled by default. Enable with <code className="bg-surface-hover px-1 text-[12px]">NEXT_PUBLIC_MAP_ENABLED=true</code>.</p>
          <ul className="list-disc pl-5 space-y-0.5">
            <li>Multiple maps with background images and layers</li>
            <li>Clickable polygon areas linked to articles with hover tooltips</li>
            <li>Zoomable with different detail levels per zoom</li>
            <li>Edit mode: draw, reshape, recolor, link to articles (admin only)</li>
          </ul>
        </div>
      </div>

      {/* Navigation & Organization */}
      <div className="wiki-portal mb-4">
        <div className="wiki-portal-header">Navigation &amp; Organization</div>
        <div className="wiki-portal-body text-[13px]">
          <p className="mb-1">The sidebar is divided into collapsible sections — click any section header to collapse or expand it.</p>
          <p className="font-semibold mb-0.5">Navigation</p>
          <ul className="list-disc pl-5 space-y-0.5 mb-2">
            <li><Link href="/">Main Page</Link>, <Link href="/articles">All articles</Link>, <Link href="/recent-changes">Recent changes</Link>, <Link href="/random">Random article</Link></li>
            <li><Link href="/search">Search</Link>, <Link href="/tags">Tags</Link>, <Link href="/graph">Article graph</Link></li>
          </ul>
          <p className="font-semibold mb-0.5">Discover</p>
          <ul className="list-disc pl-5 space-y-0.5 mb-2">
            <li><Link href="/explore">Explore</Link> — curated entry points; <Link href="/activity">Activity</Link> — recent contribution feed</li>
            <li><Link href="/collections">Collections</Link>, <Link href="/change-requests">Change requests</Link>, <Link href="/reviews">Reviews</Link>, <Link href="/bounties">Bounties</Link>, <Link href="/forks">Forks</Link></li>
          </ul>
          <p className="font-semibold mb-0.5">Personal</p>
          <ul className="list-disc pl-5 space-y-0.5 mb-2">
            <li><Link href="/dashboard">Dashboard</Link>, <Link href="/reading-lists">Reading lists</Link>, <Link href="/bookmarks">Bookmarks</Link>, <Link href="/watchlist">Watchlist</Link></li>
            <li><Link href="/flashcards">Flashcards</Link>, <Link href="/learning-paths">Learning paths</Link>, <Link href="/til">Today I Learned</Link>, <Link href="/scratchpad">Scratchpad</Link>, <Link href="/settings">Settings</Link></li>
          </ul>
          <p className="font-semibold mb-0.5">Tools</p>
          <ul className="list-disc pl-5 space-y-0.5 mb-2">
            <li><Link href="/whiteboards">Whiteboards</Link>, <Link href="/timeline">Timeline</Link>, <Link href="/bookmarklet">Bookmarklet</Link>, <Link href="/clipper-extension">Clipper extension</Link></li>
          </ul>
          <p className="font-semibold mb-0.5">Article structure</p>
          <ul className="list-disc pl-5 space-y-0.5">
            <li><strong>Backlinks:</strong> &ldquo;What links here&rdquo; at the bottom of every article</li>
            <li><strong>Table of contents:</strong> auto-generated for articles with multiple headings</li>
            <li><strong>Breadcrumb:</strong> category hierarchy shown above the article title</li>
            <li><strong>Disambiguation:</strong> articles with ambiguous titles get a notice</li>
            <li><strong>Redirects:</strong> set a &ldquo;Redirect to&rdquo; slug in the editor to forward the old URL automatically</li>
          </ul>
        </div>
      </div>

      {/* Administration */}
      <div className="wiki-portal mb-4">
        <div className="wiki-portal-header">Administration</div>
        <div className="wiki-portal-body text-[13px]">
          <ul className="list-disc pl-5 space-y-0.5">
            <li><strong>Roles:</strong> Viewer (read only), Editor (create/edit), Admin (full access)</li>
            <li><strong>Legacy admin login:</strong> enter the <code className="bg-surface-hover px-1 text-[12px]">ADMIN_SECRET</code> at <Link href="/admin">/admin</Link>; works alongside user accounts</li>
            <li><Link href="/admin">Dashboard</Link> — review queue, statistics, embed tokens</li>
            <li><Link href="/admin/analytics">Analytics</Link>, <Link href="/admin/metrics">Metrics</Link>, <Link href="/admin/health">Health</Link></li>
            <li><Link href="/admin/plugins">Plugins</Link>, <Link href="/admin/webhooks">Webhooks</Link>, <Link href="/admin/templates">Templates</Link>, <Link href="/admin/theme">Theme</Link></li>
            <li><Link href="/admin/lint">Content lint</Link>, <Link href="/admin/knowledge-gaps">Knowledge gaps</Link>, <Link href="/admin/search-gaps">Search gaps</Link>, <Link href="/admin/staleness">Staleness</Link>, <Link href="/admin/embeddings">Embeddings</Link></li>
            <li><Link href="/admin/macros">Macros</Link>, <Link href="/admin/content-schedule">Content schedule</Link>, <Link href="/admin/kanban">Kanban board</Link>, <Link href="/admin/audit-log">Audit log</Link></li>
            <li><Link href="/admin/metadata-schemas">Metadata schemas</Link> — define typed fields per category; <Link href="/admin/federated-peers">Federated peers</Link> — configure peer wikis for cross-wiki search</li>
            <li><Link href="/admin/import">Import tools</Link> — Confluence, Notion, Obsidian import in one place</li>
            <li><strong>Batch operations:</strong> on <Link href="/articles">All Articles</Link>, bulk-assign category, publish/unpublish, or delete</li>
            <li><strong>Customization:</strong> name, tagline, welcome text, footer set via <code className="bg-surface-hover px-1 text-[12px]">NEXT_PUBLIC_*</code> environment variables</li>
          </ul>
        </div>
      </div>

      {/* User Accounts */}
      <div className="wiki-portal mb-4">
        <div className="wiki-portal-header">User Accounts</div>
        <div className="wiki-portal-body text-[13px]">
          <ul className="list-disc pl-5 space-y-0.5">
            <li><Link href="/register">Register</Link> with username, email, and password</li>
            <li>User profiles at <code className="bg-surface-hover px-1 text-[12px]">/users/username</code> show contribution history and achievements</li>
            <li>Manage display name, password, notifications, digest schedule, and accessibility defaults at <Link href="/settings">/settings</Link></li>
          </ul>
        </div>
      </div>

      {/* Watchlist & Notifications */}
      <div className="wiki-portal mb-4">
        <div className="wiki-portal-header">Watchlist &amp; Notifications</div>
        <div className="wiki-portal-body text-[13px]">
          <ul className="list-disc pl-5 space-y-0.5">
            <li>Watch articles to get notified when they&apos;re edited. Manage your <Link href="/watchlist">watchlist</Link> from the sidebar.</li>
            <li>The bell icon in the header shows unread notification count</li>
            <li><code className="bg-surface-hover px-1 text-[12px]">@username</code> mentions in discussions trigger a notification</li>
            <li>Enable the daily digest under Settings → Digest for a scheduled summary email</li>
          </ul>
        </div>
      </div>

      {/* RSS & API */}
      <div className="wiki-portal mb-4">
        <div className="wiki-portal-header">RSS Feeds &amp; APIs</div>
        <div className="wiki-portal-body text-[13px]">
          <ul className="list-disc pl-5 space-y-0.5">
            <li><strong>RSS:</strong> <code className="bg-surface-hover px-1 text-[12px]">/feed.xml</code></li>
            <li><strong>Atom:</strong> <code className="bg-surface-hover px-1 text-[12px]">/feed/atom</code></li>
            <li><strong>Public REST API v1:</strong> <code className="bg-surface-hover px-1 text-[12px]">/api/v1/</code> with <code className="bg-surface-hover px-1 text-[12px]">X-API-Key</code> authentication. See <Link href="/api-docs">API Documentation</Link>.</li>
            <li><strong>GraphQL API:</strong> <code className="bg-surface-hover px-1 text-[12px]">/api/graphql</code> — interactive GraphiQL playground at the same URL (GET). Supports queries for articles, categories, tags, revisions, search, and wiki stats.</li>
            <li><strong>Webhooks:</strong> configure HTTP callbacks for article events at <Link href="/admin/webhooks">/admin/webhooks</Link>; delivery log included.</li>
          </ul>
        </div>
      </div>

      {/* Keyboard Shortcuts */}
      <div className="wiki-portal mb-4">
        <div className="wiki-portal-header">Keyboard Shortcuts</div>
        <div className="wiki-portal-body text-[13px]">
          <p className="mb-1 font-bold text-heading">Global</p>
          <table className="w-full mb-4">
            <tbody>
              {([
                ["?", "Show keyboard shortcuts overlay (categorized modal)"],
                ["/", "Focus search bar"],
                ["R", "Toggle reading mode on article pages"],
                ["g then h", "Go to home page"],
                ["g then a", "All articles"],
                ["g then n", "New article"],
                ["g then s", "Search page"],
                ["g then r", "Recent changes"],
                ["g then g", "Article graph"],
                ["Esc", "Close dialog / blur input"],
              ] as [string, string][]).map(([key, desc]) => (
                <tr key={key} className="border-b border-border-light">
                  <td className="py-1 pr-4 w-36"><kbd>{key}</kbd></td>
                  <td className="py-1">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mb-1 font-bold text-heading">In the editor (Ctrl = Cmd on Mac)</p>
          <table className="w-full">
            <tbody>
              {([
                ["Ctrl+B", "Bold"],
                ["Ctrl+I", "Italic"],
                ["Ctrl+Shift+X", "Strikethrough"],
                ["Ctrl+Shift+L", "Insert wiki link"],
                ["Ctrl+Shift+F", "Insert footnote"],
                ["Ctrl+Shift+7", "Ordered list"],
                ["Ctrl+Shift+8", "Bullet list"],
                ["Ctrl+Shift+B", "Blockquote"],
                ["Ctrl+Shift+E", "Code block"],
                ["Ctrl+Z / Ctrl+Shift+Z", "Undo / Redo"],
              ] as [string, string][]).map(([key, desc]) => (
                <tr key={key} className="border-b border-border-light">
                  <td className="py-1 pr-4"><code className="bg-surface-hover px-1 text-[12px]">{key}</code></td>
                  <td className="py-1">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="wiki-notice">
        <strong>Tip:</strong> Type <code className="bg-surface-hover px-1 text-[12px]">[[</code> anywhere in the editor to search and link to existing articles. Type <code className="bg-surface-hover px-1 text-[12px]">/</code> to open the slash command menu for rich content blocks.
      </div>
    </div>
  );
}
