import { describe, it, expect } from "vitest";
import { FindingSchema, nextFindingId, countBySeverity, ReportSchema } from "../src/evidence/schema.js";

describe("finding schema", () => {
  it("validates a finding", () => {
    const f = {
      id: "ADV-0001",
      title: "Test",
      severity: "HIGH",
      status: "REPRODUCED",
      mode: "api",
      scenario: "s",
      expected: "e",
      observed: "o",
      reproduction: ["step"],
      evidence: { requests: [], responses: [], screenshots: [], traces: [] },
      createdAt: new Date().toISOString(),
    };
    expect(FindingSchema.safeParse(f).success).toBe(true);
  });
  it("rejects bad id", () => {
    expect(FindingSchema.safeParse({ id: "BAD", title: "t", severity: "LOW", status: "REPRODUCED", mode: "api", scenario: "s", expected: "e", observed: "o", reproduction: [], evidence: { requests: [], responses: [], screenshots: [], traces: [] }, createdAt: new Date().toISOString() }).success).toBe(false);
  });
  it("nextFindingId increments", () => {
    expect(nextFindingId([])).toBe("ADV-0001");
    expect(nextFindingId([{ id: "ADV-0001" } as any, { id: "ADV-0003" } as any])).toBe("ADV-0004");
  });
  it("countBySeverity", () => {
    const findings = [{ severity: "HIGH" }, { severity: "HIGH" }, { severity: "LOW" }] as any;
    expect(countBySeverity(findings)).toEqual({ critical: 0, high: 2, medium: 0, low: 1 });
  });
});

describe("report schema", () => {
  it("validates minimal report", () => {
    const r = {
      run_id: "adv-1",
      startedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString(),
      target: { path: "." },
      baseline: { build: { status: "pass" } },
      metrics: { scenarios: 1, assertions: 1 },
      findings: { critical: 0, high: 0, medium: 0, low: 0, items: [] },
      verdict: "READY",
    };
    expect(ReportSchema.safeParse(r).success).toBe(true);
  });
});
