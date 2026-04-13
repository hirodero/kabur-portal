/**
 * Export FE mock data → kabur-portal-be/mongo-seeds/_fe-export.json
 *
 * Run from kabur-portal-fe root:
 *   node --experimental-strip-types scripts/export-mock-for-mongo.ts
 *
 * Requires Node >= 22.6 (--experimental-strip-types).
 */

import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Dynamic import avoids path-alias resolution problems at script time.
// The TypeScript types (import type {…}) in mock-data.ts are stripped by Node.
const { JOBS, MARKETING_PARTNERS } = await import(
  join(__dirname, "../src/lib/mock-data.ts")
);

const outPath = join(
  __dirname,
  "../../kabur-portal-be/mongo-seeds/_fe-export.json"
);

writeFileSync(outPath, JSON.stringify({ jobs: JOBS, marketingPartners: MARKETING_PARTNERS }, null, 2));

console.log(`Wrote ${JOBS.length} jobs + ${MARKETING_PARTNERS.length} partners → ${outPath}`);
