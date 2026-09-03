# Adversary

### The QA engineer your coding agent can't fool.

Your AI agent wrote the code.

Your AI agent wrote the tests.

Your AI agent ran the tests.

Everything passed.

**So who tried to break it?**

**Adversary.**

---

> Adversarial QA for AI-generated software. Give your coding agent something that fights back.

```
AI agents made software generation autonomous.
Adversary makes software verification autonomous.
```

Adversary is not another test generator. It is an **adversarial QA skill** that behaves like a skeptical senior QA engineer — inspecting your app, hypothesizing how it fails, attacking it in a disposable sandbox, and bringing back evidence.

```
Your coding agent builds it.
Adversary attacks it.
The sandbox contains it.
Evidence proves what happened.
```

---

## Why

AI has a blind spot: **it trusts itself.**

```
Agent writes code
  → Agent writes tests
  → Agent runs tests
  → Tests pass
  → Agent declares success

Who tried to double-submit, replay, race, or bypass auth?
```

Adversary separates **creation from verification**.

Adversary does not claim to replace human QA. It operationalizes what makes human QA valuable: skepticism, exploratory sequences, stateful workflows, adversarial thinking, failure injection, evidence collection, and reproduction.

---

## Install

### Agent Skill (Claude Code / OpenCode / Copilot)

Copy the skill into your project or install as a plugin:

```bash
# Claude Code — local plugin
git clone https://github.com/Jasowills/adversary
# in Claude Code: /plugin add ./adversary  or  claude --plugin-dir ./adversary
```

Then invoke:

```
/adversary full
/adversary api
/adversary security
/adversary mutation
```

### CLI (npx)

```bash
npx adversary-qa run ./examples/vulnerable-app
# also available as `adversary` after install:
# npx adversary run ./examples/vulnerable-app
# or after clone
npm install && npm run build
node dist/cli/index.js run ./examples/vulnerable-app
```

---

## Quick start

```bash
git clone https://github.com/Jasowills/adversary
cd adversary
npm install
npm run build
npm test

# Attack the deliberately vulnerable demo
node dist/cli/index.js run ./examples/vulnerable-app

# Inspect reports
cat ./examples/vulnerable-app/adversary-results/report.json
open ./examples/vulnerable-app/adversary-results/report.html
cat ./examples/vulnerable-app/adversary-results/report.txt
```

## Example output

```
  ADVERSARY v0.1 — attacking ./examples/vulnerable-app
  mode=full  results=./examples/vulnerable-app/adversary-results

╭─────────────────────────────────────╮
│           ADVERSARY QA              │
│                                     │
│  Scenarios:  15                      │
│  Assertions: 35                      │
│  Mutations:  2 (1 caught, 1 survived)│
│                                     │
│  Critical: 0                         │
│  High:     2                         │
│  Medium:   2                         │
│  Low:      0                         │
│                                     │
│  VERDICT: NOT READY                  │
╰─────────────────────────────────────╯
```

Findings (real, evidence-backed):

- **ADV-0001 HIGH** — Duplicate order creation under concurrent POST (idempotency missing)
- **ADV-0002 HIGH** — IDOR — `GET /api/orders/:id` returns 200 without auth
- **ADV-0003 MEDIUM** — Stack trace leak on malformed JSON
- **ADV-0004 MEDIUM** — Survived mutant `qty > 0 → qty >= 0` (zero-qty blind spot)

Each finding includes `finding.json`, `reproduction.md`, traces and logs under `adversary-results/findings/ADV-xxxx/`.

Machine report: `report.json` · Human report: `report.txt` · HTML: `report.html`

---

## How it works

```
DISCOVER → UNDERSTAND → PLAN → CREATE SANDBOX → BASELINE → ATTACK → OBSERVE → REPRODUCE → REPORT → (FIX → RETEST)
```

| Stage | What happens |
|---|---|
| **Discover** | Reads README, package manifests, routes, DB schemas, auth, Docker, tests, frontend pages |
| **Understand** | Separates `KNOWN / INFERRED / ASSUMPTION / UNKNOWN` — never silently promotes guesses |
| **Plan** | Risk-based strategy for *this* app (payments ≠ todo list) |
| **Sandbox** | Disposable Docker/process isolation (`create → start → reset → execute → collect → destroy`) |
| **Baseline** | Build, boot, health check, existing tests — recorded separately |
| **Attack** | User sequences, API boundaries, security checks, chaos, mutation |
| **Observe** | Collect request traces, DB snapshots, logs, screenshots |
| **Reproduce** | `ADV-0001` with deterministic steps |
| **Report** | `READY / NOT_READY / BLOCKED / INCONCLUSIVE` + evidence |

```
                     ADVERSARY
                         |
          +--------------+--------------+
          |              |              |
      Agent Skill       CLI          Sandbox
          |              |              |
      Claude/OpenCode   npx       Docker/Browser
          |              |              |
          +--------------+--------------+
                         |
                   QA Engine
                         |
          +--------------+--------------+
          |              |              |
        User           API          Security
       Testing        Testing        Testing
          |              |              |
          +--------------+--------------+
                         |
                  Evidence Engine
                         |
                  Findings / Reports
                         |
             GitHub / CI / Developer
```

---

## CLI

```bash
adversary init [path]              # no config needed for v0.1
adversary inspect [path]           # show stack + app map
adversary run [path] --mode full   # full | api | browser | security | chaos | mutation | user
adversary reproduce ADV-0001 [path]
adversary report [path]
adversary clean [path]
```

---

## Architecture

```
adversary/
├── skills/adversary/
│   ├── SKILL.md
│   ├── references/   qa-principles, user/browser/api/security/chaos/mutation/evidence
│   └── scripts/      detect-stack, collect-results, generate-report
├── src/
│   ├── discovery/    stack detection + app map
│   ├── sandbox/      Docker/process isolation
│   ├── evidence/     Finding schema (Zod) + store
│   ├── reporting/    verdict + JSON/HTML/terminal
│   ├── core/         run orchestrator + verdict
│   └── cli/          commander CLI
├── examples/vulnerable-app  7 intentional bugs
├── tests/            vitest
└── .github/workflows ci + release
```

Key principle:

```
AI = hypothesis + reasoning
Tools = execution (pytest, vitest, curl, Playwright, docker)
Evidence = ground truth
AI = interpretation
```

Never claim a test passed without executing it.

---

## Vulnerable demo

`examples/vulnerable-app` is a tiny Express app with 7 intentional bugs (see its README). Adversary finds 3-4 on every run — proof the engine is real.

```bash
node dist/cli/index.js run ./examples/vulnerable-app --mode api
node dist/cli/index.js reproduce ADV-0001 ./examples/vulnerable-app
```

---

## Roadmap

- **v0.1** — Agent Skill, sandbox, API/security/mutation basics, evidence, reports, vulnerable demo ✓
- **v0.2** — Full Playwright browser harness, Docker chaos injection, Stryker mutation, finding replay, GitHub Action
- **v0.3** — Multi-agent verification, persistent QA memory, regression corpus, auto fix/retest loop
- **v0.4** — Benchmark coding agents (survival rates), public QA benchmark
- **v1.0** — Production-grade autonomous QA laboratory

---

## Publishing & distribution (maintainers)

We do **not** publish automatically. Prepare, then publish deliberately:

```bash
# 1. GitHub
gh repo create Jasowills/adversary --public --source=. --remote=origin
git push -u origin main

# 2. Test Claude plugin
claude --plugin-dir .   # then /adversary

# 3. npm — inspect first
npm pack --dry-run
npm publish --access public   # requires NPM_TOKEN

# 4. Release
git tag v0.1.0 && git push origin v0.1.0
gh release create v0.1.0 --notes-file CHANGELOG.md

# 5. Marketplace
# .claude-plugin/marketplace.json already points at this repo
```

Requires credentials: `NPM_TOKEN`, GitHub repo creation, marketplace review.

---

## Contributing

See `CONTRIBUTING.md`. Keep PRs evidence-driven.

## License

MIT — see `LICENSE`.

## Security

See `SECURITY.md`. Report vulnerabilities in Adversary itself privately via GitHub Security Advisories.

---

*Adversary makes one promise: if it says READY, it has evidence. If it says NOT_READY, it can prove why.*
