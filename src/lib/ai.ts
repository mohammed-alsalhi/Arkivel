import { generateText } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";

/**
 * Returns an Anthropic provider instance if AI_API_KEY is configured, otherwise null.
 */
function getProvider() {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) return null;
  return createAnthropic({ apiKey });
}

/**
 * Strips HTML tags from a string and normalises whitespace.
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Summarizes an article in 2-3 sentences.
 * Returns null when AI is not configured.
 */
export async function summarizeArticle(content: string): Promise<string | null> {
  const anthropic = getProvider();
  if (!anthropic) return null;

  const plainText = stripHtml(content).slice(0, 3000);

  try {
    const { text } = await generateText({
      model: anthropic("claude-haiku-4-5"),
      prompt: `Summarize this article in 2-3 sentences:\n\n${plainText}`,
    });
    return text.trim();
  } catch (error) {
    console.error("AI summarization failed:", error);
    return null;
  }
}

/**
 * Suggests 5 related article topics given a title, content, and existing tags.
 * Returns an empty array when AI is not configured or on error.
 */
export async function suggestRelatedTopics(
  title: string,
  content: string,
  existingTags: string[]
): Promise<string[]> {
  const anthropic = getProvider();
  if (!anthropic) return [];

  const plainText = stripHtml(content).slice(0, 2000);
  const tagsStr = existingTags.length > 0 ? existingTags.join(", ") : "none";

  const prompt =
    `Given this article titled '${title}', suggest 5 related topics that could be linked articles. ` +
    `The article is about: ${plainText}\n\n` +
    `Existing tags: ${tagsStr}\n\n` +
    `Return exactly 5 topic titles, one per line, with no numbering or extra formatting.`;

  try {
    const { text } = await generateText({
      model: anthropic("claude-haiku-4-5"),
      prompt,
    });

    return text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .slice(0, 5);
  } catch (error) {
    console.error("AI topic suggestion failed:", error);
    return [];
  }
}

/**
 * Generates article content from a prompt.
 * If existingContent is provided, the AI continues or expands it.
 * Returns null when AI is not configured or on error.
 */
export async function generateContent(
  prompt: string,
  existingContent?: string
): Promise<string | null> {
  const anthropic = getProvider();
  if (!anthropic) return null;

  let fullPrompt: string;
  if (existingContent) {
    const existing = stripHtml(existingContent).slice(0, 2000);
    fullPrompt =
      `Continue and expand the following wiki article content based on this instruction: ${prompt}\n\n` +
      `Existing content:\n${existing}\n\n` +
      `Write additional content that flows naturally from the above. Use plain text without markdown formatting.`;
  } else {
    fullPrompt =
      `Write a wiki article based on the following prompt: ${prompt}\n\n` +
      `Write comprehensive, encyclopedic content. Use plain text without markdown formatting.`;
  }

  try {
    const { text } = await generateText({
      model: anthropic("claude-haiku-4-5"),
      prompt: fullPrompt,
    });
    return text.trim();
  } catch (error) {
    console.error("AI content generation failed:", error);
    return null;
  }
}
