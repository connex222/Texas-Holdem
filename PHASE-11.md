# Phase 11 — Rules and recovery verification

Expanded the automated tests for Blackjack hand values, Three-Card Brag ranking edge cases, and persistence checkpoint shape. Run with `npm test` on Node.js 20 or later. The existing 10 Brag tests are retained.

## Scope and limitations
- These tests validate selected deterministic rules and checkpoint data structure, **not** Socket.IO flows or complete settlements.
- The game still uses simplified poker-style betting for Three-Card Brag; blind/seen betting and see challenges remain unimplemented.
- Room snapshots still require a persistent disk via `GILDED_STATE_FILE` to survive Render instance replacement.
- Do not deploy as production-ready without real multiplayer, disconnect/reconnect, full-hand and server-restart acceptance tests.
- No GitHub or Render deployment was performed as part of this package.
