export const config = {
  name: process.env.NEXT_PUBLIC_ARKIVEL_NAME || process.env.NEXT_PUBLIC_WIKI_NAME || "Arkivel",
  tagline: process.env.NEXT_PUBLIC_ARKIVEL_TAGLINE || process.env.NEXT_PUBLIC_WIKI_TAGLINE || "The self-hosted knowledge platform",
  description:
    process.env.NEXT_PUBLIC_ARKIVEL_DESCRIPTION ||
    process.env.NEXT_PUBLIC_WIKI_DESCRIPTION ||
    "A powerful open-source knowledge platform for individuals and teams",
  welcomeText:
    process.env.NEXT_PUBLIC_ARKIVEL_WELCOME_TEXT ||
    process.env.NEXT_PUBLIC_WIKI_WELCOME_TEXT ||
    "Welcome to Arkivel. Create articles, organize knowledge, and build your own encyclopedia — on infrastructure you own.",
  footerText:
    process.env.NEXT_PUBLIC_ARKIVEL_FOOTER_TEXT ||
    process.env.NEXT_PUBLIC_WIKI_FOOTER_TEXT ||
    "Content is available under Creative Commons Attribution.",
  mapEnabled: process.env.NEXT_PUBLIC_MAP_ENABLED === "true",
  mapLabel: process.env.NEXT_PUBLIC_MAP_LABEL || "Map",
  mapImage: process.env.NEXT_PUBLIC_MAP_IMAGE || "",
  defaultLocale: process.env.NEXT_PUBLIC_DEFAULT_LOCALE || "en",
  articlesPerPage: parseInt(process.env.NEXT_PUBLIC_ARTICLES_PER_PAGE || "20", 10),
  maxUploadSize: parseInt(process.env.NEXT_PUBLIC_MAX_UPLOAD_SIZE || "5242880", 10),
  registrationEnabled: process.env.NEXT_PUBLIC_ENABLE_REGISTRATION !== "false",
  discussionsEnabled: process.env.NEXT_PUBLIC_ENABLE_DISCUSSIONS !== "false",
};
