# Security Policy

## Reporting a Vulnerability

Adversary is a defensive QA tool — it tests your application's security boundaries in a sandbox.

If you find a security vulnerability **in Adversary itself** (not in an app it tests), please report it responsibly:

1. **Do not** open a public issue.
2. Email: `security@adversary.dev` (or open a private security advisory on GitHub: `Security → Report a vulnerability`).
3. Include: description, reproduction, impact, and suggested fix if known.

We aim to acknowledge within 48 hours and release a fix within 14 days for critical issues.

## Scope

- `src/`, `skills/adversary/`, CLI, sandbox, reporting engine
- Example vulnerable app (`examples/vulnerable-app`) is intentionally vulnerable — do not report its bugs as Adversary vulnerabilities.

## Safe Harbor

We will not pursue legal action for good-faith research that follows coordinated disclosure and avoids privacy violations, DoS, or data exfiltration.

## Adversary's Security Testing

Adversary's own security checks are **authorized, local/sandbox-only** verification. It does not attack external systems. Do not use Adversary to test systems you are not authorized to test.
