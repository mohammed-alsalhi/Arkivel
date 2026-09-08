# Roadmap Archive — v4.16

This file archives all completed roadmap items shipped in v4.16.
For the active roadmap see [`/ROADMAP.md`](../../ROADMAP.md).

---

## Content & Editor
- [x] **Reading time estimator** — "~X min read" displayed inline in every article's metadata line, computed from word count at 200 wpm
- [x] **Draft share links** — `shareToken` field on Article; `POST /api/articles/[id]/share-token` generates a secret token; `/share/[token]` public preview page lets anyone with the link read a draft without auth
- [x] **Article comparison view** — `/compare?a=slug1&b=slug2` renders two live articles side by side in scrollable columns

## Discovery & Navigation
- [x] **Popularity leaderboard** — `/popular` page ranks published articles by combined read × 2 + reaction score; shows top 50 with per-article stats
- [x] **"You might also like" recommendations** — `YouMightAlsoLike` server component on article pages suggests up to 5 articles sharing tags

## Article Page
- [x] **Expiry warning banner** — yellow inline banner on articles whose `reviewDueAt` is within 30 days, prompting editors to review
- [x] **Mark as verified** — `lastVerifiedAt` field on Article; `POST /api/articles/[id]/verify` stamps the current timestamp; `VerifyButton` shown to admins; verified date displayed in the article byline

## People & Contributions
- [x] **Contributor leaderboard** — `/leaderboard` page ranks users by total revision count with gold/silver/bronze rank highlights
