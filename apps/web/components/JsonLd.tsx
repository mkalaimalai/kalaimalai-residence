import type { SchemaObject } from "@/lib/jsonld";

/**
 * Renders one or more Schema.org objects as a <script type="application/ld+json"> tag.
 * Server-rendered, so the structured data ships in the static HTML for crawlers.
 */
export function JsonLd({ data }: { data: SchemaObject | SchemaObject[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
