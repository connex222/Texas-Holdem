# Phase 17 — Seat integrity safeguards

Prevents a single active socket from joining a second player seat, and rejects duplicate seat creation in a room. Resume-session now rejects attempts to attach an already-seated device to another player's token. This reduces accidental duplicate seats and confused session state during phone refreshes.

Added ten unit tests for the extracted session guards. These tests are **not** live Socket.IO integration tests. Traditional Three-Card Brag blind/seen wagers and paid challenges remain future work.

Run `npm install` then `npm test` on a network-connected machine to run the complete suite. No GitHub or Render deployment is included.
