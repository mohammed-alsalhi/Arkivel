#!/usr/bin/env node
// wiki-cli — Command-line tool for managing wiki content
// Requires Node.js 18+ (uses native fetch and fs/promises)
// Config: ~/.wiki-cli.json or WIKI_URL + WIKI_API_KEY env vars

import { readFileSync, writeFileSync, existsSync } from "fs";
import { readFile } from "fs/promises";
import { homedir } from "os";
import { join } from "path";

// ── ANSI colour helpers ───────────────────────────────────────────────────────

const C = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  gray: "\x1b[90m",
};

const isTTY = process.stdout.isTTY;
const col = (code, text) => (isTTY ? `${code}${text}${C.reset}` : text);

const bold = (t) => col(C.bold, t);
const dim = (t) => col(C.dim, t);
const red = (t) => col(C.red, t);
const green = (t) => col(C.green, t);
const yellow = (t) => col(C.yellow, t);
const cyan = (t) => col(C.cyan, t);
const gray = (t) => col(C.gray, t);

// ── Config ────────────────────────────────────────────────────────────────────

const CONFIG_PATH = join(homedir(), ".wiki-cli.json");

function loadConfig() {
  const envUrl = process.env.WIKI_URL;
  const envKey = process.env.WIKI_API_KEY;

  if (envUrl && envKey) {
    return { url: envUrl.replace(/\/$/, ""), key: envKey };
  }

  if (existsSync(CONFIG_PATH)) {
    try {
      const raw = readFileSync(CONFIG_PATH, "utf-8");
      const cfg = JSON.parse(raw);
      if (cfg.url && cfg.key) {
        return { url: cfg.url.replace(/\/$/, ""), key: cfg.key };
      }
    } catch {
      die("Failed to parse config file at " + CONFIG_PATH);
    }
  }

  return null;
}

function saveConfig(url, key) {
  writeFileSync(CONFIG_PATH, JSON.stringify({ url, key }, null, 2) + "\n", "utf-8");
}

function requireConfig() {
  const cfg = loadConfig();
  if (!cfg) {
    die(
      "No configuration found.\n" +
        "Run:  wiki config set --url <URL> --key <API_KEY>\n" +
        "Or set WIKI_URL and WIKI_API_KEY environment variables."
    );
  }
  return cfg;
}

// ── HTTP helpers ──────────────────────────────────────────────────────────────

async function apiGet(cfg, path, params = {}) {
  const url = new URL(cfg.url + path);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
  }
  const res = await fetch(url.toString(), {
    headers: { "X-API-Key": cfg.key, Accept: "application/json" },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    die(`HTTP ${res.status} ${res.statusText}: ${text}`);
  }
  return res.json();
}

async function apiPost(cfg, path, body) {
  const res = await fetch(cfg.url + path, {
    method: "POST",
    headers: {
      "X-API-Key": cfg.key,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    die(`HTTP ${res.status} ${res.statusText}: ${text}`);
  }
  return res.json();
}

// ── Output helpers ────────────────────────────────────────────────────────────

function die(msg) {
  console.error(red("Error: ") + msg);
  process.exit(1);
}

function printTable(rows, columns) {
  if (rows.length === 0) {
    console.log(dim("(no results)"));
    return;
  }

  // Calculate column widths
  const widths = columns.map((col) => {
    const header = col.header || col.key;
    const maxData = Math.max(...rows.map((r) => String(r[col.key] ?? "").length));
    return Math.max(header.length, maxData, col.min || 0);
  });

  // Header row
  const header = columns
    .map((col, i) => bold((col.header || col.key).padEnd(widths[i])))
    .join("  ");
  console.log(header);
  console.log(dim("-".repeat(widths.reduce((s, w) => s + w + 2, 0))));

  // Data rows
  for (const row of rows) {
    const line = columns
      .map((col, i) => {
        const val = String(row[col.key] ?? "");
        const padded = val.padEnd(widths[i]).slice(0, col.max || 9999);
        return col.color ? col.color(padded) : padded;
      })
      .join("  ");
    console.log(line);
  }
}

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-CA") + " " + d.toLocaleTimeString("en-CA", { hour: "2-digit", minute: "2-digit" });
}

function stripHtml(html) {
  return html ? html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim() : "";
}

// ── Argument parser ───────────────────────────────────────────────────────────

function parseArgs(argv) {
  const args = { _: [], flags: {} };
  let i = 0;
  while (i < argv.length) {
    const arg = argv[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (next !== undefined && !next.startsWith("--")) {
        args.flags[key] = next;
        i += 2;
      } else {
        args.flags[key] = true;
        i += 1;
      }
    } else {
      args._.push(arg);
      i += 1;
    }
  }
  return args;
}

// ── Commands ──────────────────────────────────────────────────────────────────

// wiki config set --url http://localhost:3000 --key myapikey
function cmdConfigSet(args) {
  const { url, key } = args.flags;
  if (!url || !key) {
    die("Usage: wiki config set --url <URL> --key <API_KEY>");
  }
  saveConfig(String(url).replace(/\/$/, ""), String(key));
  console.log(green("Config saved to ") + CONFIG_PATH);
}

// wiki config show
function cmdConfigShow() {
  const cfg = loadConfig();
  if (!cfg) {
    console.log(yellow("No config found. Run: wiki config set --url <URL> --key <KEY>"));
    return;
  }
  console.log(bold("Wiki URL: ") + cyan(cfg.url));
  console.log(bold("API Key:  ") + gray(cfg.key.slice(0, 8) + "..."));
}

// wiki articles list [--page N] [--category slug] [--status published]
async function cmdArticlesList(args) {
  const cfg = requireConfig();
  const page = parseInt(args.flags.page || "1");
  const params = {
    page,
    limit: args.flags.limit || 20,
  };
  if (args.flags.category) params.category = args.flags.category;
  if (args.flags.status) params.status = args.flags.status;
  if (args.flags.search) params.search = args.flags.search;

  // Use v2 API with cursor pagination when no explicit page is given
  const useV2 = !args.flags.page;
  const apiPath = useV2 ? "/api/v2/articles" : "/api/v1/articles";

  const data = await apiGet(cfg, apiPath, params);

  let articles;
  let total;
  let pagination;

  if (useV2) {
    articles = data.data || [];
    total = data.meta?.total;
    pagination = data.meta;
  } else {
    articles = data.articles || [];
    total = data.pagination?.total;
    pagination = data.pagination;
  }

  if (articles.length === 0) {
    console.log(dim("No articles found."));
    return;
  }

  console.log(bold(`\nArticles`) + gray(total !== undefined ? `  (${total} total)` : ""));

  printTable(articles, [
    { key: "title", header: "Title", min: 20, max: 50, color: cyan },
    { key: "slug", header: "Slug", min: 15, max: 30 },
    {
      key: "status",
      header: "Status",
      min: 9,
      color: (v) =>
        v.trim() === "published" ? green(v) : v.trim() === "draft" ? yellow(v) : dim(v),
    },
    {
      key: "updatedAt",
      header: "Updated",
      min: 16,
      color: gray,
    },
  ].map((col) => ({
    ...col,
    // Reformat date fields
    key: col.key,
  })));

  // Re-render with formatted dates
  const formatted = articles.map((a) => ({
    ...a,
    updatedAt: formatDate(a.updatedAt),
    category: a.category?.name || "",
  }));

  // Re-print properly
  console.log(""); // separator before retry
  printTable(formatted, [
    { key: "title", header: "Title", min: 20, max: 48, color: cyan },
    { key: "slug", header: "Slug", min: 15, max: 32, color: dim },
    {
      key: "status",
      header: "Status",
      min: 9,
      color: (v) =>
        v.trim() === "published" ? green(v) : v.trim() === "draft" ? yellow(v) : gray(v),
    },
    { key: "category", header: "Category", min: 10, max: 20 },
    { key: "updatedAt", header: "Updated", min: 16, color: gray },
  ]);

  if (pagination) {
    if (pagination.nextCursor) {
      console.log(dim(`\nMore results available. Use --cursor ${pagination.nextCursor}`));
    } else if (pagination.totalPages) {
      console.log(
        dim(`\nPage ${pagination.page}/${pagination.totalPages}  (${total} total articles)`)
      );
    }
  }
}

// wiki articles get <slug>
async function cmdArticlesGet(args) {
  const cfg = requireConfig();
  const slug = args._[0];
  if (!slug) die("Usage: wiki articles get <slug>");

  const data = await apiGet(cfg, `/api/v2/articles/${slug}`, { fields: "id,title,slug,excerpt,content,status,createdAt,updatedAt,category,tags,revisions" });
  const article = data.data;

  if (!article) die("Article not found");

  console.log(bold("\n" + article.title));
  console.log(dim("─".repeat(60)));
  console.log(`${bold("Slug:")}     ${cyan(article.slug)}`);
  console.log(`${bold("Status:")}   ${article.status === "published" ? green(article.status) : yellow(article.status)}`);
  if (article.category) {
    console.log(`${bold("Category:")} ${article.category.name}`);
  }
  if (article.tags?.length) {
    console.log(`${bold("Tags:")}     ${article.tags.map((t) => t.name).join(", ")}`);
  }
  console.log(`${bold("Created:")}  ${formatDate(article.createdAt)}`);
  console.log(`${bold("Updated:")}  ${formatDate(article.updatedAt)}`);
  if (article.revisionCount !== undefined) {
    console.log(`${bold("Revisions:")} ${article.revisionCount}`);
  }
  console.log(dim("─".repeat(60)));
  if (article.excerpt) {
    console.log(`\n${bold("Excerpt:")}\n${article.excerpt}\n`);
  }
  if (article.content) {
    const plain = stripHtml(article.content).slice(0, 500);
    console.log(`${bold("Content preview:")}\n${plain}${article.content.length > 500 ? "..." : ""}\n`);
  }
}

// wiki articles create --title "Title" --content "Content" [--category slug]
async function cmdArticlesCreate(args) {
  const cfg = requireConfig();
  const { title, content, category, status } = args.flags;

  if (!title) die("Usage: wiki articles create --title \"Title\" --content \"Content\" [--category slug] [--status draft|published]");

  const slug = String(title)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  const body = {
    title: String(title),
    slug,
    content: content ? String(content) : "",
    status: status || "draft",
  };

  if (category) body.category = String(category);

  const data = await apiPost(cfg, "/api/articles", body);

  console.log(green("Article created successfully!"));
  console.log(`${bold("Title:")} ${data.title || title}`);
  console.log(`${bold("Slug:")}  ${cyan(data.slug || slug)}`);
  if (data.id) console.log(`${bold("ID:")}    ${data.id}`);
}

// wiki search <query>
async function cmdSearch(args) {
  const cfg = requireConfig();
  const query = args._.join(" ");
  if (!query) die("Usage: wiki search <query>");

  const params = { q: query, limit: args.flags.limit || 20 };
  const data = await apiGet(cfg, "/api/v2/search", params);
  const results = data.data || [];

  console.log(bold(`\nSearch results for: `) + cyan(`"${query}"`) + gray(`  (~${data.meta?.totalEstimate ?? results.length} matches)`));
  console.log(dim("─".repeat(60)));

  if (results.length === 0) {
    console.log(dim("No results found."));
    return;
  }

  for (const r of results) {
    console.log(`\n${bold(cyan(r.title))}  ${gray(`[${r.slug}]`)}  ${gray(`score:${r.score}`)}`);
    if (r.category) console.log(`  ${dim("Category:")} ${r.category.name}`);
    if (r.tags?.length) console.log(`  ${dim("Tags:")} ${r.tags.map((t) => t.name).join(", ")}`);
    if (r.excerpt || r.highlightedExcerpt) {
      const snippet = stripHtml(r.highlightedExcerpt || r.excerpt || "").slice(0, 150);
      console.log(`  ${dim(snippet)}${snippet.length >= 150 ? "..." : ""}`);
    }
    console.log(`  ${dim("Updated:")} ${formatDate(r.updatedAt)}`);
  }

  if (data.meta?.nextCursor) {
    console.log(dim(`\nMore results available. Use --cursor ${data.meta.nextCursor}`));
  }
}

// wiki export [--format markdown|html] [--category slug]
async function cmdExport(args) {
  const cfg = requireConfig();
  const format = args.flags.format || "markdown";
  const category = args.flags.category;

  if (!["markdown", "html"].includes(format)) {
    die("--format must be 'markdown' or 'html'");
  }

  console.log(bold(`Exporting articles as ${format}...`));

  const params = { limit: 100 };
  if (category) params.category = category;

  let allArticles = [];
  let cursor = null;

  // Paginate through all articles
  do {
    if (cursor) params.cursor = cursor;
    const data = await apiGet(cfg, "/api/v2/articles", { ...params, fields: "id,title,slug,content,contentRaw,excerpt,status,createdAt,updatedAt,category,tags" });
    const articles = data.data || [];
    allArticles = allArticles.concat(articles);
    cursor = data.meta?.nextCursor || null;
  } while (cursor);

  console.log(`Found ${bold(String(allArticles.length))} articles.`);

  for (const article of allArticles) {
    const filename = `${article.slug}.${format === "markdown" ? "md" : "html"}`;

    let fileContent;
    if (format === "markdown") {
      const tags = article.tags?.map((t) => t.name).join(", ") || "";
      const categoryName = article.category?.name || "";
      fileContent = [
        `---`,
        `title: "${article.title}"`,
        `slug: "${article.slug}"`,
        `status: ${article.status}`,
        `category: ${categoryName}`,
        `tags: [${tags}]`,
        `createdAt: ${article.createdAt}`,
        `updatedAt: ${article.updatedAt}`,
        `---`,
        "",
        article.contentRaw || stripHtml(article.content || ""),
      ].join("\n");
    } else {
      fileContent = [
        `<!DOCTYPE html>`,
        `<html lang="en">`,
        `<head><meta charset="UTF-8"><title>${article.title}</title></head>`,
        `<body>`,
        `<h1>${article.title}</h1>`,
        article.content || "",
        `</body></html>`,
      ].join("\n");
    }

    writeFileSync(filename, fileContent, "utf-8");
    console.log(green("  Wrote ") + filename);
  }

  console.log(bold(`\nExport complete. ${allArticles.length} files written.`));
}

// wiki import <file.md>
async function cmdImport(args) {
  const cfg = requireConfig();
  const filePath = args._[0];
  if (!filePath) die("Usage: wiki import <file.md>");

  if (!existsSync(filePath)) die(`File not found: ${filePath}`);

  const raw = await readFile(filePath, "utf-8");

  // Parse frontmatter (---\nkey: value\n---\n<content>)
  let title = "";
  let slug = "";
  let categorySlug = "";
  let status = "draft";
  let content = raw;

  const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (fmMatch) {
    const fm = fmMatch[1];
    content = fmMatch[2].trim();

    const titleMatch = fm.match(/^title:\s*"?(.+?)"?\s*$/m);
    if (titleMatch) title = titleMatch[1];

    const slugMatch = fm.match(/^slug:\s*"?(.+?)"?\s*$/m);
    if (slugMatch) slug = slugMatch[1];

    const statusMatch = fm.match(/^status:\s*(.+)\s*$/m);
    if (statusMatch) status = statusMatch[1].trim();

    const catMatch = fm.match(/^category:\s*(.+)\s*$/m);
    if (catMatch) categorySlug = catMatch[1].trim();
  }

  if (!title) {
    // Try to extract title from first # heading
    const headingMatch = content.match(/^#\s+(.+)$/m);
    if (headingMatch) title = headingMatch[1];
    else title = filePath.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");
  }

  if (!slug) {
    slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  console.log(`Importing: ${bold(title)} (${cyan(slug)})`);

  const body = {
    title,
    slug,
    contentRaw: content,
    content: `<p>${content.replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br>")}</p>`,
    status,
  };
  if (categorySlug) body.category = categorySlug;

  const data = await apiPost(cfg, "/api/articles", body);

  console.log(green("Imported successfully!"));
  if (data.slug) console.log(`  URL: ${cyan(cfg.url + "/wiki/" + data.slug)}`);
}

// ── Help ──────────────────────────────────────────────────────────────────────

function cmdHelp() {
  console.log(`
${bold(cyan("wiki-cli"))} — Command-line tool for managing wiki content

${bold("Configuration:")}
  wiki config set --url <URL> --key <API_KEY>   Save connection settings
  wiki config show                               Show current config

${bold("Articles:")}
  wiki articles list                             List articles (paginated)
    --page N           Page number (v1 API)
    --limit N          Results per page (default: 20)
    --category <slug>  Filter by category slug
    --status <status>  Filter by status (draft, review, published)
    --search <query>   Filter by search query

  wiki articles get <slug>                       Get article by slug or ID

  wiki articles create --title "..." --content "..."
    --title <title>    Article title (required)
    --content <text>   Article content (plain text or HTML)
    --category <slug>  Category slug
    --status <status>  Initial status (default: draft)

${bold("Search:")}
  wiki search <query>                            Full-text search
    --limit N          Max results (default: 20)

${bold("Export:")}
  wiki export                                    Export all articles
    --format markdown|html                       Output format (default: markdown)
    --category <slug>                            Export only one category

${bold("Import:")}
  wiki import <file.md>                          Import a Markdown file
                                                 Supports frontmatter: title, slug, status, category

${bold("Environment variables:")}
  WIKI_URL             Wiki base URL (alternative to wiki config set)
  WIKI_API_KEY         API key (alternative to wiki config set)

${bold("Config file:")}
  ~/.wiki-cli.json
`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const argv = process.argv.slice(2);
  const parsed = parseArgs(argv);
  const [cmd, sub, ...rest] = parsed._;
  const subArgs = { _: rest, flags: parsed.flags };

  try {
    if (!cmd || cmd === "help" || parsed.flags.help || parsed.flags.h) {
      cmdHelp();
      return;
    }

    if (cmd === "config") {
      if (sub === "set") cmdConfigSet(subArgs);
      else if (sub === "show") cmdConfigShow();
      else die(`Unknown config subcommand: ${sub}\nTry: wiki config set | wiki config show`);
      return;
    }

    if (cmd === "articles") {
      if (!sub || sub === "list") await cmdArticlesList(subArgs);
      else if (sub === "get") await cmdArticlesGet({ _: [rest[0]], flags: parsed.flags });
      else if (sub === "create") await cmdArticlesCreate(subArgs);
      else die(`Unknown articles subcommand: ${sub}\nTry: wiki articles list | get | create`);
      return;
    }

    if (cmd === "search") {
      // wiki search <query words...>
      const queryArgs = { _: [sub, ...rest].filter(Boolean), flags: parsed.flags };
      await cmdSearch(queryArgs);
      return;
    }

    if (cmd === "export") {
      await cmdExport(subArgs);
      return;
    }

    if (cmd === "import") {
      const fileArg = { _: [sub], flags: parsed.flags };
      await cmdImport(fileArg);
      return;
    }

    die(`Unknown command: ${cmd}\nRun 'wiki help' for usage.`);
  } catch (err) {
    if (err && err.message) {
      die(err.message);
    } else {
      die(String(err));
    }
  }
}

main();
