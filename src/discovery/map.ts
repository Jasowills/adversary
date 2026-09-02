import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { detectStack, StackInfo } from "./detect.js";

export type AppMap = {
  stack: StackInfo;
  knownRequirements: string[];
  inferredRequirements: string[];
  assumptions: string[];
  unknownBehavior: string[];
  areas: string[];
};

export function buildAppMap(projectPath: string): AppMap {
  const stack = detectStack(projectPath);
  const known: string[] = [];
  const inferred: string[] = [];
  const assumptions: string[] = [];
  const unknown: string[] = [];
  const areas = new Set<string>();

  // README
  const readmePath = ["README.md", "readme.md", "Readme.md"].map((f) => join(projectPath, f)).find((p) => existsSync(p));
  if (readmePath) {
    const readme = readFileSync(readmePath, "utf8").slice(0, 4000);
    known.push(`README present (${readmePath})`);
    if (/auth/i.test(readme)) areas.add("Authentication");
    if (/payment|order|checkout/i.test(readme)) areas.add("Payments/Orders");
    if (/api/i.test(readme)) areas.add("API");
  } else {
    unknown.push("No README — intended behavior undocumented");
  }

  // package manifests
  if (stack.framework) inferred.push(`Framework: ${stack.framework}`);
  if (stack.database) inferred.push(`Database: ${stack.database}`);
  if (stack.hasDocker) inferred.push("Docker present");
  if (stack.hasCompose) inferred.push("Docker Compose present");

  // existing tests
  const testFiles = findTestFiles(projectPath);
  if (testFiles.length > 0) {
    inferred.push(`${testFiles.length} test file(s) found — inferred coverage signal`);
    areas.add("Existing tests");
  } else {
    assumptions.push("No existing tests found — testing blind spot likely");
  }

  // API routes
  if (stack.apiRoutes.length > 0) {
    areas.add("API");
    inferred.push(`API routes: ${stack.apiRoutes.slice(0, 5).join(", ")}`);
  } else if (stack.framework && ["express", "fastify", "nestjs", "nextjs"].includes(stack.framework)) {
    unknown.push("API framework detected but no conventional route dir found — routes may be elsewhere");
  }

  if (stack.frontend) {
    areas.add("Frontend");
    inferred.push("Frontend entry points detected");
  }

  // Auth heuristic
  const authHint = grepHeuristic(projectPath, ["auth", "login", "session", "jwt", "passport"]);
  if (authHint) {
    areas.add("Authentication");
    inferred.push(`Auth artifacts hint: ${authHint}`);
  } else {
    assumptions.push("No obvious auth artifacts — verify if app is intentionally unauthenticated");
  }

  // DB heuristic
  if (stack.database) areas.add("Database");
  else assumptions.push("No DB config detected — may be in-memory or external");

  // generic unknowns
  unknown.push("External integrations: not enumerated without deeper code scan");
  unknown.push("Background jobs/queues: unknown without code scan");
  assumptions.push("Happy-path tests may not cover concurrent / adversarial sequences");

  // default areas
  if (areas.size === 0) areas.add("Application");

  return {
    stack,
    knownRequirements: known,
    inferredRequirements: inferred,
    assumptions,
    unknownBehavior: unknown,
    areas: [...areas],
  };
}

function findTestFiles(root: string): string[] {
  const out: string[] = [];
  const queue = [root];
  const ignore = new Set(["node_modules", "dist", ".git", "coverage", "adversary-results"]);
  while (queue.length) {
    const dir = queue.pop()!;
    let entries: string[] = [];
    try { entries = readdirSync(dir); } catch { continue; }
    for (const e of entries) {
      if (ignore.has(e)) continue;
      const full = join(dir, e);
      if (e.match(/\.test\.(ts|js|py)$/) || e.match(/\.spec\.(ts|js)$/) || e === "__tests__") {
        out.push(full);
      }
      try {
        const stat = readdirSync(full);
        // if directory, push
        if (stat) {
          // naive check: if we could read dir, it's a dir
          const isDir = (() => { try { readdirSync(full); return true; } catch { return false; }})();
          if (isDir && !e.includes(".")) queue.push(full);
        }
      } catch {}
    }
    if (out.length > 30) break;
  }
  return out;
}

function grepHeuristic(root: string, keywords: string[]): string | null {
  // lightweight: check top-level src files for keyword
  const candidates = ["src", "."];
  for (const c of candidates) {
    const dir = join(root, c);
    if (!existsSync(dir)) continue;
    try {
      const files = readdirSync(dir).slice(0, 30);
      for (const f of files) {
        if (keywords.some((k) => f.toLowerCase().includes(k))) return f;
      }
    } catch {}
  }
  return null;
}
