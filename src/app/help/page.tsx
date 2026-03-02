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
        Help
      </h1>

      <p className="text-[13px] text-muted mb-4">
        This page covers all the features and tricks available in this wiki. Use the sections below to learn how to create, edit, and organize your articles.
      </p>

      {/* Getting Started */}
      <div className="wiki-portal mb-4">
        <div className="wiki-portal-header">Getting Started</div>
        <div className="wiki-portal-body text-[13px]">
          <p className="mb-2">
            To create a new article, click{" "}
            <Link href="/articles/new">Create new article</Link> in the sidebar
            or navigate directly to{" "}
            <Link href="/articles/new">/articles/new</Link>.
          </p>
          <p className="mb-2">Each article has:</p>
          <ul className="list-disc pl-5 mb-2 space-y-0.5">
            <li><strong>Title</strong> &mdash; the article name, also used to generate the URL slug</li>
            <li><strong>Content</strong> &mdash; rich text body written in the Tiptap editor</li>
            <li><strong>Category</strong> &mdash; optional, for organizing articles into groups</li>
            <li><strong>Tags</strong> &mdash; optional labels for cross-cutting topics</li>
            <li><strong>Excerpt</strong> &mdash; short summary shown in search results and article lists</li>
          </ul>
          <p>
            Articles can be saved as <strong>drafts</strong> (unpublished) or <strong>published</strong>.
            Draft articles are only visible to admins.
          </p>
        </div>
      </div>

      {/* The Editor */}
      <div className="wiki-portal mb-4">
        <div className="wiki-portal-header">The Editor</div>
        <div className="wiki-portal-body text-[13px]">
          <p className="mb-2">
            The rich text editor provides a toolbar with formatting options:
          </p>
          <ul className="list-disc pl-5 mb-2 space-y-0.5">
            <li><strong>B</strong> / <strong>I</strong> / <strong>S</strong> &mdash; Bold, Italic, Strikethrough</li>
            <li><strong>H1</strong> / <strong>H2</strong> / <strong>H3</strong> &mdash; Heading levels</li>
            <li><strong>&bull;</strong> / <strong>1.</strong> &mdash; Bullet and ordered lists</li>
            <li><strong>&ldquo;</strong> &mdash; Blockquote</li>
            <li><strong>&lt;&gt;</strong> &mdash; Code block</li>
            <li><strong>&mdash;</strong> &mdash; Horizontal rule</li>
            <li><strong>Link icon</strong> &mdash; Insert a URL link</li>
            <li><strong>Image icon</strong> &mdash; Upload an image</li>
            <li><strong>[[]]</strong> &mdash; Insert a wiki link (see below)</li>
            <li><strong>Table</strong> &mdash; Insert a table (see Tables section below)</li>
            <li><strong>Detect Links</strong> &mdash; Scan text for potential wiki links (see below)</li>
          </ul>
          <p className="mb-2">
            <strong>Markdown mode:</strong> Click the{" "}
            <code className="bg-surface-hover px-1 text-[12px]">Markdown</code>{" "}
            button in the top-right corner of the editor to switch to raw markdown editing. Click{" "}
            <code className="bg-surface-hover px-1 text-[12px]">Rich Text</code>{" "}
            to switch back. Wiki links, bold, italic, and headings are preserved across modes.
          </p>
          <p>
            <strong>Templates:</strong> When creating a new article, you can choose from predefined templates
            (Person, Place, Event, Thing, Group) that provide a starting structure with an infobox and sections.
          </p>
        </div>
      </div>

      {/* Wiki Links */}
      <div className="wiki-portal mb-4">
        <div className="wiki-portal-header">Wiki Links</div>
        <div className="wiki-portal-body text-[13px]">
          <p className="mb-2">
            Wiki links connect articles together. There are several ways to create them:
          </p>

          <p className="mb-1 font-bold text-heading">Typing syntax</p>
          <ul className="list-disc pl-5 mb-3 space-y-0.5">
            <li>
              Type{" "}
              <code className="bg-surface-hover px-1 text-[12px]">[[Article Name]]</code>{" "}
              &mdash; auto-converts to a wiki link when you close the brackets
            </li>
            <li>
              Type{" "}
              <code className="bg-surface-hover px-1 text-[12px]">[[Article Name|Display Text]]</code>{" "}
              &mdash; creates a link to &ldquo;Article Name&rdquo; but displays &ldquo;Display Text&rdquo;
            </li>
          </ul>

          <p className="mb-1 font-bold text-heading">Link suggester</p>
          <p className="mb-3">
            When you type{" "}
            <code className="bg-surface-hover px-1 text-[12px]">[[</code>,
            an autocomplete dropdown appears showing matching articles. Use{" "}
            <strong>Arrow keys</strong> to navigate, <strong>Enter</strong> to select,
            or <strong>Escape</strong> to dismiss. The dropdown searches as you type.
          </p>

          <p className="mb-1 font-bold text-heading">Toolbar &amp; keyboard</p>
          <ul className="list-disc pl-5 mb-3 space-y-0.5">
            <li>
              Click the <strong>[[]]</strong> toolbar button &mdash; prompts for an article title.
              If text is selected, it becomes the display text.
            </li>
            <li>
              Press{" "}
              <code className="bg-surface-hover px-1 text-[12px]">Ctrl+Shift+L</code>{" "}
              (or <code className="bg-surface-hover px-1 text-[12px]">Cmd+Shift+L</code> on Mac)
              &mdash; same as the toolbar button.
            </li>
          </ul>

          <p className="mb-1 font-bold text-heading">Link status</p>
          <p>
            Wiki links to existing articles appear in <span className="text-wiki-link">blue</span>.
            Links to articles that don&apos;t exist yet appear in{" "}
            <span className="text-wiki-link-broken">red</span> (broken links),
            which is a visual cue to create that article.
          </p>
        </div>
      </div>

      {/* Link Detection */}
      <div className="wiki-portal mb-4">
        <div className="wiki-portal-header">Link Detection</div>
        <div className="wiki-portal-body text-[13px]">
          <p className="mb-2">
            The <strong>Detect Links</strong> button in the editor toolbar scans your article text
            for phrases that match existing article titles.
          </p>
          <ul className="list-disc pl-5 mb-2 space-y-0.5">
            <li>Matching phrases are highlighted with a <span style={{ borderBottom: "2px dashed var(--color-accent)" }}>dashed underline</span></li>
            <li>Hover over a highlight to see it, then <strong>click</strong> to convert it into a wiki link</li>
            <li>The toolbar button shows a count badge (e.g. &ldquo;Detect Links (5)&rdquo;) with remaining matches</li>
            <li>Text inside headings and existing wiki links is skipped</li>
            <li>Longer article titles take priority over shorter ones to avoid partial matches</li>
          </ul>
        </div>
      </div>

      {/* Search */}
      <div className="wiki-portal mb-4">
        <div className="wiki-portal-header">Search</div>
        <div className="wiki-portal-body text-[13px]">
          <p className="mb-2">
            The search bar in the top-right corner provides instant results as you type.
            Press <strong>Enter</strong> or click &ldquo;See all results&rdquo; for the{" "}
            <Link href="/search">full search page</Link>.
          </p>
          <ul className="list-disc pl-5 space-y-0.5">
            <li>Multi-word queries use <strong>AND</strong> logic &mdash; every word must appear somewhere in the article</li>
            <li>
              Results are ranked: exact title match &gt; title starts with query &gt; title contains query &gt; content-only match
            </li>
            <li>Search covers article titles, content, and excerpts</li>
          </ul>
        </div>
      </div>

      {/* Categories & Tags */}
      <div className="wiki-portal mb-4">
        <div className="wiki-portal-header">Categories &amp; Tags</div>
        <div className="wiki-portal-body text-[13px]">
          <p className="mb-2">
            <strong>Categories</strong> are hierarchical groups shown in the sidebar. Each article can belong to one category.
            Categories can have sub-categories for deeper organization.
            Browse all categories on the{" "}
            <Link href="/categories">Categories page</Link>.
          </p>
          <p>
            <strong>Tags</strong> are flat labels that can be assigned freely. An article can have multiple tags.
            Tags appear at the bottom of articles and link to a tag page listing all articles with that tag.
          </p>
        </div>
      </div>

      {/* Revision History */}
      <div className="wiki-portal mb-4">
        <div className="wiki-portal-header">Revision History</div>
        <div className="wiki-portal-body text-[13px]">
          <p className="mb-2">
            Every time you save an article, the previous version is automatically preserved as a revision.
          </p>
          <ul className="list-disc pl-5 space-y-0.5">
            <li>Click the <strong>History</strong> tab on any article to see all past revisions</li>
            <li>Each revision shows the date, time, and content at that point</li>
            <li>Select any two revisions and click <strong>Compare</strong> to see a side-by-side diff</li>
            <li>Added text is highlighted in <span className="bg-diff-added px-1">green</span> and removed text in <span className="bg-diff-removed px-1">red</span></li>
          </ul>
        </div>
      </div>

      {/* Navigation & Organization */}
      <div className="wiki-portal mb-4">
        <div className="wiki-portal-header">Navigation &amp; Organization</div>
        <div className="wiki-portal-body text-[13px]">
          <ul className="list-disc pl-5 space-y-0.5">
            <li>
              <strong>Backlinks:</strong> At the bottom of each article, a &ldquo;Pages that link here&rdquo;
              section lists all articles that reference the current one via wiki links.
            </li>
            <li>
              <strong>Table of contents:</strong> Articles with multiple headings automatically get
              a table of contents at the top.
            </li>
            <li>
              <strong>Recent changes:</strong> The{" "}
              <Link href="/recent-changes">Recent changes</Link> page shows a timeline
              of all article edits grouped by date.
            </li>
            <li>
              <strong>Disambiguation:</strong> When you create an article with a title similar to
              existing ones, a notice appears linking to the similar articles.
            </li>
          </ul>
        </div>
      </div>

      {/* Import & Export */}
      <div className="wiki-portal mb-4">
        <div className="wiki-portal-header">Import &amp; Export</div>
        <div className="wiki-portal-body text-[13px]">
          <p className="mb-1 font-bold text-heading">Import</p>
          <ul className="list-disc pl-5 mb-3 space-y-0.5">
            <li>
              <strong>Web UI:</strong> Go to the{" "}
              <Link href="/import">Import page</Link> and drag-and-drop files
              (.md, .txt, .html, .json)
            </li>
            <li>
              <strong>CLI:</strong> Run{" "}
              <code className="bg-surface-hover px-1 text-[12px]">npm run import -- path/to/files</code>{" "}
              for bulk import with{" "}
              <code className="bg-surface-hover px-1 text-[12px]">--draft</code>,{" "}
              <code className="bg-surface-hover px-1 text-[12px]">--category</code>,{" "}
              <code className="bg-surface-hover px-1 text-[12px]">--dry-run</code> flags
            </li>
            <li>Markdown files with frontmatter extract the title automatically</li>
            <li>JSON files can contain a single article object or an array of articles</li>
          </ul>

          <p className="mb-1 font-bold text-heading">Export</p>
          <ul className="list-disc pl-5 space-y-0.5">
            <li><strong>PDF:</strong> Click &ldquo;Export PDF&rdquo; on any article &mdash; uses your browser&apos;s print dialog</li>
            <li><strong>Markdown:</strong> Click &ldquo;Export Markdown&rdquo; to download the article as a .md file</li>
          </ul>
        </div>
      </div>

      {/* Map */}
      <div className="wiki-portal mb-4">
        <div className="wiki-portal-header">Interactive Map</div>
        <div className="wiki-portal-body text-[13px]">
          <p className="mb-2">
            The interactive map feature is optional and disabled by default. When enabled
            (via the{" "}
            <code className="bg-surface-hover px-1 text-[12px]">NEXT_PUBLIC_MAP_ENABLED=true</code>{" "}
            environment variable), it adds a{" "}
            <Link href="/map">map page</Link> with:
          </p>
          <ul className="list-disc pl-5 mb-3 space-y-0.5">
            <li>A custom map image as the background</li>
            <li>Clickable polygon areas linked to articles</li>
            <li>Hover tooltips showing area names with a color tint</li>
            <li>Edit mode for drawing new polygon areas (admin only)</li>
          </ul>

          <p className="mb-1 font-bold text-heading">Editing areas (admin)</p>
          <p className="mb-2">
            Toggle <strong>Edit Mode</strong> to access area management. In edit mode:
          </p>
          <ul className="list-disc pl-5 mb-3 space-y-0.5">
            <li><strong>Draw new areas</strong> &mdash; click the map to place polygon vertices, then click &ldquo;Finish Drawing&rdquo; to complete the shape</li>
            <li><strong>Select existing areas</strong> &mdash; click any polygon to select it; an edit panel appears on the right</li>
            <li><strong>Edit properties</strong> &mdash; change the label, linked article, or color of the selected area</li>
            <li><strong>Reshape polygons</strong> &mdash; drag the white vertex handles to move individual polygon points in real-time</li>
            <li><strong>Color picker</strong> &mdash; choose from 8 preset colors or pick any custom color via the color input</li>
            <li><strong>Delete areas</strong> &mdash; click the delete button in the edit panel to remove an area</li>
            <li>Click empty space on the map to deselect the current area</li>
          </ul>
        </div>
      </div>

      {/* Administration */}
      <div className="wiki-portal mb-4">
        <div className="wiki-portal-header">Administration</div>
        <div className="wiki-portal-body text-[13px]">
          <ul className="list-disc pl-5 space-y-0.5">
            <li>
              <strong>Login:</strong> Go to{" "}
              <Link href="/admin">Admin</Link> and enter the admin password
              (set via{" "}
              <code className="bg-surface-hover px-1 text-[12px]">ADMIN_SECRET</code>{" "}
              environment variable)
            </li>
            <li>
              <strong>Local development:</strong> If{" "}
              <code className="bg-surface-hover px-1 text-[12px]">ADMIN_SECRET</code>{" "}
              is empty, everyone has admin access automatically
            </li>
            <li>
              <strong>Theme:</strong> Toggle between light and dark mode using the sun/moon
              icon in the top-right corner of the header
            </li>
            <li>
              <strong>Customization:</strong> Wiki name, tagline, welcome text, footer, and more
              are all configurable via{" "}
              <code className="bg-surface-hover px-1 text-[12px]">NEXT_PUBLIC_*</code>{" "}
              environment variables. See{" "}
              <code className="bg-surface-hover px-1 text-[12px]">.env.example</code>{" "}
              for the full list.
            </li>
          </ul>
        </div>
      </div>

      {/* Tables */}
      <div className="wiki-portal mb-4">
        <div className="wiki-portal-header">Tables</div>
        <div className="wiki-portal-body text-[13px]">
          <p className="mb-2">
            The editor supports inserting and editing tables directly in your articles.
          </p>
          <ul className="list-disc pl-5 space-y-0.5">
            <li>Click the <strong>Table</strong> toolbar button to insert a 3&times;3 table with a header row</li>
            <li>When your cursor is inside a table, additional buttons appear: <strong>+Row</strong>, <strong>+Col</strong>, <strong>-Row</strong>, <strong>-Col</strong>, <strong>xTable</strong></li>
            <li>Click cells to edit them directly; use Tab to move between cells</li>
            <li>Selected cells are highlighted with a blue tint</li>
            <li>Tables render with borders and header styling on both the editor and the article display</li>
          </ul>
        </div>
      </div>

      {/* Link Editing */}
      <div className="wiki-portal mb-4">
        <div className="wiki-portal-header">Link Editing</div>
        <div className="wiki-portal-body text-[13px]">
          <p className="mb-2">
            When you hover over a link (either a regular URL link or a wiki link) in the editor,
            a floating bubble appears below it with two options:
          </p>
          <ul className="list-disc pl-5 space-y-0.5">
            <li><strong>Edit</strong> &mdash; opens an inline text input to change the URL (for regular links) or the article title (for wiki links)</li>
            <li><strong>Remove</strong> &mdash; removes the link but keeps the text in place</li>
          </ul>
          <p className="mt-2">
            Press <strong>Enter</strong> to save your edit, or <strong>Escape</strong> to cancel.
            The bubble also appears when you navigate to a link via keyboard.
          </p>
        </div>
      </div>

      {/* Redirect Pages */}
      <div className="wiki-portal mb-4">
        <div className="wiki-portal-header">Redirect Pages</div>
        <div className="wiki-portal-body text-[13px]">
          <p className="mb-2">
            When an article moves to a new URL, you can set up a redirect so the old slug
            automatically takes visitors to the new article.
          </p>
          <ul className="list-disc pl-5 space-y-0.5">
            <li>Open the article editor and fill in the <strong>Redirect to</strong> field with the target article&apos;s slug</li>
            <li>Visitors who navigate to the redirecting article will be automatically sent to the target</li>
            <li>Redirects still appear in search results &mdash; clicking them triggers the redirect</li>
            <li>Leave the redirect field empty for normal (non-redirecting) articles</li>
          </ul>
        </div>
      </div>

      {/* Discussion Pages */}
      <div className="wiki-portal mb-4">
        <div className="wiki-portal-header">Discussion Pages</div>
        <div className="wiki-portal-body text-[13px]">
          <p className="mb-2">
            Every article has a <strong>Discussion</strong> tab where users can post comments
            and discuss the article content, similar to Wikipedia talk pages.
          </p>
          <ul className="list-disc pl-5 space-y-0.5">
            <li>Click the <strong>Discussion</strong> tab on any article to view and post comments</li>
            <li>Comments are open to everyone &mdash; no login required</li>
            <li>Enter an optional author name (defaults to &ldquo;Anonymous&rdquo;)</li>
            <li>Comments are shown chronologically with timestamps</li>
            <li>Admins can delete individual comments</li>
          </ul>
        </div>
      </div>

      {/* Batch Operations */}
      <div className="wiki-portal mb-4">
        <div className="wiki-portal-header">Batch Operations</div>
        <div className="wiki-portal-body text-[13px]">
          <p className="mb-2">
            Admins can perform bulk actions on articles from the{" "}
            <Link href="/articles">All Articles</Link> page.
          </p>
          <ul className="list-disc pl-5 space-y-0.5">
            <li>Select articles using the checkboxes in the first column, or use the header checkbox to select all</li>
            <li><strong>Set Category</strong> &mdash; assign a category to all selected articles at once</li>
            <li><strong>Publish / Unpublish</strong> &mdash; toggle visibility of selected articles</li>
            <li><strong>Delete</strong> &mdash; permanently delete selected articles (requires confirmation)</li>
          </ul>
          <p className="mt-2 text-muted text-[12px]">
            Batch operations are only visible when logged in as admin.
          </p>
        </div>
      </div>

      {/* Keyboard Shortcuts */}
      <div className="wiki-portal mb-4">
        <div className="wiki-portal-header">Keyboard Shortcuts</div>
        <div className="wiki-portal-body text-[13px]">
          <p className="mb-2 text-muted text-[12px]">
            These shortcuts work inside the rich text editor. Replace Ctrl with Cmd on Mac.
          </p>
          <table className="w-full">
            <tbody>
              <tr className="border-b border-border-light">
                <td className="py-1 pr-4"><code className="bg-surface-hover px-1 text-[12px]">Ctrl+B</code></td>
                <td className="py-1">Bold</td>
              </tr>
              <tr className="border-b border-border-light">
                <td className="py-1 pr-4"><code className="bg-surface-hover px-1 text-[12px]">Ctrl+I</code></td>
                <td className="py-1">Italic</td>
              </tr>
              <tr className="border-b border-border-light">
                <td className="py-1 pr-4"><code className="bg-surface-hover px-1 text-[12px]">Ctrl+Shift+X</code></td>
                <td className="py-1">Strikethrough</td>
              </tr>
              <tr className="border-b border-border-light">
                <td className="py-1 pr-4"><code className="bg-surface-hover px-1 text-[12px]">Ctrl+Shift+L</code></td>
                <td className="py-1">Insert wiki link</td>
              </tr>
              <tr className="border-b border-border-light">
                <td className="py-1 pr-4"><code className="bg-surface-hover px-1 text-[12px]">Ctrl+Shift+7</code></td>
                <td className="py-1">Ordered list</td>
              </tr>
              <tr className="border-b border-border-light">
                <td className="py-1 pr-4"><code className="bg-surface-hover px-1 text-[12px]">Ctrl+Shift+8</code></td>
                <td className="py-1">Bullet list</td>
              </tr>
              <tr className="border-b border-border-light">
                <td className="py-1 pr-4"><code className="bg-surface-hover px-1 text-[12px]">Ctrl+Shift+B</code></td>
                <td className="py-1">Blockquote</td>
              </tr>
              <tr className="border-b border-border-light">
                <td className="py-1 pr-4"><code className="bg-surface-hover px-1 text-[12px]">Ctrl+Shift+E</code></td>
                <td className="py-1">Code block</td>
              </tr>
              <tr>
                <td className="py-1 pr-4"><code className="bg-surface-hover px-1 text-[12px]">Ctrl+Z</code> / <code className="bg-surface-hover px-1 text-[12px]">Ctrl+Shift+Z</code></td>
                <td className="py-1">Undo / Redo</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Footnotes */}
      <div className="wiki-portal mb-4">
        <div className="wiki-portal-header">Footnotes &amp; Citations</div>
        <div className="wiki-portal-body text-[13px]">
          <p className="mb-2">
            Add footnotes to your articles for citations and references:
          </p>
          <ul className="list-disc pl-5 space-y-0.5">
            <li>Click the <strong>fn</strong> toolbar button or press <code className="bg-surface-hover px-1 text-[12px]">Ctrl+Shift+F</code> to insert a footnote</li>
            <li>Enter the footnote text in the prompt</li>
            <li>Footnotes appear as numbered superscripts in the text</li>
            <li>A &ldquo;Notes&rdquo; section is automatically generated at the bottom of the article</li>
          </ul>
        </div>
      </div>

      {/* Code Blocks */}
      <div className="wiki-portal mb-4">
        <div className="wiki-portal-header">Code Blocks with Syntax Highlighting</div>
        <div className="wiki-portal-body text-[13px]">
          <p className="mb-2">
            Code blocks support syntax highlighting for many programming languages:
          </p>
          <ul className="list-disc pl-5 space-y-0.5">
            <li>Click the <strong>&lt;&gt;</strong> toolbar button to insert a code block</li>
            <li>You&apos;ll be prompted to enter a language (e.g. js, python, html, css, bash)</li>
            <li>Syntax highlighting is applied automatically in both the editor and article display</li>
            <li>Supports dark mode with adapted color schemes</li>
          </ul>
        </div>
      </div>

      {/* Article Status Workflow */}
      <div className="wiki-portal mb-4">
        <div className="wiki-portal-header">Article Status Workflow</div>
        <div className="wiki-portal-body text-[13px]">
          <p className="mb-2">
            Articles can have one of three statuses:
          </p>
          <ul className="list-disc pl-5 space-y-0.5">
            <li><strong>Draft</strong> &mdash; work in progress, only visible to admins</li>
            <li><strong>Review</strong> &mdash; ready for review, only visible to admins</li>
            <li><strong>Published</strong> &mdash; visible to everyone</li>
          </ul>
          <p className="mt-2">
            Set the status from the article edit page. Pinned articles appear at the top of their category page.
          </p>
        </div>
      </div>

      {/* User Accounts */}
      <div className="wiki-portal mb-4">
        <div className="wiki-portal-header">User Accounts</div>
        <div className="wiki-portal-body text-[13px]">
          <p className="mb-2">
            The wiki supports multi-user accounts with role-based permissions:
          </p>
          <ul className="list-disc pl-5 space-y-0.5">
            <li><Link href="/register">Register</Link> for an account with username, email, and password</li>
            <li><Link href="/login">Login</Link> to start editing</li>
            <li>Roles: <strong>Viewer</strong> (read only), <strong>Editor</strong> (create/edit articles), <strong>Admin</strong> (full access)</li>
            <li>User profiles show contribution history at <code className="bg-surface-hover px-1 text-[12px]">/users/username</code></li>
            <li>Legacy admin password login still works alongside user accounts</li>
          </ul>
        </div>
      </div>

      {/* Watchlist & Notifications */}
      <div className="wiki-portal mb-4">
        <div className="wiki-portal-header">Watchlist &amp; Notifications</div>
        <div className="wiki-portal-body text-[13px]">
          <ul className="list-disc pl-5 space-y-0.5">
            <li>Watch articles to get notified when they&apos;re edited</li>
            <li>Manage your <Link href="/watchlist">watchlist</Link> from the sidebar</li>
            <li>The bell icon in the header shows unread notification count</li>
            <li>Click the bell to see recent notifications and mark them as read</li>
          </ul>
        </div>
      </div>

      {/* RSS Feeds & API */}
      <div className="wiki-portal mb-4">
        <div className="wiki-portal-header">RSS Feeds &amp; Public API</div>
        <div className="wiki-portal-body text-[13px]">
          <ul className="list-disc pl-5 space-y-0.5">
            <li><strong>RSS:</strong> Subscribe to <code className="bg-surface-hover px-1 text-[12px]">/feed.xml</code> for recent changes</li>
            <li><strong>Atom:</strong> Available at <code className="bg-surface-hover px-1 text-[12px]">/feed/atom</code></li>
            <li><strong>API:</strong> Public REST API at <code className="bg-surface-hover px-1 text-[12px]">/api/v1/</code> with API key authentication. See <Link href="/api-docs">API Documentation</Link></li>
          </ul>
        </div>
      </div>

      {/* Article Graph */}
      <div className="wiki-portal mb-4">
        <div className="wiki-portal-header">Article Graph</div>
        <div className="wiki-portal-body text-[13px]">
          <p className="mb-2">
            Visualize the connections between your articles as an interactive graph:
          </p>
          <ul className="list-disc pl-5 space-y-0.5">
            <li>Visit the <Link href="/graph">Article Graph</Link> page from the sidebar</li>
            <li>Nodes represent articles, colored by category</li>
            <li>Edges represent wiki links between articles</li>
            <li>Drag nodes to rearrange, scroll to zoom, and click to navigate</li>
            <li>Filter by category and control graph depth</li>
          </ul>
        </div>
      </div>

      <div className="wiki-notice">
        <strong>Tip:</strong> You can also type{" "}
        <code className="bg-surface-hover px-1 text-[12px]">[[</code>{" "}
        anywhere in the editor to quickly search and link to existing articles without
        leaving the keyboard.
      </div>
    </div>
  );
}
