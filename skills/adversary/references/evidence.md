# Evidence, Findings & Reporting

## Finding Schema

Every finding must be reproducible and have evidence. No evidence → not a finding.

### IDs

`ADV-0001`, `ADV-0002`, … monotonic per run. Stored as `finding.id`.

### Severity

- **CRITICAL** — data loss, security bypass, payment corruption, unrecoverable state
- **HIGH** — incorrect money/state, IDOR, duplicate side effects, auth bypass
- **MEDIUM** — validation gap, incorrect error handling, survived critical mutant, poor recovery
- **LOW** — noisy logs, minor inconsistency, cosmetic, low-risk mutant survival

### Status

- `REPRODUCED` — deterministic reproduction confirmed
- `INTERMITTENT` — flaky reproduction (needs more evidence)
- `NOT_REPRODUCED` — could not reproduce
- `FIXED` — reproduction no longer fails after fix + retest

### JSON Schema (finding.json)

```json
{
  "id": "ADV-0001",
  "title": "Duplicate order creation under concurrent submission",
  "severity": "HIGH",
  "status": "REPRODUCED",
  "mode": "api",
  "scenario": "Two identical POST /orders submitted concurrently",
  "expected": "Exactly one order should be created",
  "observed": "Two orders were created with different IDs",
  "reproduction": [
    "Login as test user (POST /auth/login)",
    "POST /orders { item: 'widget', qty: 1 } twice concurrently",
    "GET /orders → 2 rows"
  ],
  "evidence": {
    "requests": [{ "method": "POST", "url": "/orders", "status": 201, "body": {} }],
    "responses": [],
    "db": { "query": "SELECT * FROM orders", "rows": [] },
    "logs": "…",
    "screenshots": [],
    "traces": []
  },
  "createdAt": "2026-09-02T00:00:00.000Z"
}
```

Use Zod validation in `src/evidence/schema.ts`.

## Reproducibility

Store per-finding directory:

```
adversary-results/findings/ADV-0001/
├── finding.json
├── reproduction.md
├── logs/
├── screenshots/
├── traces/
└── network/
```

`reproduction.md` must be executable by a human: env, commands, data, expected vs observed.

## Machine Report (report.json)

```json
{
  "run_id": "adv-2026-09-02-abc123",
  "startedAt": "2026-09-02T00:00:00.000Z",
  "finishedAt": "2026-09-02T00:01:00.000Z",
  "target": { "path": ".", "stack": { "framework": "express" } },
  "baseline": {
    "build": { "status": "pass" },
    "existingTests": { "passed": 184, "failed": 0 },
    "boot": { "status": "ok", "latencyMs": 312 }
  },
  "metrics": {
    "scenarios": 2841,
    "assertions": 19284,
    "mutations": { "attempted": 74, "caught": 69, "survived": 5 }
  },
  "findings": {
    "critical": 0, "high": 2, "medium": 7, "low": 4,
    "items": []
  },
  "verdict": "NOT_READY"
}
```

## Human Report

Terminal box + HTML:

```
╭─────────────────────────────────────╮
│           ADVERSARY QA              │
│  User simulation          ✓         │
│  Security                 ✓         │
│  Chaos                    ✓         │
│  Mutation                 ✓         │
│  Browser                  ✓         │
│  API                      ✓         │
│  2,841 scenarios  19,284 assertions │
│  74 mutations                       │
│  Critical: 0  High: 2  Medium: 7    │
│  VERDICT: NOT READY                 │
╰─────────────────────────────────────╯
```

Only display metrics actually produced.

## Verdicts

- `READY` — no unresolved critical/high, required verification completed
- `NOT_READY` — critical/high findings remain
- `BLOCKED` — infra/setup prevented execution
- `INCONCLUSIVE` — insufficient evidence

Do not output arbitrary scores.
