# API Testing

Test the contract, the boundaries, and the state — not just status codes.

## Categories

### 1 — Happy Paths
- Valid requests, expected responses, normal state transitions.
- Assert: status, schema (Zod/AJV), semantics (body fields), side effects (subsequent GET).

### 2 — Boundary Conditions
- Empty strings, null, extremely large values, unexpected types
- Malformed JSON, missing fields, duplicated fields, unexpected enum values
- Extra fields (should be ignored or rejected consistently)
- For numbers: 0, -1, MAX_INT, NaN, Infinity (as JSON edge)
- For strings: empty, 10k chars, unicode, HTML/JS payloads (check escaping)

### 3 — Protocol Behavior
- Wrong HTTP method (GET on POST endpoint)
- Invalid Content-Type, missing headers, malformed auth
- Missing auth, expired token, wrong scheme (`Bearer` vs `Token`)
- CORS preflight if applicable

### 4 — State
- Repeated requests (idempotency)
- Stale resource version (If-Match / ETag if present)
- Deleted resource (GET after DELETE should 404)
- Concurrent updates (parallel PUT/PATCH → last-write-wins? lost update?)

### 5 — Failure Handling
- Dependency unavailable (mock 5xx from downstream if sandbox allows)
- Timeout, malformed dependency response, partial failure
- Check: does API return 5xx with leak (stack trace) or clean error envelope?

## Semantics Checklist

For every endpoint, answer:

- Does success status match body envelope? (e.g., 201 with `{ id }`)
- Are error bodies consistent (`{ error, code }` vs raw)?
- Are auth failures 401 vs 403 correctly?
- Are validation failures 400 or 422 consistently?
- Do list endpoints paginate? What about empty list, overflow page?

## Tooling

Prefer deterministic clients: `fetch`, `undici`, `supertest`, `curl`, Playwright `APIRequestContext`.

Example pattern (Node):

```ts
const res = await fetch(`${base}/api/orders`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
assert.strictEqual(res.status, 201);
const body = await res.json();
assert.ok(body.id);
// verify side effect
const list = await fetch(`${base}/api/orders`, { headers: { Authorization: `Bearer ${token}` } }).then(r=>r.json());
assert.ok(list.find(o=>o.id===body.id));
```

## Evidence

Log: request (method, url, headers redacted, body), response (status, headers, body), timing, correlation ID if present.
