import sanitizeHtml from "sanitize-html";

/**
 * Sanitizes HTML content from external sources (e.g. Lightspeed product/category
 * descriptions) before rendering with dangerouslySetInnerHTML.
 *
 * Strips document-structure tags (html, head, title, meta, link, body,
 * script, style) while preserving all normal content markup.
 */
export function sanitizeDescription(html: string | null | undefined): string {
  if (!html) return "";

  return sanitizeHtml(html, {
    allowedTags: [
      "p", "br", "div", "span",
      "h1", "h2", "h3", "h4", "h5", "h6",
      "strong", "b", "em", "i", "u", "s", "strike",
      "ul", "ol", "li",
      "a", "img",
      "table", "thead", "tbody", "tfoot", "tr", "th", "td",
      "blockquote", "hr", "pre", "code",
    ],
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "width", "height", "loading"],
      td: ["colspan", "rowspan"],
      th: ["colspan", "rowspan", "scope"],
      "*": ["class"],
    },
    allowedSchemes: ["https", "http", "mailto"],
  });
}
