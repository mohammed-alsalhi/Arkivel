const baseUrl = process.env.ARKIVEL_URL || "http://localhost:3000";
const apiKey = process.env.ARKIVEL_API_KEY;

if (!apiKey) throw new Error("Set ARKIVEL_API_KEY");

const response = await fetch(`${baseUrl}/api/v1/articles?limit=100&includeGlobal=1`, {
  headers: { "X-API-Key": apiKey },
});

if (!response.ok) throw new Error(`Article fetch failed: ${response.status}`);

const { articles } = await response.json();
const findings = articles.map((article) => ({
  slug: article.slug,
  hasExcerpt: Boolean(article.excerpt),
  tagCount: article.tags?.length ?? 0,
  hasCategory: Boolean(article.category),
  contentLength: article.content?.length ?? 0,
}));

console.log(JSON.stringify({ count: findings.length, findings }, null, 2));
