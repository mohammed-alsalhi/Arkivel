/**
 * Machine translation — gated on DEEPL_API_KEY or GOOGLE_TRANSLATE_API_KEY.
 * Creates a draft ArticleTranslation for editor review.
 */
import prisma from "@/lib/prisma";

async function translateWithDeepL(text: string, targetLang: string): Promise<string> {
  const key = process.env.DEEPL_API_KEY!;
  const url = key.endsWith(":fx")
    ? "https://api-free.deepl.com/v2/translate"
    : "https://api.deepl.com/v2/translate";

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `DeepL-Auth-Key ${key}`,
    },
    body: JSON.stringify({
      text: [text],
      target_lang: targetLang.toUpperCase(),
    }),
  });

  if (!res.ok) throw new Error(`DeepL error ${res.status}`);
  const data = await res.json();
  return data.translations[0].text as string;
}

async function translateWithGoogle(text: string, targetLang: string): Promise<string> {
  const key = process.env.GOOGLE_TRANSLATE_API_KEY!;
  const url = `https://translation.googleapis.com/language/translate/v2?key=${key}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q: text, target: targetLang, format: "html" }),
  });

  if (!res.ok) throw new Error(`Google Translate error ${res.status}`);
  const data = await res.json();
  return data.data.translations[0].translatedText as string;
}

export async function translateArticle(
  articleId: string,
  targetLocale: string
): Promise<{ id: string }> {
  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: { title: true, content: true },
  });
  if (!article) throw new Error("Article not found");

  let translatedTitle: string;
  let translatedContent: string;

  if (process.env.DEEPL_API_KEY) {
    [translatedTitle, translatedContent] = await Promise.all([
      translateWithDeepL(article.title, targetLocale),
      translateWithDeepL(article.content, targetLocale),
    ]);
  } else if (process.env.GOOGLE_TRANSLATE_API_KEY) {
    [translatedTitle, translatedContent] = await Promise.all([
      translateWithGoogle(article.title, targetLocale),
      translateWithGoogle(article.content, targetLocale),
    ]);
  } else {
    throw new Error("No translation API key configured");
  }

  const translation = await prisma.articleTranslation.upsert({
    where: { articleId_locale: { articleId, locale: targetLocale } },
    create: {
      articleId,
      locale: targetLocale,
      title: translatedTitle,
      content: translatedContent,
    },
    update: {
      title: translatedTitle,
      content: translatedContent,
    },
  });

  return { id: translation.id };
}
