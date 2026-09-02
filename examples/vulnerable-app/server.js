/**
 * Vulnerable Demo App for Adversary
 * ---------------------------------
 * INTENTIONAL BUGS — for testing the QA engine only.
 *
 * Bugs:
 * 1. Duplicate order creation (no idempotency) — HIGH
 * 2. IDOR — GET /api/orders/:id has no ownership check — HIGH
 * 3. Zero-qty validation missing — MEDIUM
 * 4. Empty body returns 500 not 400 — MEDIUM
 * 5. Stack trace leak on malformed JSON (express default) — MEDIUM (depends)
 * 6. No rate limiting — LOW
 * 7. No auth at all (intentionally) — design allows adversary to flag
 */

import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 4311;

// Middleware — note: express.json error not handled -> stack leak possible
app.use(cors({ origin: "*" })); // overly permissive — security finding
app.use(express.json());

// In-memory state
let orders = [];
let nextId = 1;

/** Health */
app.get("/", (req, res) => res.json({ ok: true, service: "vulnerable-app" }));
app.get("/health", (req, res) => res.json({ ok: true }));

/** List orders */
app.get("/api/orders", (req, res) => {
  res.json(orders);
});

/** Get order by ID — BUG: no auth, no ownership check */
app.get("/api/orders/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const order = orders.find((o) => o.id === id);
  if (!order) return res.status(404).json({ error: "not found" });
  // Intentionally leaks internal field
  res.json(order);
});

/** Create order — BUGS:
 * - no idempotency -> duplicate on retry/double-click
 * - qty validation missing (zero qty allowed)
 * - empty body causes crash -> 500
 */
app.post("/api/orders", (req, res) => {
  // BUG: if body is empty, we throw and express returns 500
  if (!req.body || Object.keys(req.body).length === 0) {
    // Intentionally not validating — will be caught as 500 in some cases
    // Simulate bug: accessing req.body.item when undefined -> TypeError
    if (req.body.item === undefined && req.body.title === undefined) {
      // No proper 400 validation
      // For empty body we incorrectly try to use it and may throw
      // To ensure 500, throw explicitly when empty
      // But only if truly empty — make it a 500 path
      throw new Error("Cannot read property 'item' of undefined — stack leak");
    }
  }

  const item = req.body.item ?? req.body.title ?? "unknown";
  const qty = req.body.qty ?? 1;

  // BUG: no check for qty > 0, allows 0 and negative
  // Correct would be: if (qty <= 0) return 400

  // BUG: no idempotency key check — duplicate creation
  const order = {
    id: nextId++,
    item,
    qty,
    status: "created",
    createdAt: new Date().toISOString(),
    // intentional secret exposure
    internalNote: "secret-internal-token-123",
  };
  orders.push(order);
  res.status(201).json(order);
});

/** Delete order */
app.delete("/api/orders/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = orders.findIndex((o) => o.id === id);
  if (idx === -1) return res.status(404).json({ error: "not found" });
  orders.splice(idx, 1);
  res.json({ ok: true });
});

/** Reset — for testing only */
app.post("/api/reset", (req, res) => {
  orders = [];
  nextId = 1;
  res.json({ ok: true });
});

// Intentionally no rate limit
// Intentionally permissive CORS with credentials not set but origin *

// Global error handler that leaks stack (BUG)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message, stack: err.stack });
});

if (import.meta.url === `file://${process.argv[1]}`) {
  app.listen(PORT, () => console.log(`vulnerable-app listening on ${PORT}`));
}

export default app;
