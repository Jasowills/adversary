import { describe, it, expect } from "vitest";
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { detectStack } from "../src/discovery/detect.js";

function tempProject(files: Record<string, string>) {
  const dir = mkdtempSync(join(tmpdir(), "adv-detect-"));
  for (const [p, content] of Object.entries(files)) {
    const full = join(dir, p);
    const parts = full.split("/").slice(0, -1).join("/");
    mkdirSync(parts, { recursive: true });
    writeFileSync(full, content);
  }
  return dir;
}

describe("detectStack", () => {
  it("detects express", () => {
    const dir = tempProject({ "package.json": JSON.stringify({ dependencies: { express: "^4" } }) });
    const s = detectStack(dir);
    expect(s.framework).toBe("express");
    rmSync(dir, { recursive: true, force: true });
  });
  it("detects nextjs", () => {
    const dir = tempProject({ "package.json": JSON.stringify({ dependencies: { next: "14.0.0" } }) });
    expect(detectStack(dir).framework).toBe("nextjs");
    rmSync(dir, { recursive: true, force: true });
  });
  it("detects docker compose", () => {
    const dir = tempProject({ "docker-compose.yml": "services: {}", "package.json": "{}" });
    expect(detectStack(dir).hasCompose).toBe(true);
    rmSync(dir, { recursive: true, force: true });
  });
  it("handles missing package.json", () => {
    const dir = tempProject({});
    const s = detectStack(dir);
    expect(s.framework).toBeUndefined();
    rmSync(dir, { recursive: true, force: true });
  });
});
