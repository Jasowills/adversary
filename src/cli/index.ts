#!/usr/bin/env node
import { Command } from "commander";
import { existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { detectStack } from "../discovery/detect.js";
import { buildAppMap } from "../discovery/map.js";
import { runAdversary } from "../core/run.js";
import { FindingStore } from "../evidence/store.js";

const program = new Command();

program.name("adversary").description("Adversarial QA for AI-generated software").version("0.1.0");

program
  .command("inspect")
  .description("Discover stack and build application map")
  .argument("[path]", "project path", ".")
  .action((p) => {
    const projectPath = resolve(p);
    const stack = detectStack(projectPath);
    const map = buildAppMap(projectPath);
    console.log(JSON.stringify({ stack, map }, null, 2));
  });

program
  .command("init")
  .description("Initialize adversary config in project")
  .argument("[path]", "project path", ".")
  .action((p) => {
    console.log(`Adversary init — no config file required for v0.1. Target: ${resolve(p)}`);
    console.log("Run: npx adversary run [path]");
  });

program
  .command("run")
  .description("Run adversarial QA")
  .argument("[path]", "project path", ".")
  .option("--mode <mode>", "mode: full|api|browser|security|chaos|mutation|user", "full")
  .option("--port <port>", "port for sandbox app", "")
  .option("--results <dir>", "results directory", "")
  .action(async (p, opts) => {
    const projectPath = resolve(p);
    if (!existsSync(projectPath)) {
      console.error(`Path not found: ${projectPath}`);
      process.exit(1);
    }
    const resultsDir = opts.results ? resolve(opts.results) : join(projectPath, "adversary-results");
    const port = opts.port ? parseInt(opts.port, 10) : undefined;
    console.log(`\n  ADVERSARY v0.1 — attacking ${projectPath}\n  mode=${opts.mode}  results=${resultsDir}\n`);
    const { report, human } = await runAdversary({
      projectPath,
      resultsDir,
      mode: opts.mode,
      port,
    });
    console.log(human);
    console.log(`\n  Reports: ${resultsDir}/report.json  ${resultsDir}/report.html\n`);
    const criticalHigh = report.findings.critical + report.findings.high;
    if (report.verdict === "NOT_READY" || criticalHigh > 0) process.exitCode = 1;
  });

program
  .command("reproduce")
  .description("Reproduce a finding by ID")
  .argument("<id>", "finding ID e.g. ADV-0001")
  .argument("[path]", "project path", ".")
  .action((id, p) => {
    const projectPath = resolve(p);
    const resultsDir = join(projectPath, "adversary-results");
    const store = new FindingStore(resultsDir);
    const findings = store.loadAll();
    const f = findings.find((x) => x.id === id);
    if (!f) {
      console.error(`Finding ${id} not found in ${resultsDir}`);
      process.exit(1);
    }
    console.log(`\n${f.id}: ${f.title} [${f.severity}] ${f.status}\n`);
    console.log(`Scenario: ${f.scenario}\nExpected: ${f.expected}\nObserved: ${f.observed}\n`);
    console.log("Reproduction:");
    f.reproduction.forEach((s, i) => console.log(`  ${i + 1}. ${s}`));
    console.log(`\nEvidence: ${JSON.stringify(f.evidence, null, 2)}\n`);
  });

program
  .command("report")
  .description("Show last report")
  .argument("[path]", "project path", ".")
  .action(async (p) => {
    const projectPath = resolve(p);
    const { readFileSync } = await import("node:fs");
    const reportPath = join(projectPath, "adversary-results", "report.json");
    if (!existsSync(reportPath)) {
      console.error(`No report at ${reportPath}. Run: npx adversary run`);
      process.exit(1);
    }
    const report = JSON.parse(readFileSync(reportPath, "utf8"));
    const { renderHumanReport } = await import("../reporting/generate.js");
    console.log(renderHumanReport(report));
    console.log(`\nFull: ${reportPath}`);
  });

program
  .command("clean")
  .description("Remove adversary results and stop sandbox")
  .argument("[path]", "project path", ".")
  .action(async (p) => {
    const { rmSync } = await import("node:fs");
    const projectPath = resolve(p);
    const resultsDir = join(projectPath, "adversary-results");
    rmSync(resultsDir, { recursive: true, force: true });
    console.log(`Cleaned ${resultsDir}`);
    // try docker compose down if applicable
    const { spawn } = await import("node:child_process");
    const cwd = projectPath;
    const hasCompose = existsSync(join(cwd, "docker-compose.yml")) || existsSync(join(cwd, "compose.yaml"));
    if (hasCompose) {
      const proc = spawn("docker", ["compose", "down", "-v"], { cwd, stdio: "inherit" });
      await new Promise((res) => proc.on("close", res));
    }
  });

program.parse();
