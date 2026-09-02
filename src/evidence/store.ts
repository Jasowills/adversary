import { mkdirSync, writeFileSync, existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { Finding, FindingSchema } from "./schema.js";

export class FindingStore {
  constructor(private resultsDir: string) {}

  ensure() {
    mkdirSync(join(this.resultsDir, "findings"), { recursive: true });
  }

  save(finding: Finding) {
    FindingSchema.parse(finding);
    this.ensure();
    const dir = join(this.resultsDir, "findings", finding.id);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "finding.json"), JSON.stringify(finding, null, 2), "utf8");
    writeFileSync(
      join(dir, "reproduction.md"),
      `# ${finding.id}: ${finding.title}\n\nSeverity: ${finding.severity}\nStatus: ${finding.status}\nMode: ${finding.mode}\n\n## Scenario\n${finding.scenario}\n\n## Expected\n${finding.expected}\n\n## Observed\n${finding.observed}\n\n## Reproduction\n${finding.reproduction.map((s, i) => `${i + 1}. ${s}`).join("\n")}\n\n## Evidence\n\n\`\`\`json\n${JSON.stringify(finding.evidence, null, 2)}\n\`\`\`\n`,
      "utf8"
    );
    return dir;
  }

  loadAll(): Finding[] {
    const findingsDir = join(this.resultsDir, "findings");
    if (!existsSync(findingsDir)) return [];
    const entries = readdirSync(findingsDir, { withFileTypes: true }).filter((d) => d.isDirectory());
    const out: Finding[] = [];
    for (const e of entries) {
      const p = join(findingsDir, e.name, "finding.json");
      if (existsSync(p)) {
        const raw = JSON.parse(readFileSync(p, "utf8"));
        const parsed = FindingSchema.safeParse(raw);
        if (parsed.success) out.push(parsed.data);
      }
    }
    return out.sort((a, b) => a.id.localeCompare(b.id));
  }
}
