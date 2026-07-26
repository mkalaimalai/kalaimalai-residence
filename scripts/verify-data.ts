/**
 * Foundation verification harness (run via `npm run verify`).
 *
 * Proves the data + relations layers work end-to-end without any UI:
 *  1. Non-zero counts for every entity.
 *  2. Referential integrity — every `*Id(s)` reference resolves to a real record.
 *  3. Gallery (and space) image paths point at real files under `public/`.
 *  4. A fully resolved sample relation chain (master bedroom → vendors/drawings/decisions).
 *
 * Exits non-zero if any check fails, so it doubles as a CI gate.
 */

import { existsSync } from "node:fs";
import { join } from "node:path";

import * as repo from "@/lib/repository";
import { byIds, vendorsByIds, drawingsByIds, decisionsByIds } from "@/lib/relations";

let failures = 0;
const fail = (msg: string) => {
  failures += 1;
  console.error(`  ✗ ${msg}`);
};

async function main() {
  const [
    project,
    spaces,
    domains,
    drawings,
    vendors,
    procurement,
    decisions,
    boqs,
    materials,
    progress,
    snags,
    warranties,
    lessons,
    gallery,
  ] = await Promise.all([
    repo.getProject(),
    repo.getSpaces(),
    repo.getDomains(),
    repo.getDrawings(),
    repo.getVendors(),
    repo.getProcurement(),
    repo.getDecisions(),
    repo.getBOQs(),
    repo.getMaterials(),
    repo.getProgress(),
    repo.getSnags(),
    repo.getWarranties(),
    repo.getLessons(),
    repo.getGallery(),
  ]);

  // 1. Counts ---------------------------------------------------------------
  console.log("\nEntity counts");
  const counts: Record<string, number> = {
    project: project ? 1 : 0,
    spaces: spaces.length,
    domains: domains.length,
    drawings: drawings.length,
    vendors: vendors.length,
    procurement: procurement.length,
    decisions: decisions.length,
    boqs: boqs.length,
    materials: materials.length,
    progress: progress.length,
    snags: snags.length,
    warranties: warranties.length,
    lessons: lessons.length,
    gallery: gallery.length,
  };
  for (const [name, n] of Object.entries(counts)) {
    console.log(`  ${n > 0 ? "✓" : "✗"} ${name.padEnd(12)} ${n}`);
    if (n === 0) fail(`${name} has no rows`);
  }

  // 2. Referential integrity ------------------------------------------------
  console.log("\nReferential integrity");
  const spaceIds = new Set(spaces.map((s) => s.id));
  const domainIds = new Set(domains.map((d) => d.id));
  const vendorIds = new Set(vendors.map((v) => v.id));
  const drawingIds = new Set(drawings.map((d) => d.id));
  const decisionIds = new Set(decisions.map((d) => d.id));
  const materialIds = new Set(materials.map((m) => m.id));
  const lessonIds = new Set(lessons.map((l) => l.id));

  const check = (
    where: string,
    ids: string[],
    pool: Set<string>,
    poolName: string,
  ) => {
    for (const id of ids) {
      if (id && !pool.has(id)) fail(`${where} references missing ${poolName} "${id}"`);
    }
  };

  for (const s of spaces) {
    check(`space ${s.id}`, s.domainIds, domainIds, "domain");
    check(`space ${s.id}`, s.materialIds, materialIds, "material");
    check(`space ${s.id}`, s.vendorIds, vendorIds, "vendor");
    check(`space ${s.id}`, s.drawingIds, drawingIds, "drawing");
    check(`space ${s.id}`, s.decisionIds, decisionIds, "decision");
    check(`space ${s.id}`, s.lessonIds, lessonIds, "lesson");
  }
  for (const d of domains) {
    check(`domain ${d.id}`, d.spaceIds, spaceIds, "space");
    check(`domain ${d.id}`, d.drawingIds, drawingIds, "drawing");
    check(`domain ${d.id}`, d.vendorIds, vendorIds, "vendor");
    check(`domain ${d.id}`, d.lessonIds, lessonIds, "lesson");
  }
  for (const dr of drawings) {
    check(`drawing ${dr.id}`, [dr.domainId], domainIds, "domain");
    if (dr.spaceId) check(`drawing ${dr.id}`, [dr.spaceId], spaceIds, "space");
  }
  for (const p of procurement) {
    if (p.spaceId) check(`procurement ${p.id}`, [p.spaceId], spaceIds, "space");
    if (p.vendorId) check(`procurement ${p.id}`, [p.vendorId], vendorIds, "vendor");
  }
  for (const dec of decisions) {
    check(`decision ${dec.id}`, [dec.domainId], domainIds, "domain");
    if (dec.spaceId) check(`decision ${dec.id}`, [dec.spaceId], spaceIds, "space");
  }
  for (const b of boqs) check(`boq ${b.id}`, [b.vendorId], vendorIds, "vendor");
  for (const m of materials) {
    check(`material ${m.id}`, m.spaceIds, spaceIds, "space");
    if (m.vendorId) check(`material ${m.id}`, [m.vendorId], vendorIds, "vendor");
  }
  for (const sn of snags) check(`snag ${sn.id}`, [sn.spaceId], spaceIds, "space");
  for (const w of warranties) check(`warranty ${w.id}`, [w.vendorId], vendorIds, "vendor");
  for (const l of lessons) {
    check(`lesson ${l.id}`, [l.domainId], domainIds, "domain");
    if (l.spaceId) check(`lesson ${l.id}`, [l.spaceId], spaceIds, "space");
  }
  for (const g of gallery) {
    if (g.spaceId) check(`gallery ${g.id}`, [g.spaceId], spaceIds, "space");
    if (g.domainId) check(`gallery ${g.id}`, [g.domainId], domainIds, "domain");
  }
  if (failures === 0) console.log("  ✓ all cross-references resolve");

  // 2b. Tenant boundary -----------------------------------------------------
  // Every entity carries `projectId` (api/migrations/002_project_scope.sql). The
  // repository scopes 1.0 to the singleton project, so anything reaching here must
  // already belong to it — a foreign row means the scoping seam has a hole.
  console.log("\nTenant boundary");
  const projectIds = new Set((await repo.getProjects()).map((p) => p.id));
  const scoped: [string, { id: string; projectId: string }[]][] = [
    ["space", spaces], ["domain", domains], ["drawing", drawings],
    ["vendor", vendors], ["procurement", procurement], ["decision", decisions],
    ["boq", boqs], ["material", materials], ["progress", progress],
    ["snag", snags], ["warranty", warranties], ["lesson", lessons],
    ["gallery", gallery],
  ];
  let tenantIssues = 0;
  for (const [label, rows] of scoped) {
    for (const row of rows) {
      if (!row.projectId) {
        tenantIssues += 1;
        fail(`${label} ${row.id} has no projectId`);
      } else if (!projectIds.has(row.projectId)) {
        tenantIssues += 1;
        fail(`${label} ${row.id} references missing project "${row.projectId}"`);
      } else if (row.projectId !== project.id) {
        tenantIssues += 1;
        fail(
          `${label} ${row.id} belongs to "${row.projectId}" but leaked into the ` +
            `"${project.id}" view — repository scoping is not filtering`,
        );
      }
    }
  }
  if (tenantIssues === 0) {
    console.log(`  ✓ every record is scoped to ${project.id}`);
  }

  // 3. Image paths ----------------------------------------------------------
  console.log("\nImage paths");
  const publicDir = join(process.cwd(), "public");
  const imagePaths = [
    project.heroImage,
    ...spaces.map((s) => s.image),
    ...gallery.map((g) => g.image),
  ].filter((p): p is string => Boolean(p) && p.startsWith("/"));
  let missingImages = 0;
  for (const p of new Set(imagePaths)) {
    if (!existsSync(join(publicDir, p))) {
      missingImages += 1;
      fail(`image not found: ${p}`);
    }
  }
  if (missingImages === 0)
    console.log(`  ✓ all ${new Set(imagePaths).size} referenced images exist`);

  // 4. Sample relation chain ------------------------------------------------
  console.log("\nSample relation chain — master bedroom");
  const master = await repo.getSpaceBySlug("master-bedroom");
  if (!master) {
    fail('could not load space "master-bedroom"');
  } else {
    const dwgs = drawingsByIds(master.drawingIds, drawings);
    const vens = vendorsByIds(master.vendorIds, vendors);
    const decs = decisionsByIds(master.decisionIds, decisions);
    const doms = byIds(master.domainIds, domains);
    console.log(`  ${master.name} [${master.status}]`);
    console.log(`    domains:   ${doms.map((d) => d.name).join(", ")}`);
    console.log(`    drawings:  ${dwgs.map((d) => d.title).join(", ")}`);
    console.log(`    vendors:   ${vens.map((v) => v.name).join(", ")}`);
    console.log(`    decisions: ${decs.map((d) => d.title).join(", ")}`);
    if (!dwgs.length || !vens.length || !decs.length)
      fail("master bedroom relation chain did not fully resolve");
  }

  // Summary -----------------------------------------------------------------
  if (failures > 0) {
    console.error(`\n✗ verify failed with ${failures} issue(s)\n`);
    process.exit(1);
  }
  console.log("\n✓ verify passed — data model and relations are consistent\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
