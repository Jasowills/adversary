# Browser Testing

Use Playwright where a browser entry point exists. Do not merely verify that a button exists.

## Principle

```
User submits payment
  → UI says success
  → Adversary verifies API response
  → Adversary verifies DB state
  → Adversary verifies duplicate-submission behavior
```

Green UI is not proof.

## Setup

- Install: `npx playwright install --with-deps` (record if unavailable)
- Config: look for `playwright.config.*`, fallback to ad-hoc `npx playwright test` or scripted `playwright` API
- Sandbox: start app on ephemeral port, point Playwright `baseURL` there
- Collect: traces (`trace: 'on'`), screenshots on failure, network HAR

## What to Verify (beyond locators)

For each user-visible action:

- **User intent**: what the user thinks happened (toast, redirect, list update)
- **Visible result**: DOM, URL, accessibility tree
- **Network**: request method/body/headers, response status/body, retries
- **Backend state**: API GET after mutation, DB row if reachable
- **Error behavior**: what happens on 4xx/5xx, on invalid input, on timeout
- **Recovery**: can the user retry correctly? is state consistent?

## Locator Strategy

Prefer user-facing locators: `getByRole`, `getByLabel`, `getByText`. Avoid brittle CSS selectors.
Scope by region when ambiguous.

## Scenarios to Prioritize

1. Golden path (sanity)
2. Validation: empty, too long, wrong type, XSS payload (defensively, check escaping not execution)
3. Auth: protected route without login, expired session
4. Mutation: double-submit, refresh mid-POST, back button
5. Error: API 500 → UI error display + no phantom success
6. If file upload / rich content → check rendering/escaping

## Evidence on Failure

- Screenshot (before/after)
- Trace (`trace.zip`)
- Network: request/response pair
- Console logs, page errors
- DB snapshot if sandbox exposes it

## When Not to Use Browser Testing

If no frontend detected (pure API/lib), skip and record `browser: skipped (no frontend detected)`. Do not fake browser scenarios.
