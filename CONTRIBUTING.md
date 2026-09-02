# Contributing to Adversary

Thanks for helping make verification autonomous.

## Quick start

```bash
git clone https://github.com/adversary-ai/adversary
cd adversary
npm install
npm run build
npm test
```

Run against the vulnerable demo:

```bash
node dist/cli/index.js run ./examples/vulnerable-app
cat ./examples/vulnerable-app/adversary-results/report.json
```

## Project structure

```
skills/adversary/   Agent Skill + references
src/
  sandbox/          Docker/process isolation
  discovery/        Stack detection + app map
  evidence/         Finding schema + store
  reporting/        Verdict + human/HTML reports
  cli/              `npx adversary` commands
examples/vulnerable-app  Intentionally buggy demo
tests/              Vitest suite
```

## Development

- `npm run build` — compile TS to `dist/`
- `npm run typecheck` — `tsc --noEmit`
- `npm test` — vitest
- `node dist/cli/index.js inspect .` — test discovery

Keep PRs small, evidence-driven, and add tests for engine changes.

## Adding a new attack mode

1. Add a reference in `skills/adversary/references/`
2. Implement in `src/core/run.ts` (or new module under `src/`)
3. Emit `Finding` via `nextFindingId` + `FindingSchema`
4. Add a test + verify against `examples/vulnerable-app`

## Commit & PR

- Conventional commits preferred: `feat:`, `fix:`, `docs:`, `chore:`
- PR template will ask for: problem, evidence, tests, risk.

## License

MIT — see `LICENSE`.
