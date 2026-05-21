# Features Backlog

500 planned features organised by theme. Items are not in priority order within a theme.
Completed features are marked `[x]`. All others are `[ ]`.

---

## Editor

- [x] Find & replace in editor
- [x] Editor focus / zen mode (hide all chrome, widen content)
- [x] Auto-save indicator ("Saving…" / "Saved" / "Unsaved changes")
- [x] Character count alongside word count
- [x] Word frequency cloud per article
- [x] Paste Markdown → rich text (detect and convert on paste)
- [x] Smart URL paste → auto-link
- [x] Copy article as Markdown button on article page
- [x] Copy article as plain text button
- [x] Typewriter scrolling mode (cursor stays centred vertically)
- [x] Editor outline panel (AI-assisted headings outline)
- [x] Pull quote / callout blocks
- [x] Tabbed content blocks
- [x] Accordion / FAQ blocks
- [x] Vertical timeline blocks
- [x] Gallery grid blocks
- [x] Button / CTA blocks
- [x] Divider with label blocks
- [x] Multi-column layout blocks (2-col)
- [x] Math / LaTeX inline support (KaTeX)
- [ ] Chemical formula support (mhchem)
- [ ] Music notation blocks (ABC notation → rendered score)
- [ ] Chess board diagram blocks (FEN string)
- [ ] Vega-Lite chart blocks
- [ ] D3 embed blocks
- [ ] Sandboxed iframe embed blocks
- [x] YouTube / Vimeo embed blocks
- [x] Twitter / X embed blocks
- [ ] Spotify embed blocks
- [x] GitHub Gist embed blocks
- [ ] CodePen embed blocks
- [ ] JSFiddle embed blocks
- [ ] Replit embed blocks
- [ ] Custom HTML blocks (admin only)
- [ ] Article merge (combine two articles at cursor)
- [ ] Article split (split article into two at selection)
- [x] Paragraph-level version history (blame view)
- [x] Smart typography (auto em-dash, ellipsis, smart quotes)
- [x] Superscript / subscript toolbar buttons
- [x] Text highlighting in multiple colours
- [ ] Custom CSS class assignment on any block
- [ ] Drag-and-drop block reordering
- [x] Inline table of contents (anchor links auto-updated)
- [x] Block-level comments (leave a comment on a paragraph)
- [x] Article "last read position" memory (scroll restoration)
- [ ] Editor line numbers for code blocks
- [ ] Custom editor themes (light / dark / sepia / high-contrast)
- [x] Distraction-free writing with word-count goal
- [ ] Sentence-level undo/redo (not just character-level)

---

## Content Organisation

- [ ] Multi-category articles (article belongs to multiple categories)
- [ ] Category ordering modes (alphabetical / manual / by date / by popularity)
- [x] Category statistics panel (article count, avg word count, last edited)
- [x] Tag cloud (tag sizes proportional to article count)
- [x] Tag merge tool
- [ ] Tag rename with automatic redirect
- [x] Bulk tag operations (apply / remove tag from N articles at once)
- [x] Smart / auto-suggested tags (NLP-based from content)
- [x] Article series with ordered navigation
- [x] Series table of contents
- [x] Series progress tracker (X of N read)
- [ ] Virtual categories (tag-based, not tree-positioned)
- [x] Category templates (pre-fill structure for new articles)
- [ ] Cross-wiki article linking
- [ ] Namespace support (Article:, Talk:, File:, Help:, User:)
- [ ] Article aliases (multiple slugs → one article)
- [ ] Canonical URL management
- [x] Article expiry / archival workflow
- [x] Content certification workflow (admin marks article as verified)
- [x] Good-article / featured-article badges
- [x] Quality completeness score per article
- [ ] Citation tracker
- [x] Reference list auto-generation from footnotes
- [ ] Bibliography export (BibTeX, RIS, APA, MLA)
- [x] "See Also" auto-suggestions (similarity-based)
- [x] Disambiguation page builder UI
- [ ] Redirect chain resolver (detect and flatten long redirect chains)
- [ ] Broken redirect detector in admin lint
- [ ] Category tree visualiser (interactive expandable tree)
- [x] Orphan article finder (enhanced — also suggests parent categories)
- [x] Dead-end article finder (no outgoing wiki-links)
- [x] Long-article splitter suggestions (flag articles > 5 000 words)
- [x] Short-article merger suggestions (flag stubs < 100 words)
- [x] Duplicate content detector (beyond title — content similarity)
- [x] Glossary management page
- [x] Term hover-cards (preview definition inline on hover)
- [x] Article todo list (per-article internal checklist for editors)
- [ ] Wiki project pages (coordinate editing efforts on a topic)
- [ ] Editorial calendar (plan and schedule upcoming articles)
- [ ] Content ownership / watchlist digest

---

## Discovery & Navigation

- [x] Advanced search: date range, word-count range, category + tag filters
- [ ] Saved search alerts (notify when new matches appear)
- [x] Per-user search history
- [x] Did-you-mean / spell-correct suggestions
- [x] Faceted search (filter by category + tag + status simultaneously)
- [ ] Article similarity score display on search results
- [x] "People who read this also read" widget
- [x] Reading journey map (user's own reading path visualised)
- [ ] Article popularity trends (rising / falling this week)
- [x] Hot articles widget (most viewed in last 7 days)
- [x] New articles feed widget
- [x] Random article with category/tag filter
- [x] Article quiz mode (flashcard-style review of article content)
- [x] Spaced repetition reading scheduler
- [x] Knowledge graph exploration mode
- [ ] Citation graph (article A references article B)
- [ ] Influence map (track intellectual lineage between articles)
- [x] Geographic browse (articles with map coordinates)
- [ ] Language / locale browse
- [x] Author browse (all articles by a contributor)
- [x] Contributor profile pages
- [x] Reading level estimator (Flesch-Kincaid grade level)
- [x] Content warning tags (CW: violence, spoilers, etc.)
- [ ] Long / short article toggle filter
- [ ] Print queue (batch-print multiple articles)
- [x] Speed-read mode (word-by-word rapid display)
- [x] Focus-paragraph mode (dim non-active paragraphs)
- [x] Text-only mode (strip images for focused reading)
- [x] High-contrast accessibility mode
- [x] Dyslexia-friendly font option (OpenDyslexic)
- [x] Font size preference (small / medium / large / XL)
- [x] Command palette (Cmd+K fuzzy search all articles + actions)
- [x] Recent articles in command palette history
- [x] Quick-create article from command palette
- [x] Breadcrumb trail on all pages
- [x] Article progress indicator (% of article scrolled)
- [x] Continue-reading feature (resume at last scroll position)
- [x] "Save for later" one-click on any article list
- [x] Night reading mode (warm dark theme, auto at sunset)
- [x] Estimated finish time per article

---

## Collaboration

- [x] Inline suggestions (suggest edits, accept/reject flow)
- [x] Real-time collaborative editing (Yjs — full production wiring)
- [ ] Edit conflict resolution UI (merge conflicting saves)
- [x] Change proposal workflow (editor proposes, admin approves)
- [ ] Peer review queue
- [x] Discussion threading (nested replies)
- [ ] Discussion subscriptions (follow a single thread)
- [ ] Inline discussion permalinks
- [ ] @mention autocomplete in discussion editor
- [ ] Discussion moderation (pin, lock, delete threads)
- [ ] Discussion search
- [ ] Discussion export (CSV / Markdown)
- [ ] Article talk pages (Wikipedia-style, separate from discussions)
- [ ] Anonymous editing with CAPTCHA
- [ ] Edit rate limiting (per IP and per user)
- [ ] Editor reputation score
- [ ] Trusted editor status (bypass moderation queue)
- [x] Contribution graph (GitHub-style heatmap on profile)
- [x] Edit attribution in diff view
- [x] Blame / annotate view (who wrote each paragraph)
- [ ] Content ownership transfer between users
- [x] Article adoption (claim unmaintained articles)
- [ ] Translation workflow (assign locale-specific translation tasks)
- [ ] Translation memory (reuse previously translated phrases)
- [x] Glossary linking (auto-link defined terms to glossary)
- [ ] Fact-check / disputed content marker
- [x] Cleanup tags (needs images / needs expansion / needs citations)
- [ ] Citation request inline tag
- [ ] Mentorship program (pair new editors with experienced ones)

---

## Analytics & Insights

- [x] Article section heatmap (scroll depth tracking)
- [ ] Funnel analysis (article entry → next-page exit paths)
- [x] Referrer tracking (how users arrive at each article)
- [x] External link click tracking
- [ ] Time-on-page per section
- [ ] Engagement score per article
- [ ] Reader retention rate (% who read past halfway)
- [ ] Bounce rate per article
- [x] Top referrers admin dashboard
- [ ] Geographic reader distribution
- [ ] Device breakdown (mobile / desktop / tablet)
- [ ] Reading time accuracy (actual vs. estimated)
- [x] Article completion rate (% who reach end)
- [ ] A/B test article titles
- [ ] Conversion tracking (read → edit)
- [ ] Article health trends over time charts
- [ ] Editor activity dashboard
- [x] Content gap analysis (popular zero-result searches)
- [x] Knowledge coverage map
- [x] Writing velocity tracker (words added per week)
- [x] Category growth chart
- [x] Tag usage trends
- [ ] Article lifecycle analysis (draft → publish duration)
- [ ] Comment sentiment analysis
- [x] Reader satisfaction quick rating (1–5 after article)
- [x] Analytics export to CSV
- [ ] Analytics REST API endpoint
- [ ] Custom event tracking
- [x] Reading goals tracking
- [ ] Core Web Vitals dashboard

---

## Admin Tools

- [x] Bulk article import (JSON with field mapping)
- [x] Bulk article export to JSON
- [ ] Content approval workflow UI
- [ ] Edit queue (pending edits waiting for admin approval)
- [ ] IP ban tool
- [ ] User suspension (time-limited)
- [ ] User activity log per user
- [ ] Content moderation dashboard
- [ ] Spam detection (auto-flag suspicious edits)
- [ ] Vandalism detector (revert to last good revision)
- [ ] Mass rollback (revert all edits by a specific user)
- [ ] Database vacuum (remove orphaned records)
- [ ] Revision pruning (keep only N revisions per article)
- [ ] Storage usage dashboard
- [ ] Full-text search re-index button
- [ ] Embedding re-generation button
- [ ] Cache invalidation controls
- [ ] Feature flags per user / group
- [ ] Rate-limit configuration UI
- [ ] Email template editor
- [ ] Notification template editor
- [ ] Custom 404 page editor
- [ ] Maintenance mode toggle
- [ ] Read-only mode toggle
- [ ] Announcement scheduling (set future go-live time for banners)
- [ ] Auto-backup to S3 / Vercel Blob
- [ ] Restore from backup
- [ ] Database health check dashboard
- [ ] Slow query log viewer
- [ ] API usage dashboard
- [ ] Webhook delivery retry button
- [ ] Dead letter queue for failed webhooks
- [ ] GDPR data export per user
- [ ] GDPR data deletion per user
- [ ] Cookie consent management
- [ ] Admin two-person approval for destructive actions
- [ ] Admin session timeout configuration
- [ ] Scheduled report emails (weekly digest to admins)
- [ ] Admin action undo (for category changes, bulk ops)

---

## User Experience

- [x] Onboarding wizard (first-time user tour)
- [ ] Welcome checklist (complete profile, read 3 articles, make first edit)
- [x] Achievement system (badges for contribution milestones)
- [x] Points / XP system for contributions
- [ ] User level system (Reader → Contributor → Editor → Expert → Master)
- [x] Profile customisation (avatar upload, bio, social links)
- [x] User portfolio (public view of all contributions)
- [ ] Following other users
- [ ] User feed (activity updates from followed users)
- [x] Notification centre (all notifications in one place, grouped)
- [ ] Notification grouping (batch similar notifications)
- [ ] Granular email notification preferences
- [ ] Unsubscribe link in notification emails
- [ ] Dark mode scheduled (auto-switch at configurable times)
- [x] Custom accent colour picker
- [x] Font choice preference (serif / sans-serif / monospace)
- [x] Sidebar position preference (left / right)
- [x] Article width preference (narrow / default / full)
- [ ] Image loading preference (eager / lazy / off)
- [ ] Motion reduction preference
- [ ] Keyboard-only navigation (tab-focus on all interactive elements)
- [ ] Paste history (recent clipboard items in editor)
- [ ] Global command history (undo across pages)
- [ ] Article "pin to top" of personal reading list
- [x] Quick note on any article (private sticky note)
- [x] Personal reading notes (private annotations per article)
- [x] Highlight text and save as quote / note
- [ ] Share highlighted text (URL fragment with highlight)
- [ ] Print article with personal annotations
- [ ] Export personal notes as Markdown
- [ ] Calendar view of reading history
- [x] Time-zone aware timestamps (show dates in user's local time)

---

## API & Integrations

- [ ] GraphQL subscriptions (real-time updates via WebSocket)
- [ ] Webhook retry with exponential backoff
- [ ] OAuth2 provider (this wiki as identity provider)
- [ ] SAML SSO support
- [ ] LDAP / Active Directory integration
- [ ] Google Sign-In
- [ ] GitHub Sign-In
- [ ] Microsoft / Entra Sign-In
- [ ] Discord Sign-In
- [ ] Apple Sign-In
- [ ] TOTP / Authenticator-app MFA
- [ ] Passkey / WebAuthn login
- [ ] API key scopes (read / write / admin)
- [ ] Per-key API rate limiting
- [ ] OpenAPI spec auto-generated from routes
- [ ] SDK generation (TypeScript, Python, Go)
- [ ] Zapier integration
- [ ] Make (Integromat) integration
- [ ] n8n integration
- [ ] Notion two-way sync
- [ ] Obsidian two-way sync
- [ ] Roam Research import
- [ ] LogSeq import
- [ ] Bear app import
- [ ] Craft Docs import
- [ ] Evernote import
- [ ] OneNote import
- [ ] Google Docs live import
- [ ] Dropbox Paper import
- [ ] HackMD sync
- [ ] GitHub wiki sync (two-way)
- [ ] GitLab wiki sync
- [ ] Jira issue linking
- [ ] Linear issue linking
- [ ] Asana task linking
- [ ] Slack slash command for search
- [ ] Discord slash command for search
- [ ] Microsoft Teams integration
- [ ] Telegram bot
- [ ] Email-to-article (send email → draft article)
- [ ] Calendar integration (embed events from Google/Outlook)

---

## Performance

- [ ] Incremental static regeneration for popular articles
- [ ] Edge caching configuration UI
- [ ] Image optimisation pipeline (WebP / AVIF auto-conversion)
- [ ] Image blur placeholder (LQIP)
- [x] Prefetch article links on hover
- [ ] Service worker for offline reading
- [ ] PWA manifest (installable on home screen)
- [ ] Background sync for offline edits
- [ ] Database connection pool dashboard
- [ ] Bundle size analysis admin page
- [ ] Core Web Vitals dashboard
- [ ] Lighthouse score tracker (run on schedule)
- [ ] Performance budget alerts
- [ ] Font subsetting
- [ ] Third-party script audit
- [ ] Lazy-load all below-the-fold images
- [ ] Virtual list for long article listings
- [ ] Server-sent events for live notification count
- [ ] Response time histogram per route
- [ ] P95 latency tracking

---

## Content Types

- [x] Interactive data tables (sortable, filterable, paginated)
- [x] Interactive decision trees
- [x] Polls and surveys embedded in articles
- [ ] Quizzes (multiple choice, true/false, short answer)
- [ ] Recipe format (ingredients, steps, yield, nutrition)
- [ ] Event pages (date, location, RSVP)
- [ ] Person infobox (birth/death, nationality, occupation)
- [ ] Location infobox (coordinates, country, population)
- [ ] Organisation infobox (founded, headquarters, members)
- [ ] Book review format (author, rating, genre, summary)
- [ ] Movie review format (director, cast, rating)
- [ ] Music album review (artist, tracklist, year)
- [ ] Scientific paper format (abstract, methods, citations)
- [ ] Meeting notes format (agenda, decisions, action items)
- [ ] Project page format (status, team, milestones, links)
- [ ] Tutorial format (steps, estimated time, difficulty)
- [ ] API documentation page format (endpoint cards)
- [ ] Comparison table blocks (side-by-side feature matrix)
- [x] Image gallery with captions and lightbox zoom
- [ ] Video collections page
- [ ] Audio collections / podcast feed
- [ ] Document attachment uploads (PDF, DOCX)
- [ ] Spreadsheet embed (Google Sheets)
- [ ] Presentation embed (Google Slides)
- [ ] Changelog page format (version history entries)
- [ ] Legal document format (parties, clauses, dates)

---

## Multilingual

- [ ] Auto-translation queue (flag untranslated articles)
- [ ] Translation completeness indicator per locale
- [ ] Translation suggestion queue (suggest missing translations)
- [ ] Community translation workflow
- [x] Language switcher in article header
- [ ] Locale-specific number / date formatting
- [ ] Full RTL layout for Arabic, Hebrew, Farsi
- [ ] Bidirectional text mixing support
- [ ] Language-specific full-text search indexes
- [ ] Cross-locale search
- [ ] Translation memory database per wiki
- [ ] Glossary translation per locale
- [ ] Machine translation post-editing workflow
- [ ] Language detection for imported content
- [ ] Traditional ↔ Simplified Chinese script conversion
- [ ] Romanisation / transliteration helper
- [ ] Per-locale category structure
- [ ] Locale-specific home page content

---

## Gamification

- [x] Writing streaks (consecutive days of editing)
- [ ] Article quality improvement quests
- [ ] Monthly content creation challenges
- [ ] Editing marathons (timed events)
- [ ] First edit of the day bonus XP
- [ ] Milestone celebrations (popups at 10, 50, 100 articles)
- [x] Wiki leaderboards (monthly / weekly / all-time)
- [ ] Team competitions (group vs. group editing)
- [ ] Topic expertise badges (edit N articles in a category)
- [ ] Contributor of the month
- [ ] Article spotlight (featured on home page)
- [ ] Reaction milestone badges
- [ ] Discussion participation badges
- [ ] Translation badges
- [ ] Streak freeze mechanic (use a freeze to keep streak)
- [ ] XP multiplier events (weekend double XP)
- [ ] Community goals (wiki reaches 1 000 articles)
- [ ] Wiki growth challenges
- [ ] Achievement showcase section on user profile
- [ ] Seasonal themes / events

---

## Security

- [ ] Content Security Policy configuration UI
- [ ] Rate limiting configuration per route
- [ ] CAPTCHA on registration
- [ ] Email verification required before editing
- [ ] Suspicious activity alerts (unusual login location)
- [ ] Login attempt log
- [ ] Session management page (view and revoke all active sessions)
- [ ] API key audit log
- [ ] Revision tampering detection
- [ ] Per-article read permissions (granular ACL)
- [ ] Per-category read permissions
- [ ] IP allowlist for admin panel
- [ ] Two-person approval for destructive admin actions
- [ ] Security headers audit page
- [ ] Dependency vulnerability scanner in admin
- [ ] Private / invite-only wiki mode
- [ ] Encrypted article storage option
- [ ] Canary token support for data-exfiltration detection
- [ ] Admin action signing (require re-auth for deletions)
- [ ] Audit trail for permission changes

---

## AI Features

- [x] AI article generation from an outline
- [x] AI image alt-text generation
- [ ] AI content moderation (flag inappropriate content)
- [x] AI grammar and style checker
- [x] AI title suggestions from content
- [x] AI tagging suggestions
- [x] AI category suggestions
- [ ] AI duplicate detection improvement
- [x] AI question answering (ask the wiki a question)
- [ ] AI fact-checking against Wikipedia / Wikidata
- [ ] AI citation suggestions
- [x] AI outline builder
- [x] AI "expand this section" suggestion
- [x] AI tone adjustment (formal / casual / technical)
- [ ] AI translation quality scoring
- [ ] AI code explanation in code blocks
- [ ] Knowledge graph auto-building from article content
- [ ] Named entity extraction and auto-linking
- [ ] Topic modelling across the whole wiki
- [ ] Predictive article creation (suggest articles based on content gaps)
- [x] Conversational AI wiki assistant (chat sidebar)
- [ ] AI meeting-notes to article conversion
- [ ] AI PDF to article extraction
- [ ] AI video transcript to article conversion
- [ ] AI data (CSV) to prose article
- [ ] AI-powered search re-ranking
- [ ] Custom AI model fine-tuning on wiki content
- [ ] AI reading difficulty adjuster
- [ ] AI content expansion for stub articles
- [x] AI revision summary generation

---

## Platform & Extensibility

- [ ] Plugin marketplace (browse, install, rate plugins)
- [ ] Plugin SDK documentation
- [ ] Custom block types via plugins
- [ ] Custom sidebar widgets via plugins
- [ ] Custom admin panel sections via plugins
- [ ] Theme builder (visual CSS variable editor)
- [ ] Layout builder (drag-and-drop page layouts)
- [ ] Content scheduling calendar view
- [ ] Multi-wiki management dashboard
- [ ] Wiki federation protocol
- [ ] White-label / custom domain per wiki
- [ ] Subdomain routing (team.wiki.app)
- [ ] Multi-tenant billing dashboard
- [ ] Usage quotas per tenant
- [ ] SLA monitoring per tenant
- [ ] Custom webhook payload templates
- [ ] Event bus (pub/sub for internal events)
- [ ] Headless mode (API-only, no front-end)
- [ ] Static site export (generate full HTML site)
- [ ] GitHub Pages / Netlify deploy from export
