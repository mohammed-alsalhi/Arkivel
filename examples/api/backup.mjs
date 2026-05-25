const baseUrl = process.env.ARKIVEL_URL || "http://localhost:3000";
const apiKey = process.env.ARKIVEL_API_KEY;

if (!apiKey) throw new Error("Set ARKIVEL_API_KEY");

async function get(path) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: { "X-API-Key": apiKey },
  });
  if (!response.ok) throw new Error(`${path} failed: ${response.status}`);
  return response.json();
}

const [articles, categories, tags] = await Promise.all([
  get("/api/v1/articles?limit=100&includeGlobal=1"),
  get("/api/v1/categories"),
  get("/api/v1/tags"),
]);

console.log(JSON.stringify({ articles, categories, tags, exportedAt: new Date().toISOString() }, null, 2));
