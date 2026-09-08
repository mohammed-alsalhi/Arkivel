import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import pg from "pg";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required to seed smoke fixtures.");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash(process.env.SMOKE_ADMIN_PASSWORD || "arkivel-smoke-admin", 10);

  const user = await prisma.user.upsert({
    where: { username: "smoke-admin" },
    update: { email: "smoke-admin@example.test", passwordHash, role: "admin" },
    create: {
      email: "smoke-admin@example.test",
      passwordHash,
      role: "admin",
      username: "smoke-admin",
    },
  });

  const category = await prisma.category.upsert({
    where: { slug: "smoke-fixtures" },
    update: { description: "Repeatable QA fixtures for v5 smoke tests." },
    create: {
      description: "Repeatable QA fixtures for v5 smoke tests.",
      name: "Smoke Fixtures",
      slug: "smoke-fixtures",
      sortOrder: 999,
    },
  });

  await prisma.article.upsert({
    where: { slug: "smoke-linked-target" },
    update: {
      categoryId: category.id,
      content: "<p>Smoke linked target article.</p>",
      excerpt: "Smoke linked target article.",
      status: "published",
      userId: user.id,
    },
    create: {
      categoryId: category.id,
      content: "<p>Smoke linked target article.</p>",
      excerpt: "Smoke linked target article.",
      slug: "smoke-linked-target",
      status: "published",
      title: "Smoke Linked Target",
      userId: user.id,
    },
  });

  await prisma.article.upsert({
    where: { slug: "smoke-home" },
    update: {
      categoryId: category.id,
      content: "<p>Smoke Home links to [[Smoke Linked Target]] for wiki-link smoke coverage.</p>",
      contentRaw: "Smoke Home links to [[Smoke Linked Target]] for wiki-link smoke coverage.",
      excerpt: "Smoke Home links to Smoke Linked Target.",
      status: "published",
      userId: user.id,
    },
    create: {
      categoryId: category.id,
      content: "<p>Smoke Home links to [[Smoke Linked Target]] for wiki-link smoke coverage.</p>",
      contentRaw: "Smoke Home links to [[Smoke Linked Target]] for wiki-link smoke coverage.",
      excerpt: "Smoke Home links to Smoke Linked Target.",
      slug: "smoke-home",
      status: "published",
      title: "Smoke Home",
      userId: user.id,
    },
  });

  console.log("Seeded smoke fixtures: smoke-admin, smoke-fixtures, smoke-home, smoke-linked-target");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
