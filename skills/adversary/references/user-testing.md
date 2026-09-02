# User Simulation

Don't test functions. Test **sequences of user behavior** and the state they leave behind.

## Honest Sequences

Model realistic human workflows. Chain 4-10 steps:

```
signup → verify email → login → create resource → edit → refresh → reopen → delete
```

```
login → search → filter → add to cart → adjust qty → checkout → pay → verify order → reload page
```

Each step: assert **user intent** AND **backend state** (API + DB if available).

## Adversarial Sequences

Impatient, confused, or hostile users expose state-machine bugs:

- Double-click / double-submit (idempotency)
- Refresh during mutation (partial commit?)
- Back button after POST (resubmit? stale?)
- Multiple tabs (session, optimistic locking)
- Expired session mid-flow
- Logout in another tab mid-operation
- Rapid repeated requests (race, rate limit)
- Invalid navigation (deep link to unauthorized state)
- Stale page (form rendered before permission revoked)
- Network disconnect → reconnect mid-request
- Browser reload on success screen (duplicate side effect?)

## How to Execute

1. If browser app: Playwright. If API-only: HTTP client + state tracking.
2. Track state explicitly: cookies, tokens, localStorage, DB rows.
3. After each action, capture: screenshot (browser), network log, DB snapshot.
4. Check not only "did the UI say success?" but "did the DB match? does GET reflect it? does second GET duplicate?"

## Example Bug Pattern

```
1. User clicks "Create Order" twice quickly
2. UI shows one toast
3. Adversary: GET /orders → 2 rows (duplicate)
Finding: missing idempotency guard. Severity: HIGH.
```

## Heuristics for State Bugs

- If a mutation lacks an idempotency key or dedup window → test double-submit.
- If auth is cookie-based → test tab logout race.
- If optimistic UI → test refresh before confirmation.
- If pagination + mutation → test stale list after create/delete.
