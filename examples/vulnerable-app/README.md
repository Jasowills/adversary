# Vulnerable Demo App

> **INTENTIONAL VULNERABILITIES — DO NOT USE IN PRODUCTION.**
> This app exists solely so Adversary has something to attack.

## Run

```bash
cd examples/vulnerable-app
npm install
PORT=4311 npm start
# or
node server.js
```

Health: `GET /health` → `{ ok: true }`

## Intentional bugs

| # | Bug | Severity | How Adversary finds it |
|---|---|---|---|
| 1 | Duplicate order on concurrent POST (no idempotency) | HIGH | Concurrent POST /api/orders |
| 2 | IDOR — GET /api/orders/:id no ownership check | HIGH | Static + GET without auth returns 200 |
| 3 | Zero qty allowed | MEDIUM | Mutation `qty > 0 → qty >= 0` survives |
| 4 | Empty body → 500 not 400 | MEDIUM | POST {} → 500 |
| 5 | Stack trace leak in error response | MEDIUM | Error envelope contains `stack` |
| 6 | No rate limiting | LOW | Static + burst check |
| 7 | Permissive CORS `origin: *` | LOW | Static |

## Expected Adversary result

```
VERDICT: NOT_READY
Critical: 0  High: 2  Medium: 2  Low: 1
```

Run:

```bash
npx adversary run ./examples/vulnerable-app
```
