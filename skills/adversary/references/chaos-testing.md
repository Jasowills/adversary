# Chaos Testing

Question is not "does it work when everything works?" but "what does it do when something stops working?"

## When to Run

Only where the sandbox permits safe failure injection. Prefer DockerCompose: you can stop a service. If no Docker, do lightweight simulations (timeout, abort, malformed mock).

## Faults to Inject (pick relevant subset)

- Database unavailable / slow
- Redis / cache unavailable
- Worker / queue consumer crash
- API timeout (downstream slow)
- Network disconnect / slow network (Playwright `route.abort()` / `route.fulfill` with delay)
- Malformed dependency response (unexpected shape)
- Duplicate event (send same webhook/message twice)
- Out-of-order event
- Queue delay / backlog
- Partial service failure (one of N instances down)
- Process restart mid-transaction

## Hypothesis Template

```
Hypothesis:  When <dependency> is <fault>, the app should <expected behavior>
             (e.g., return 503 with retryable error, not 500 with stack trace; not create duplicate order)
```

Record: `HYPOTHESIS | FAULT | EXPECTED | OBSERVED | VERDICT`

## Minimal Implementation (v0.1)

If full fault injection infra not available, do at least:

1. **Timeout simulation**: request with `AbortSignal.timeout(1)` or downstream delay mock → verify timeout handling.
2. **Duplicate submission**: send same POST twice concurrently → check idempotency.
3. **Dependency error**: if app calls external service, mock 500 → check error propagation (no secret leak, correct status).

## Evidence

- Logs during fault
- Response status/body during fault
- State after recovery (DB consistent? queue drained? no phantom write?)

## Safety

- Only in sandbox.
- Restore service immediately after test; use `sandbox.reset()` if needed.
- Never chaos-test production unless explicit isolated prod-like env given.
