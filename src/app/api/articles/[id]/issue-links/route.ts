import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

async function refreshIssueStatus(link: {
  id: string;
  url: string;
  provider: string;
  issueId: string;
}) {
  const githubToken = process.env.GITHUB_TOKEN;
  if (link.provider === "github" && githubToken) {
    try {
      // Parse owner/repo/number from GitHub URL
      const match = link.url.match(/github\.com\/([^/]+)\/([^/]+)\/(issues|pull)\/(\d+)/);
      if (!match) return;
      const [, owner, repo, type, number] = match;
      const apiUrl = `https://api.github.com/repos/${owner}/${repo}/${type === "pull" ? "pulls" : "issues"}/${number}`;
      const res = await fetch(apiUrl, {
        headers: { Authorization: `token ${githubToken}`, Accept: "application/vnd.github.v3+json" },
      });
      if (!res.ok) return;
      const data = await res.json();
      const status = data.state === "open" ? "open" : "closed";
      await prisma.issueLink.update({
        where: { id: link.id },
        data: { status, title: data.title, lastCheckedAt: new Date() },
      });
    } catch {
      // Ignore refresh errors
    }
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const links = await prisma.issueLink.findMany({
    where: { articleId: id },
    orderBy: { createdAt: "asc" },
  });
  // Background refresh
  links.forEach((l) => refreshIssueStatus(l).catch(() => {}));
  return NextResponse.json(links);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { url } = await request.json();
  if (!url) return NextResponse.json({ error: "url required" }, { status: 400 });

  // Detect provider
  let provider = "unknown";
  let issueId = "";
  if (url.includes("github.com")) {
    provider = "github";
    const m = url.match(/\/(\d+)\/?$/);
    issueId = m?.[1] ?? url;
  } else if (url.includes("atlassian.net") || url.includes("jira.")) {
    provider = "jira";
    const m = url.match(/\/([A-Z]+-\d+)/);
    issueId = m?.[1] ?? url;
  } else if (url.includes("linear.app")) {
    provider = "linear";
    const m = url.match(/\/([A-Z]+-\d+)/);
    issueId = m?.[1] ?? url;
  }

  const link = await prisma.issueLink.create({
    data: { articleId: id, url, provider, issueId },
  });

  // Fire-and-forget status refresh
  refreshIssueStatus(link).catch(() => {});

  return NextResponse.json(link, { status: 201 });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const url = new URL(request.url);
  const linkId = url.searchParams.get("linkId");
  if (!linkId) return NextResponse.json({ error: "linkId required" }, { status: 400 });

  await prisma.issueLink.deleteMany({ where: { id: linkId, articleId: id } });
  return NextResponse.json({ ok: true });
}
