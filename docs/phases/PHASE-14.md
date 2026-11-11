# Phase 14 — deck integrity and game-night safeguards

- Added a server-side maximum of six active players for Five-Card Draw. This guarantees that five initial cards plus up to three replacement cards per player fit within one 52-card deck (48 cards maximum).
- Seven or eight players may still join the shared lobby for other games. The host must switch game or reduce the active player count before starting Five-Card Draw.
- Added automated tests for unique deck cards, card code validity, shuffle variation, draw-deck capacity and the draw player limit.
- Three-Card Brag still uses simplified poker-style betting. Traditional blind/seen and see challenges remain unimplemented.
- Full Socket.IO integration, browser and real multi-device testing remain outstanding. No GitHub or Render deployment performed.
