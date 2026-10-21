# Phase 9 — Session recovery

- Added cryptographically random 48-character hexadecimal resume tokens for hosts and players.
- Client saves session in browser sessionStorage and attempts to resume on Socket.IO connection.
- Server rebinds recovered seats to current socket and prevents an active seat being claimed by another connection.
- Disconnected lobby seats remain available for recovery.
- Tokens are not sent in public room updates.

## Limitations
- Recovery lasts only while the Node server process and its in-memory rooms survive; server restarts lose sessions.
- Browser sessionStorage does not synchronise across devices or browser tabs.
- Disconnected players still fold/stand during a live hand; reconnecting does not reverse that decision.
- Automated tests cover existing Brag rankings only. Reconnection integration testing with real Socket.IO clients remains outstanding.
- GitHub and Render not updated.
