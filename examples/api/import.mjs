const baseUrl = process.env.ARKIVEL_URL || "http://localhost:3000";

console.log(JSON.stringify({
  mode: "dry-run",
  message: "Use Arkivel import rehearsal endpoints before enabling write imports.",
  rehearsalEndpoint: `${baseUrl}/api/import/rehearsal`,
}, null, 2));
