# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.1] - 2026-09-03

### Added
- `adversary install` / `npx adversary-qa install` — one-liner like `npx impeccable install` (wraps `npx skills add Jasowills/adversary`)

### Fixed
- `package.json` bin path now `dist/cli/index.js` (no `./` prefix) to satisfy `npm pkg fix`
- Renamed npm package to `adversary-qa` (`adversary` taken on npm by james-kanghj/adversary)

## [0.1.0] - 2026-09-02

### Added
- Initial Adversary v0.1 release — **The QA engineer your coding agent can't fool.**
- Agent Skill: `skills/adversary/SKILL.md` with DISCOVER → REPORT workflow
- References: qa-principles, user-testing, browser-testing, api-testing, security-testing, chaos-testing, mutation-testing, evidence
- Engine: discovery (stack + app map), sandbox (Docker/process), evidence (Finding/Report schema), reporting (JSON/HTML/terminal)
- CLI: `adversary init | inspect | run | reproduce | report | clean`
- Vulnerable example app (`examples/vulnerable-app`) with 7 intentional bugs
- Vitest suite: schema, detection, verdict, reporting, sandbox
- GitHub CI, plugin metadata (`.claude-plugin`), npm package setup
- Docs: README, SECURITY, CONTRIBUTING, CODE_OF_CONDUCT

### Known limitations (v0.1)
- Browser testing is scaffolded; full Playwright harness lands in v0.2
- Chaos injection is heuristic (duplicate/event/timeout) — Docker fault injection in v0.2
- Mutation is targeted heuristic — full Stryker integration in v0.2
