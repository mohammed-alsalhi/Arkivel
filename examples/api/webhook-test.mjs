const event = {
  id: `evt_${Date.now()}`,
  event: "article.updated",
  occurredAt: new Date().toISOString(),
  payload: { articleId: "example", slug: "example-article" },
};

console.log(JSON.stringify(event, null, 2));
