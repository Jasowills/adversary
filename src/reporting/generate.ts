import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { Report, countBySeverity } from "../evidence/schema.js";

export function verdictFromFindings(findings: Report["findings"]): Report["verdict"] {
  if (findings.critical > 0 || findings.high > 0) return "NOT_READY";
  return "READY";
}

export function buildReport(partial: Omit<Report, "verdict" | "findings"> & { findings: Report["findings"]["items"] }): Report {
  const counts = countBySeverity(partial.findings as any);
  const findings = { ...counts, items: partial.findings };
  let verdict: Report["verdict"] = "READY";
  if (findings.critical > 0 || findings.high > 0) verdict = "NOT_READY";
  else if (partial.baseline?.boot?.status === "fail") verdict = "BLOCKED";
  return {
    ...partial,
    findings,
    verdict,
  } as Report;
}

export function renderHumanReport(report: Report): string {
  const boxTop = "╭─────────────────────────────────────╮";
  const boxBot = "╰─────────────────────────────────────╯";
  const pad = (s: string, n = 37) => s.padEnd(n);
  const scenarios = report.metrics.scenarios ?? 0;
  const assertions = report.metrics.assertions ?? 0;
  const mut = report.metrics.mutations;
  const f = report.findings;
  const lines = [
    boxTop,
    `│           ADVERSARY QA              │`,
    `│                                     │`,
    `│  ${pad(`Scenarios:  ${scenarios}`)}│`,
    `│  ${pad(`Assertions: ${assertions}`)}│`,
    ...(mut ? [`│  ${pad(`Mutations:  ${mut.attempted} (${mut.caught} caught, ${mut.survived} survived)`)}│`] : []),
    `│                                     │`,
    `│  ${pad(`Critical: ${f.critical}`)}│`,
    `│  ${pad(`High:     ${f.high}`)}│`,
    `│  ${pad(`Medium:   ${f.medium}`)}│`,
    `│  ${pad(`Low:      ${f.low}`)}│`,
    `│                                     │`,
    `│  ${pad(`VERDICT: ${report.verdict}`)}│`,
    boxBot,
  ];
  return lines.join("\n");
}

export function renderHtmlReport(report: Report): string {
  const f = report.findings;
  const rows = f.items
    .map(
      (it) => `
      <tr>
        <td><code>${it.id}</code></td>
        <td>${it.severity}</td>
        <td>${it.title}</td>
        <td>${it.mode}</td>
        <td>${it.status}</td>
      </tr>`
    )
    .join("");

  return `<!doctype html>
<html><head><meta charset="utf-8"><title>Adversary Report ${report.run_id}</title>
<style>body{font-family:system-ui,sans-serif;max-width:900px;margin:40px auto;padding:0 16px} table{width:100%;border-collapse:collapse} th,td{border:1px solid #ddd;padding:8px;text-align:left} th{background:#111;color:#fff} .verdict{font-size:1.4em;font-weight:700;padding:12px;border-radius:8px;display:inline-block} .NOT_READY{background:#fee;color:#900} .READY{background:#efe;color:#060} .BLOCKED{background:#ffe8cc;color:#7a3e00} .INCONCLUSIVE{background:#eef;color:#336}</style>
</head><body>
<h1>Adversary QA — ${report.run_id}</h1>
<p><span class="verdict ${report.verdict}">${report.verdict}</span></p>
<p>Scenarios: ${report.metrics.scenarios} · Assertions: ${report.metrics.assertions}${report.metrics.mutations ? ` · Mutations: ${report.metrics.mutations.attempted} (${report.metrics.mutations.caught} caught)` : ""}</p>
<h2>Findings (${f.items.length}) — Critical ${f.critical} · High ${f.high} · Medium ${f.medium} · Low ${f.low}</h2>
<table><thead><tr><th>ID</th><th>Severity</th><th>Title</th><th>Mode</th><th>Status</th></tr></thead><tbody>${rows || `<tr><td colspan="5">No findings</td></tr>`}</tbody></table>
<h2>Baseline</h2><pre>${JSON.stringify(report.baseline, null, 2)}</pre>
<h2>Target</h2><pre>${JSON.stringify(report.target, null, 2)}</pre>
</body></html>`;
}

export function writeReports(resultsDir: string, report: Report) {
  mkdirSync(resultsDir, { recursive: true });
  writeFileSync(join(resultsDir, "report.json"), JSON.stringify(report, null, 2), "utf8");
  writeFileSync(join(resultsDir, "report.html"), renderHtmlReport(report), "utf8");
  writeFileSync(join(resultsDir, "report.txt"), renderHumanReport(report), "utf8");
}
