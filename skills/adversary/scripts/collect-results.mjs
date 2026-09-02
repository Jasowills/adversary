#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const resultsDir = process.argv[2] ?? "./adversary-results";
if (!existsSync(join(resultsDir, "report.json"))) {
  console.error(`No report.json in ${resultsDir}`);
  process.exit(1);
}
const report = JSON.parse(readFileSync(join(resultsDir, "report.json"), "utf8"));
console.log(`Run: ${report.run_id} Verdict: ${report.verdict} Findings: ${report.findings.items.length}`);
const findingsDir = join(resultsDir, "findings");
if (existsSync(findingsDir)) {
  const ids = readdirSync(findingsDir);
  console.log(`Findings dirs: ${ids.join(", ")}`);
}
