import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdmin, requireAdmin } from "@/lib/auth";

type BuiltinTemplate = {
  id: string;
  name: string;
  description: string;
  content: string;
  categoryId: string | null;
  isPublic: boolean;
  builtin: true;
};

const BUILTIN_TEMPLATES: BuiltinTemplate[] = [
  {
    id: "builtin-person",
    name: "Person",
    description: "Template for biographical articles about people.",
    content: `<h2>Early Life</h2><p>Write about early life and background here.</p><h2>Career</h2><p>Describe career achievements and milestones.</p><h2>Personal Life</h2><p>Include personal details, family, and interests.</p><h2>Legacy</h2><p>Describe lasting impact and legacy.</p>`,
    categoryId: null,
    isPublic: true,
    builtin: true,
  },
  {
    id: "builtin-place",
    name: "Place",
    description: "Template for articles about locations, cities, or regions.",
    content: `<h2>Geography</h2><p>Describe the location, terrain, and climate.</p><h2>History</h2><p>Cover the historical background and key events.</p><h2>Culture</h2><p>Describe cultural aspects, traditions, and customs.</p><h2>Notable Features</h2><p>List notable landmarks, features, or points of interest.</p>`,
    categoryId: null,
    isPublic: true,
    builtin: true,
  },
  {
    id: "builtin-event",
    name: "Event",
    description: "Template for historical events, battles, or occurrences.",
    content: `<h2>Background</h2><p>Describe the context and causes leading to this event.</p><h2>The Event</h2><p>Detail what happened, including key participants and timeline.</p><h2>Aftermath</h2><p>Describe the consequences and immediate effects.</p><h2>Significance</h2><p>Explain the long-term impact and historical significance.</p>`,
    categoryId: null,
    isPublic: true,
    builtin: true,
  },
  {
    id: "builtin-thing",
    name: "Thing",
    description: "Template for objects, artifacts, or concepts.",
    content: `<h2>Overview</h2><p>Provide a general description and definition.</p><h2>Characteristics</h2><p>Describe key properties, features, or attributes.</p><h2>History</h2><p>Cover the origin and evolution over time.</p><h2>Usage</h2><p>Explain how it is used or its role in context.</p>`,
    categoryId: null,
    isPublic: true,
    builtin: true,
  },
  {
    id: "builtin-group",
    name: "Group",
    description: "Template for organizations, factions, or groups of people.",
    content: `<h2>Formation</h2><p>Describe how and when the group was formed.</p><h2>Structure</h2><p>Explain the organizational structure and leadership.</p><h2>Activities</h2><p>Detail the group's main activities, goals, and operations.</p><h2>Notable Members</h2><p>List key members and their roles.</p><h2>Influence</h2><p>Describe the group's impact and reach.</p>`,
    categoryId: null,
    isPublic: true,
    builtin: true,
  },
  {
    id: "builtin-blank",
    name: "Blank",
    description: "Empty template with no predefined structure.",
    content: `<p>Start writing here...</p>`,
    categoryId: null,
    isPublic: true,
    builtin: true,
  },
];

export async function GET() {
  // Try to load custom templates from the database
  let customTemplates: Array<{
    id: string;
    name: string;
    description: string | null;
    content: string;
    categoryId: string | null;
    isPublic: boolean;
    createdAt: Date;
  }> = [];

  try {
    // ArticleTemplate may not exist yet — gracefully fall back
    customTemplates = await (prisma as unknown as {
      articleTemplate: {
        findMany: (args: { orderBy: { name: string } }) => Promise<typeof customTemplates>;
      };
    }).articleTemplate.findMany({
      orderBy: { name: "asc" },
    });
  } catch {
    // Table does not exist yet — that's fine
  }

  const templates = [
    ...BUILTIN_TEMPLATES,
    ...customTemplates.map((t) => ({
      ...t,
      description: t.description ?? "",
      builtin: false as const,
    })),
  ];

  return NextResponse.json(templates);
}

export async function POST(request: NextRequest) {
  const denied = requireAdmin(await isAdmin());
  if (denied) return denied;

  const body = await request.json();
  const { name, description, content, categoryId, isPublic } = body;

  if (!name || !content) {
    return NextResponse.json(
      { error: "Name and content are required." },
      { status: 400 }
    );
  }

  // Try to create in ArticleTemplate table
  try {
    const template = await (prisma as unknown as {
      articleTemplate: {
        create: (args: {
          data: {
            name: string;
            description: string;
            content: string;
            categoryId: string | null;
            isPublic: boolean;
          };
        }) => Promise<{ id: string; name: string; description: string; content: string; categoryId: string | null; isPublic: boolean; createdAt: Date }>;
      };
    }).articleTemplate.create({
      data: {
        name,
        description: description || "",
        content,
        categoryId: categoryId || null,
        isPublic: isPublic !== false,
      },
    });

    return NextResponse.json({ ...template, builtin: false }, { status: 201 });
  } catch {
    // ArticleTemplate table doesn't exist yet
    return NextResponse.json(
      {
        error:
          "ArticleTemplate table does not exist. Run a migration to add it, or templates are read-only (built-in only).",
      },
      { status: 501 }
    );
  }
}

export const dynamic = "force-dynamic";
