import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const categories = [
  { name: "People", slug: "people", icon: "\u{2666}", description: "Individuals and notable figures", sortOrder: 0 },
  { name: "Places", slug: "places", icon: "\u{25C6}", description: "Locations, cities, and regions", sortOrder: 1 },
  { name: "Organizations", slug: "organizations", icon: "\u{25A0}", description: "Groups, teams, and institutions", sortOrder: 2 },
  { name: "Events", slug: "events", icon: "\u{25B6}", description: "Notable events and occurrences", sortOrder: 3 },
  { name: "Things", slug: "things", icon: "\u{25CF}", description: "Objects, items, and artifacts", sortOrder: 4 },
  { name: "Concepts", slug: "concepts", icon: "\u{25B2}", description: "Ideas, systems, and knowledge", sortOrder: 5 },
];

const subcategories = {
  people: [
    { name: "Leaders", slug: "leaders", icon: "\u{2666}", description: "Rulers, commanders, and authority figures", sortOrder: 0 },
    { name: "Artists", slug: "artists", icon: "\u{2666}", description: "Painters, musicians, writers, and performers", sortOrder: 1 },
    { name: "Scientists", slug: "scientists", icon: "\u{2666}", description: "Researchers, inventors, and scholars", sortOrder: 2 },
    { name: "Warriors", slug: "warriors", icon: "\u{2666}", description: "Fighters, soldiers, and martial figures", sortOrder: 3 },
    { name: "Merchants", slug: "merchants", icon: "\u{2666}", description: "Traders, shopkeepers, and business figures", sortOrder: 4 },
  ],
  places: [
    { name: "Cities", slug: "cities", icon: "\u{25C6}", description: "Towns, cities, and urban centers", sortOrder: 0 },
    { name: "Regions", slug: "regions", icon: "\u{25C6}", description: "Provinces, territories, and geographic areas", sortOrder: 1 },
    { name: "Landmarks", slug: "landmarks", icon: "\u{25C6}", description: "Natural and notable landmarks", sortOrder: 2 },
    { name: "Buildings", slug: "buildings", icon: "\u{25C6}", description: "Structures, temples, and fortifications", sortOrder: 3 },
  ],
  organizations: [
    { name: "Governments", slug: "governments", icon: "\u{25A0}", description: "States, kingdoms, and political bodies", sortOrder: 0 },
    { name: "Military", slug: "military", icon: "\u{25A0}", description: "Armies, navies, and defense forces", sortOrder: 1 },
    { name: "Religious", slug: "religious", icon: "\u{25A0}", description: "Churches, temples, and religious orders", sortOrder: 2 },
    { name: "Guilds", slug: "guilds", icon: "\u{25A0}", description: "Trade guilds, unions, and professional groups", sortOrder: 3 },
  ],
  events: [
    { name: "Battles", slug: "battles", icon: "\u{25B6}", description: "Wars, skirmishes, and military conflicts", sortOrder: 0 },
    { name: "Ceremonies", slug: "ceremonies", icon: "\u{25B6}", description: "Rituals, festivals, and celebrations", sortOrder: 1 },
    { name: "Discoveries", slug: "discoveries", icon: "\u{25B6}", description: "Explorations and scientific breakthroughs", sortOrder: 2 },
    { name: "Disasters", slug: "disasters", icon: "\u{25B6}", description: "Natural disasters and catastrophes", sortOrder: 3 },
  ],
  things: [
    { name: "Weapons", slug: "weapons", icon: "\u{25CF}", description: "Swords, bows, and instruments of war", sortOrder: 0 },
    { name: "Artifacts", slug: "artifacts", icon: "\u{25CF}", description: "Magical or historical relics", sortOrder: 1 },
    { name: "Documents", slug: "documents", icon: "\u{25CF}", description: "Books, scrolls, and written records", sortOrder: 2 },
    { name: "Tools", slug: "tools", icon: "\u{25CF}", description: "Instruments and practical devices", sortOrder: 3 },
  ],
  concepts: [
    { name: "Magic", slug: "magic", icon: "\u{25B2}", description: "Magical systems and arcane knowledge", sortOrder: 0 },
    { name: "Religions", slug: "religions", icon: "\u{25B2}", description: "Faiths, belief systems, and deities", sortOrder: 1 },
    { name: "Laws", slug: "laws", icon: "\u{25B2}", description: "Legal codes, rules, and regulations", sortOrder: 2 },
    { name: "Languages", slug: "languages", icon: "\u{25B2}", description: "Spoken and written language systems", sortOrder: 3 },
  ],
};

async function main() {
  // Seed root categories
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { icon: cat.icon },
      create: cat,
    });
  }
  console.log("Seeded categories:", categories.map((c) => c.name).join(", "));

  // Seed subcategories
  let subCount = 0;
  for (const [parentSlug, subs] of Object.entries(subcategories)) {
    const parent = await prisma.category.findUnique({ where: { slug: parentSlug } });
    if (!parent) continue;
    for (const sub of subs) {
      await prisma.category.upsert({
        where: { slug: sub.slug },
        update: { icon: sub.icon },
        create: { ...sub, parentId: parent.id },
      });
      subCount++;
    }
  }
  console.log(`Seeded ${subCount} subcategories`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
