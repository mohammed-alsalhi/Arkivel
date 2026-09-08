# Wiki Clipper — Browser Extension

A Manifest V3 Chrome/Edge/Brave extension that clips web pages into your wiki as draft articles.

## Install (unpacked)

1. Open `chrome://extensions` (or `edge://extensions`)
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked** and select this `extension/` folder
4. The Wiki Clipper icon appears in your toolbar

## First-time setup

1. Click the extension icon
2. Expand **Settings**
3. Enter your wiki URL (e.g. `https://your-wiki.vercel.app`) and click **Save settings**
4. Make sure you are logged in to the wiki in the same browser profile

## Usage

1. Navigate to any page you want to save
2. Optionally select text to clip just that portion
3. Click the **Wiki Clipper** extension icon
4. The title is pre-filled from the page; edit if needed
5. Click **Save as draft** — the article is created immediately
6. Click **Open editor** to review and publish

## How it works

The extension calls `POST /api/bookmarklet` on your wiki with the page URL, title, and selected text.
Auth is via your existing session cookie (`credentials: "include"`), so you must be logged in.

## Icons

Placeholder icons are expected at `icons/icon16.png`, `icons/icon48.png`, `icons/icon128.png`.
Replace them with your own branding.
