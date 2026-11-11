# Phase 15 — Five-Card Draw safety and input validation

- Extracted deck-capacity calculation and card-index validation into a testable module.
- Server now checks deck capacity before starting Five-Card Draw and rejects requests for more replacement cards than remain in the deck.
- Rejects duplicate, fractional, out-of-range, or more than three selected card indices.
- Added ten focused automated tests. These are **not** end-to-end Socket.IO tests.
- Existing games, room system and UI remain otherwise unchanged.

## Verification
- `node --check server.js` passed.
- `node --test test/draw-capacity.test.js` passed (10/10).
- Full suite requires installed dependencies and was not verified in this run.
- No live multiplayer test, GitHub update or Render deployment.
