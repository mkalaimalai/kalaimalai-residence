/**
 * Schema.org JSON-LD mappers — the public semantic layer from schema.md (§1, §3, §5–7, §10).
 *
 * Pure functions: typed entities → Schema.org objects, applying the field mappings in
 * schema.md §3 (e.g. area→floorSize, rating→AggregateRating, category→serviceType,
 * keywords from the §4 taxonomy). Rendered as <script type="application/ld+json"> by the
 * `JsonLd` component. Public-safe only — never emits portal fields (phone, email, gst,
 * villaNo, address); the public site stays anonymized (constitution §5).
 */
import { RESIDENCE_KEYWORDS } from "@/lib/taxonomy";
import type {
  Domain,
  Drawing,
  GalleryItem,
  Lesson,
  Material,
  Project,
  Space,
  Vendor,
} from "@/types";

export type SchemaObject = Record<string, unknown>;

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://mkalaimalai-residence.github.io"
).replace(/\/$/, "");

export const abs = (path: string): string =>
  path.startsWith("http") ? path : `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;

const withContext = (obj: SchemaObject): SchemaObject => ({
  "@context": "https://schema.org",
  ...obj,
});

const parseSqft = (value: string): number | null => {
  const m = value.match(/[\d,.]+/);
  if (!m) return null;
  const n = Number(m[0].replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
};

// --- WebSite + Project + House (home / vision) -------------------------------------
export function webSiteJsonLd(project: Project): SchemaObject {
  return withContext({
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: project.publicTitle,
    url: `${SITE_URL}/`,
    description: project.publicSubtitle,
  });
}

export function projectJsonLd(project: Project): SchemaObject {
  return withContext({
    "@type": "Project",
    "@id": `${SITE_URL}/#residence-project`,
    name: project.publicTitle,
    description: project.conceptStatement || project.publicSubtitle,
    url: `${SITE_URL}/`,
    keywords: [...RESIDENCE_KEYWORDS],
    location: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: project.city,
        addressRegion: "Karnataka",
        addressCountry: "IN",
      },
    },
    ...(project.heroImage ? { image: abs(project.heroImage) } : {}),
  });
}

export function houseJsonLd(project: Project): SchemaObject {
  const sqft = parseSqft(project.builtUpArea);
  return withContext({
    "@type": "House",
    "@id": `${SITE_URL}/#residence`,
    name: project.publicTitle,
    description: project.conceptStatement || project.publicSubtitle,
    ...(sqft
      ? {
          floorSize: {
            "@type": "QuantitativeValue",
            value: sqft,
            unitText: "SQFT",
          },
        }
      : {}),
    ...(project.heroImage ? { image: abs(project.heroImage) } : {}),
  });
}

// --- Room (space pages) ------------------------------------------------------------
export function roomJsonLd(
  space: Space,
  project: Project,
  drawings: Drawing[] = [],
): SchemaObject {
  const subjectOf = drawings.map((d) => ({
    "@type": "CreativeWork",
    name: d.title,
  }));
  return withContext({
    "@type": "Room",
    "@id": abs(`/spaces/${space.slug}`),
    name: space.name,
    description: space.description || space.designIntent,
    containedInPlace: {
      "@type": "House",
      name: project.publicTitle,
    },
    ...(space.image
      ? {
          image: {
            "@type": "ImageObject",
            name: `${space.name} render`,
            contentUrl: abs(space.image),
          },
        }
      : {}),
    ...(subjectOf.length ? { subjectOf } : {}),
  });
}

// --- HomeAndConstructionBusiness (vendor directory; public-safe) -------------------
export function vendorJsonLd(vendor: Vendor): SchemaObject {
  return {
    "@type": "HomeAndConstructionBusiness",
    name: vendor.name,
    ...(vendor.category ? { serviceType: vendor.category } : {}),
    ...(vendor.website ? { url: vendor.website } : {}),
    ...(vendor.location
      ? { areaServed: { "@type": "Place", name: vendor.location } }
      : {}),
    ...(vendor.rating > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: vendor.rating,
            bestRating: 5,
            ratingCount: 1,
          },
        }
      : {}),
  };
}

// --- Product (materials) -----------------------------------------------------------
export function productJsonLd(material: Material): SchemaObject {
  return {
    "@type": "Product",
    name: material.name,
    ...(material.category ? { category: material.category } : {}),
    ...(material.image ? { image: abs(material.image) } : {}),
    ...(material.notes ? { description: material.notes } : {}),
  };
}

// --- Article (lessons) -------------------------------------------------------------
export function articleJsonLd(lesson: Lesson): SchemaObject {
  return {
    "@type": "Article",
    headline: lesson.title,
    ...(lesson.summary ? { description: lesson.summary } : {}),
    ...(lesson.category ? { articleSection: lesson.category } : {}),
  };
}

// --- ImageObject (gallery) ---------------------------------------------------------
export function imageObjectJsonLd(item: GalleryItem): SchemaObject {
  return {
    "@type": "ImageObject",
    name: item.title,
    contentUrl: abs(item.image),
    ...(item.caption ? { caption: item.caption } : {}),
  };
}

// --- CreativeWork (domains as work areas / case studies) ---------------------------
export function domainJsonLd(domain: Domain): SchemaObject {
  return {
    "@type": "CreativeWork",
    name: domain.name,
    ...(domain.description ? { description: domain.description } : {}),
    url: abs(`/domains/${domain.slug}`),
  };
}

// --- ItemList wrapper --------------------------------------------------------------
export function itemListJsonLd(
  items: SchemaObject[],
  opts: { name?: string } = {},
): SchemaObject {
  return withContext({
    "@type": "ItemList",
    ...(opts.name ? { name: opts.name } : {}),
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item,
    })),
  });
}
