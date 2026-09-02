# Security Testing (Defensive, Sandbox-Only)

All checks are **authorized local/sandbox verification**. Never target external systems or production without explicit scope.

Goal: defensive verification — does the app enforce its own boundaries?

## Scope (local application boundaries)

- **Authentication**: missing token, expired token, malformed token, wrong scheme, token in wrong place
- **Authorization**: horizontal (user A accesses user B's resource) — IDOR, vertical (user → admin), broken function-level auth
- **Session**: fixation (if cookies), invalidation on logout, concurrent session handling
- **Input validation / Injection**: SQL-ish, NoSQL-ish, command-ish, template-ish, header injection; check escaping/parameterization, not exploitation
- **Path traversal**: `../`, encoded variants on file-related endpoints
- **SSRF**: if URL fetch feature exists, try internal addresses (`169.254.169.254`, `localhost`) — only against sandbox
- **Rate limiting**: rapid repeated requests → expect 429 or consistent handling
- **Replay**: resend same request/token/nonce
- **Sensitive exposure**: secrets in logs, secrets in responses, stack traces, `x-powered-by`, verbose errors
- **Unsafe client storage**: tokens in `localStorage` without httpOnly note, PII in URL
- **CORS**: overly permissive `Access-Control-Allow-Origin: *` with credentials
- **CSRF**: state-changing POST without token/header check (where applicable)

## How to Test

- For each protected endpoint: request without auth, with low-privilege token, with tampered ID.
- For IDOR: create resource as user A, fetch as user B (expect 403/404, not 200 with data).
- For exposure: grep responses for `password`, `secret`, `api_key`, stack traces; check logs if available.
- For rate limit: burst 20 requests in <1s; record whether 429 or silent success.

## Rules

- Do not exfiltrate, do not pivot, do not brute-force credentials.
- Do not run scanners that flood infra. Use targeted, low-volume checks.
- If no auth exists in app, record `security: skipped (no auth detected)` — do not invent auth.

## Severity Guidance

- IDOR / privilege escalation / auth bypass → HIGH or CRITICAL
- Secret exposure / stack trace → MEDIUM-HIGH
- Missing rate limit / permissive CORS → LOW-MEDIUM (depends on context)

Document each check as: `CHECK | EXPECTED | OBSERVED | VERDICT`.
