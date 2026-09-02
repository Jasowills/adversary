#!/usr/bin/env node
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const resultsDir = process.argv[2] ?? "./adversary-results";
const reportPath = join(resultsDir, "report.json");
if (!existsSync(reportPath)) {
  console.error(`No report at ${reportPath}`);
  process.exit(1);
}
const report = JSON.parse(readFileSync(reportPath, "utf8"));
// Re-render HTML/TXT via node if dist exists, else simple text
console.log(`Report ${report.run_id} — ${report.verdict}`);
console.log(`Scenarios: ${report.metrics.scenarios} Assertions: ${report.metrics.assertions}`);
console.log(`Findings: C${report.findings.critical} H${report.findings.high} M${report.findings.medium} L${report.findings.low}`);
