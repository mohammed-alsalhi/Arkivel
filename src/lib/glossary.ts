/**
 * Server-side utility: injects `data-glossary-term` spans into article HTML
 * for any glossary terms that appear in the content.
 */

type GlossaryTerm = { term: string; definition: string; aliases: string[] };

export function resolveGlossaryTerms(html: string, terms: GlossaryTerm[]): string {
  if (terms.length === 0) return html;

  // Build a flat list of {pattern, term, definition} sorted longest-first to
  // avoid partial matches overriding longer ones.
  const entries: { pattern: string; term: string; definition: string }[] = [];
  for (const t of terms) {
    entries.push({ pattern: t.term, term: t.term, definition: t.definition });
    for (const alias of t.aliases) {
      entries.push({ pattern: alias, term: t.term, definition: t.definition });
    }
  }
  entries.sort((a, b) => b.pattern.length - a.pattern.length);

  // Only annotate text nodes — avoid matching inside tags/attributes by
  // splitting on tag boundaries and only touching non-tag segments.
  const parts = html.split(/(<[^>]+>)/);

  return parts
    .map((part) => {
      if (part.startsWith("<")) return part; // it's a tag — skip

      let result = part;
      const alreadyUsed = new Set<string>();

      for (const { pattern, term, definition } of entries) {
        if (alreadyUsed.has(pattern.toLowerCase())) continue;

        // Case-insensitive whole-word match, not already inside a data-glossary span
        const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const re = new RegExp(`(?<![a-zA-Z])${escaped}(?![a-zA-Z])`, "gi");

        if (re.test(result)) {
          alreadyUsed.add(pattern.toLowerCase());
          result = result.replace(re, (match) => {
            const safe = definition.replace(/"/g, "&quot;");
            return `<span data-glossary-term="${encodeURIComponent(term)}" data-glossary-def="${safe}" class="glossary-term">${match}</span>`;
          });
        }
      }

      return result;
    })
    .join("");
}
