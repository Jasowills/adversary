# Adversary

[![skills.sh](https://skills.sh/b/jasowills/adversary)](https://skills.sh/jasowills/adversary) [![npm](https://img.shields.io/npm/v/adversary-qa)](https://www.npmjs.com/package/adversary-qa)

### The QA engineer your coding agent can't fool.

Your agent wrote the code. Wrote the tests. Ran the tests. Everything passed.

So who actually tried to break it?

**Adversary does.**

> Give your coding agent something that fights back.

---

## What this is

Most AI-generated code gets tested by the same agent that wrote it. That's a closed loop — the tests confirm what the agent already believes.

Adversary breaks the loop. It's a skeptical QA skill that inspects your app, guesses how it fails, attacks it in a throwaway sandbox, and comes back with proof.

Not a test generator. A test of your tests.

- **Builds a map** of what your app tries to do (routes, auth, DB, UI)
- **Plans like a QA lead** — payments and auth get more attention than a todo list
- **Attacks like a user** — double submits, stale pages, expired sessions, concurrent requests, bad auth
- **Proves it** — every finding has a reproduction, request traces, DB snapshots, and logs

If it says `READY`, it has evidence. If it says `NOT_READY`, it can show you why.

Adversary doesn't replace human QA. It just does the annoying, adversarial parts a good human would do, automatically.

---

## Install

**Skill (Claude Code, Cursor, Copilot, OpenCode, 70+ agents):**

```bash
npx skills add jasowills/adversary
# pick agents interactively, or:
npx skills add jasowills/adversary -a claude-code -a opencode -y
npx skills add jasowills/adversary -g -y  # global
```

One-liner alias (same thing):

```bash
npx adversary-qa install
npx adversary-qa install -g -y -a claude-code
```

**CLI:**

```bash
npx adversary-qa run ./your-app
# after install, both work:
# adversary run ./your-app
# adversary-qa run ./your-app
```

Inside any supported agent, run:

```
/adversary full       # auto-picks modes for this stack
/adversary api        # API boundaries
/adversary security   # auth, IDOR, rate limits
/adversary mutation   # do your tests catch tiny bugs?
```

---

## Try it in 60 seconds

```bash
git clone https://github.com/Jasowills/adversary
cd adversary
npm install && npm run build && npm test

# Hit the deliberately broken demo
npx adversary-qa run ./examples/vulnerable-app

# Reports
cat ./examples/vulnerable-app/adversary-results/report.json
open ./examples/vulnerable-app/adversary-results/report.html
```

You'll get:

```
╭─────────────────────────────────────╮
│           ADVERSARY QA              │
│  Scenarios:  15  Assertions: 35     │
│  Mutations:  2 (1 caught, 1 survived) │
│  Critical: 0  High: 2  Medium: 2  Low: 0 │
│  VERDICT: NOT_READY                 │
╰─────────────────────────────────────╯
```

Real findings from that demo:

- **ADV-0001 HIGH** — two concurrent `POST /api/orders` creates two orders (no idempotency)
- **ADV-0002 HIGH** — `GET /api/orders/:id` returns 200 without any auth check
- **ADV-0003 MEDIUM** — malformed JSON leaks a stack trace
- **ADV-0004 MEDIUM** — mutant `qty > 0 → qty >= 0` survives (zero-qty order has no test)

Each lives under `adversary-results/findings/ADV-0001/{finding.json,reproduction.md,logs}` so you can rerun it.

```bash
npx adversary-qa reproduce ADV-0001 ./examples/vulnerable-app
```

---

## How it works

```
DISCOVER → UNDERSTAND → PLAN → SANDBOX → BASELINE → ATTACK → OBSERVE → REPRODUCE → REPORT
```

| Step | What happens |
|---|---|
| Discover | Reads your README, manifests, routes, DB schemas, auth, Docker, tests |
| Understand | Sorts behavior into `KNOWN / INFERRED / ASSUMPTION / UNKNOWN` — never pretends a guess is a requirement |
| Plan | Risk-based — auth and payments get hammered, a utils lib gets a light pass |
| Sandbox | Starts your app on a random port (or Docker if you have compose) and isolates it |
| Baseline | Builds, boots, hits `/health`, records existing test health |
| Attack | Runs user sequences, API edge cases, security checks, a little chaos, a few mutants |
| Observe | Saves requests, responses, DB rows, logs, screenshots |
| Report | `READY / NOT_READY / BLOCKED / INCONCLUSIVE` — only from actual evidence |

Principle: AI proposes hypotheses, tools execute, evidence decides.

---

## CLI

```bash
adversary inspect [path]          # stack + app map
adversary run [path] --mode full  # full | api | browser | security | chaos | mutation | user
adversary reproduce ADV-0001 [path]
adversary report [path]
adversary clean [path]
```

---

## Architecture

```
skills/adversary/SKILL.md + references/   # the skill your agent reads
src/{discovery,sandbox,evidence,reporting,core,cli}  # the engine (TypeScript + Zod)
examples/vulnerable-app                    # 7 intentional bugs, proof the engine works
tests/                                   # vitest
```

No giant framework. Just a small engine that can be called from a skill, a CLI, or CI.

---

## Roadmap

- **0.1** — Skill, sandbox, API/security/mutation basics, evidence, reports, demo ✓
- **0.2** — Real Playwright browser harness, Docker chaos, Stryker mutation, GitHub Action with PR comments
- **0.3** — Multi-agent checks, QA memory, fix/retest loop
- **0.4** — Benchmarks for coding agents
- **1.0** — Lab-grade autonomous QA

---

## Contributing

See `CONTRIBUTING.md`. PRs should include evidence — what broke, how you reproduced it.

## License

MIT — `LICENSE`

## Security

Found a bug in Adversary itself? Don't open a public issue. Email `jasowills01@gmail.com` or use GitHub Security Advisories. The `examples/vulnerable-app` is intentionally broken — don't report those.

---

*If it says READY, it can prove it. If it says NOT_READY, it will show you exactly where.*
