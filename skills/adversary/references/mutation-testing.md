# Mutation Testing

Survived mutants expose blind spots stronger than line coverage ever can.

## Idea

Introduce a tiny defect, run existing tests, see if they catch it:

```
MUTATION | EXPECTED FAILURE | ACTUAL | CAUGHT / SURVIVED
```

Survived critical mutation → testing blind spot.

## Targeted Mutations (v0.1 — low-risk, high signal)

- `>` → `>=`, `<` → `<=`, `===` → `==`, `!==` → `!=`
- Invert boolean condition (`if (valid)` → `if (!valid)`)
- Remove a validation check (delete `if (!email) throw ...`)
- Change status transition (allow `draft → shipped` skipping `paid`)
- Skip authorization check (comment out guard)
- Change timeout value (e.g., `5000` → `1`)
- Remove error handling (`try/catch` → no catch)
- Off-by-one in pagination (`limit + 1` → `limit`)

Do not randomly mutate large portions of code. Pick 5-15 targeted mutants in critical paths.

## Process

1. Identify critical file/function (auth, validation, state transition, payment).
2. Create mutant: copy file or patch in place, run tests in sandbox, capture result, revert.
3. Record mutant + whether tests failed as expected.
4. If survived → propose a concrete test that would catch it.

## Example

```
File: src/orders/service.ts:42
Mutant: `if (amount > 0)` → `if (amount >= 0)` (allows zero-amount order)
Tests: 12 passed — mutant NOT caught
Finding: zero-amount order blind spot (MEDIUM). Add test: POST /orders { amount: 0 } → expect 400.
```

## Reporting

In `report.json`:

```json
{ "mutations": { "attempted": 10, "caught": 7, "survived": 3, "details": [...] } }
```

In human report, list survived mutants as findings (they are evidence of gaps, not app bugs).

## Tooling

If `stryker` / `cargo mutants` / `mutmut` already configured, use them. Otherwise do manual targeted patch + run relevant test file.
v0.1 does manual targeted mutation via `src/evidence` helpers — no full AST tool required.
