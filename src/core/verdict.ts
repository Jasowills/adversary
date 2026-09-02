import type { Finding } from "../evidence/schema.js";

export type Verdict = "READY" | "NOT_READY" | "BLOCKED" | "INCONCLUSIVE";

export function calculateVerdict(findings: Finding[], blocked: boolean, inconclusive: boolean): Verdict {
  if (blocked) return "BLOCKED";
  if (inconclusive) return "INCONCLUSIVE";
  const hasBlocking = findings.some((f) => f.severity === "CRITICAL" || f.severity === "HIGH");
  if (hasBlocking) return "NOT_READY";
  return "READY";
}
