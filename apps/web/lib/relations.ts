/**
 * Relation resolvers (build doc §7.1).
 *
 * Pure, synchronous helpers that turn `*Ids` arrays (or a single `*Id`) into full
 * typed records by filtering a source array. Call sites pass the already-loaded
 * source array (fetched via `lib/repository`) so these stay side-effect-free and
 * trivially testable.
 *
 * A rename never severs a link because links are by id, not display name.
 */

import type {
  Decision,
  Domain,
  Drawing,
  Lesson,
  Material,
  ProcurementItem,
  ProgressEntry,
  Snag,
  Space,
  Vendor,
  Warranty,
} from "@/types";

interface HasId {
  id: string;
}

/** Generic: resolve an id array against a source array, preserving id order. */
export function byIds<T extends HasId>(ids: string[], all: T[]): T[] {
  const index = new Map(all.map((item) => [item.id, item]));
  return ids
    .map((id) => index.get(id))
    .filter((item): item is T => item !== undefined);
}

/** Generic: resolve a single id (returns null if absent or id is ""). */
export function byId<T extends HasId>(id: string, all: T[]): T | null {
  if (!id) return null;
  return all.find((item) => item.id === id) ?? null;
}

// Typed conveniences ---------------------------------------------------------

export const spacesByIds = (ids: string[], all: Space[]): Space[] =>
  byIds(ids, all);
export const domainsByIds = (ids: string[], all: Domain[]): Domain[] =>
  byIds(ids, all);
export const vendorsByIds = (ids: string[], all: Vendor[]): Vendor[] =>
  byIds(ids, all);
export const drawingsByIds = (ids: string[], all: Drawing[]): Drawing[] =>
  byIds(ids, all);
export const decisionsByIds = (ids: string[], all: Decision[]): Decision[] =>
  byIds(ids, all);
export const lessonsByIds = (ids: string[], all: Lesson[]): Lesson[] =>
  byIds(ids, all);
export const materialsByIds = (ids: string[], all: Material[]): Material[] =>
  byIds(ids, all);
export const procurementByIds = (
  ids: string[],
  all: ProcurementItem[],
): ProcurementItem[] => byIds(ids, all);
export const snagsByIds = (ids: string[], all: Snag[]): Snag[] => byIds(ids, all);
export const progressByIds = (
  ids: string[],
  all: ProgressEntry[],
): ProgressEntry[] => byIds(ids, all);
export const warrantiesByIds = (ids: string[], all: Warranty[]): Warranty[] =>
  byIds(ids, all);

export const spaceById = (id: string, all: Space[]): Space | null =>
  byId(id, all);
export const domainById = (id: string, all: Domain[]): Domain | null =>
  byId(id, all);
export const vendorById = (id: string, all: Vendor[]): Vendor | null =>
  byId(id, all);
export const drawingById = (id: string, all: Drawing[]): Drawing | null =>
  byId(id, all);
