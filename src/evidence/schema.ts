import { z } from "zod";

export const SeveritySchema = z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]);
export type Severity = z.infer<typeof SeveritySchema>;

export const FindingStatusSchema = z.enum([
  "REPRODUCED",
  "INTERMITTENT",
  "NOT_REPRODUCED",
  "FIXED",
]);
export type FindingStatus = z.infer<typeof FindingStatusSchema>;

export const FindingModeSchema = z.enum([
  "api",
  "browser",
  "security",
  "chaos",
  "mutation",
  "user",
  "baseline",
]);
export type FindingMode = z.infer<typeof FindingModeSchema>;

export const EvidenceSchema = z.object({
  requests: z.array(
    z.object({
      method: z.string(),
      url: z.string(),
      status: z.number().optional(),
      headers: z.record(z.string()).optional(),
      body: z.unknown().optional(),
      durationMs: z.number().optional(),
    })
  ).default([]),
  responses: z.array(z.unknown()).default([]).optional(),
  db: z.unknown().optional(),
  logs: z.string().optional(),
  screenshots: z.array(z.string()).default([]).optional(),
  traces: z.array(z.string()).default([]).optional(),
});

export const FindingSchema = z.object({
  id: z.string().regex(/^ADV-\d{4}$/),
  title: z.string().min(3),
  severity: SeveritySchema,
  status: FindingStatusSchema,
  mode: FindingModeSchema,
  scenario: z.string(),
  expected: z.string(),
  observed: z.string(),
  reproduction: z.array(z.string()),
  evidence: EvidenceSchema,
  createdAt: z.string(),
});

export type Finding = z.infer<typeof FindingSchema>;
export type Evidence = z.infer<typeof EvidenceSchema>;

export const ReportSchema = z.object({
  run_id: z.string(),
  startedAt: z.string(),
  finishedAt: z.string(),
  target: z.object({
    path: z.string(),
    stack: z.record(z.unknown()).optional(),
  }),
  baseline: z.object({
    build: z.object({ status: z.enum(["pass", "fail", "skipped"]), logs: z.string().optional() }),
    existingTests: z.object({ passed: z.number(), failed: z.number(), skipped: z.number().optional() }).optional(),
    boot: z.object({ status: z.enum(["ok", "fail", "skipped"]), latencyMs: z.number().optional(), logs: z.string().optional() }).optional(),
    lint: z.object({ status: z.enum(["pass", "fail", "skipped"]) }).optional(),
    typecheck: z.object({ status: z.enum(["pass", "fail", "skipped"]) }).optional(),
  }),
  metrics: z.object({
    scenarios: z.number(),
    assertions: z.number(),
    mutations: z.object({
      attempted: z.number(),
      caught: z.number(),
      survived: z.number(),
      details: z.array(z.unknown()).optional(),
    }).optional(),
  }),
  findings: z.object({
    critical: z.number(),
    high: z.number(),
    medium: z.number(),
    low: z.number(),
    items: z.array(FindingSchema),
  }),
  verdict: z.enum(["READY", "NOT_READY", "BLOCKED", "INCONCLUSIVE"]),
});

export type Report = z.infer<typeof ReportSchema>;

export function nextFindingId(existing: Finding[]): string {
  const max = existing.reduce((m, f) => {
    const n = parseInt(f.id.slice(4), 10);
    return n > m ? n : m;
  }, 0);
  return `ADV-${String(max + 1).padStart(4, "0")}`;
}

export function countBySeverity(findings: Finding[]) {
  return {
    critical: findings.filter((f) => f.severity === "CRITICAL").length,
    high: findings.filter((f) => f.severity === "HIGH").length,
    medium: findings.filter((f) => f.severity === "MEDIUM").length,
    low: findings.filter((f) => f.severity === "LOW").length,
  };
}
