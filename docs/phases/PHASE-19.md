# Phase 19 — Socket.IO integration-test foundation and Brag disconnect fix

- Added two real WebSocket / Engine.IO / Socket.IO integration tests using Node 22's built-in WebSocket client. They exercise room creation, duplicate seats, game selection, hidden Brag cards, look/see actions, winner settlement, chip conservation, and reconnection.
- Fixed a gameplay bug: when a player disconnected during Brag, the server incorrectly invoked poker street progression. Brag now uses its own turn progression and immediately settles when only one active player remains.
- All 56 existing unit tests pass. The 2 new integration tests were **skipped** because the current execution environment lacks runtime npm dependencies (`express`, `socket.io`, `pokersolver`) and cannot install them. They are not claimed as passed. Run `npm install && npm test` in an environment with npm registry access to execute them. The tests use the global WebSocket API and therefore require Node >=22 (existing server requirement is >=20; on Node 20 integration tests need a WebSocket polyfill or should be skipped).
- No real phone acceptance testing, GitHub upload, or Render deployment was performed.
