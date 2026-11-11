# Phase 12 — Betting and settlement regression coverage

Seven additional automated tests cover turn eligibility, betting-round completion, short-stack side pots, folded contributions, and tied-pot chip conservation.

Run: `npm test` (Node.js 20+). Result: 28 passing tests, 0 failures on Node.js 22.

Scope: deterministic server-side unit checks only. No live Socket.IO connections, real devices, server restart integration, or browser rendering have been tested. Traditional Three-Card Brag blind/seen betting and see challenges remain unimplemented.

Deployment: not uploaded to GitHub or Render.
