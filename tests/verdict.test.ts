import { describe, it, expect } from "vitest";
import { calculateVerdict } from "../src/core/verdict.js";

describe("verdict", () => {
  it("READY when no high/critical", () => {
    expect(calculateVerdict([], false, false)).toBe("READY");
    expect(calculateVerdict([{ severity: "MEDIUM" } as any], false, false)).toBe("READY");
  });
  it("NOT_READY on HIGH", () => {
    expect(calculateVerdict([{ severity: "HIGH" } as any], false, false)).toBe("NOT_READY");
  });
  it("BLOCKED overrides", () => {
    expect(calculateVerdict([{ severity: "HIGH" } as any], true, false)).toBe("BLOCKED");
  });
  it("INCONCLUSIVE", () => {
    expect(calculateVerdict([], false, true)).toBe("INCONCLUSIVE");
  });
});
