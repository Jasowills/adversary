import { describe, it, expect } from "vitest";
import { createSandbox } from "../src/sandbox/index.js";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

describe("sandbox", () => {
  it("creates sandbox with baseUrl", () => {
    const dir = mkdtempSync(join(tmpdir(), "adv-sandbox-"));
    const s = createSandbox({ projectPath: dir, port: 4321, useDocker: false });
    expect(s.baseUrl).toBe("http://127.0.0.1:4321");
    expect(s.mode).toBeDefined();
    rmSync(dir, { recursive: true, force: true });
  });
  it("healthCheck returns fail when nothing listening", async () => {
    const dir = mkdtempSync(join(tmpdir(), "adv-sandbox-"));
    const s = createSandbox({ projectPath: dir, port: 54321, useDocker: false });
    const h = await s.healthCheck("/");
    expect(h.ok).toBe(false);
    rmSync(dir, { recursive: true, force: true });
  });
});
