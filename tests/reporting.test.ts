import { describe, it, expect } from "vitest";
import { buildReport, renderHumanReport } from "../src/reporting/generate.js";

describe("reporting", () => {
  it("builds verdict NOT_READY on high", () => {
    const r = buildReport({
      run_id: "adv-1",
      startedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString(),
      target: { path: "." },
      baseline: { build: { status: "pass" }, boot: { status: "ok" } },
      metrics: { scenarios: 10, assertions: 20 },
      findings: [{ id: "ADV-0001", title: "t", severity: "HIGH", status: "REPRODUCED", mode: "api", scenario: "s", expected: "e", observed: "o", reproduction: ["a"], evidence: { requests: [], responses: [], screenshots: [], traces: [] }, createdAt: new Date().toISOString() }] as any,
    } as any);
    expect(r.verdict).toBe("NOT_READY");
    expect(r.findings.high).toBe(1);
    const txt = renderHumanReport(r);
    expect(txt).toContain("VERDICT: NOT_READY");
  });
  it("READY when no blockers", () => {
    const r = buildReport({
      run_id: "adv-2",
      startedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString(),
      target: { path: "." },
      baseline: { build: { status: "pass" } },
      metrics: { scenarios: 1, assertions: 1 },
      findings: [] as any,
    } as any);
    expect(r.verdict).toBe("READY");
  });
});
