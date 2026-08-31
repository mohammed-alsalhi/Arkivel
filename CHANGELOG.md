# changelog

## 6.0.0

- consolidated Arkivel and WorldWiki source into one public repository with independent deployments
- replaced the wiki shell with a focused three-pane document interface
- removed AI, collaboration, marketplace, plugin, workspace, social, gamification, dashboard, and experimental surfaces
- reduced the editor, API contract, dependencies, documentation, and application schema to the supported core
- preserved production data behind a verified database backup and an application-only schema cutover
- reset repository history to a clean root release after creating an offline Git bundle
- made the three-pane `folio` skin full viewport while retaining `wiki` as the classic framed skin
- aligned local, CI, Docker, and Vercel builds on Node.js 20 and added the docs-sync gate to CI
