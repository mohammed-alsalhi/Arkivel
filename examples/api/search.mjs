const baseUrl = process.env.ARKIVEL_URL || "http://localhost:3000";
const apiKey = process.env.ARKIVEL_API_KEY;
const query = process.argv.slice(2).join(" ") || "example";

if (!apiKey) throw new Error("Set ARKIVEL_API_KEY");

const response = await fetch(`${baseUrl}/api/v1/search?q=${encodeURIComponent(query)}&limit=10`, {
  headers: { "X-API-Key": apiKey },
});

if (!response.ok) throw new Error(`Search failed: ${response.status}`);
console.log(JSON.stringify(await response.json(), null, 2));
