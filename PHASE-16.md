# Phase 16 — Three-Card Brag challenge prototype

Added a player-controlled 'Look at cards' seen-state and a limited heads-up 'See opponent' challenge. A see requires exactly two remaining players, both having marked their hands seen, and matching bets. The server compares three-card Brag rankings and awards a tie to the challenged player. The winner receives the pot through the existing hand settlement path.

**Not authentic Brag betting yet.** Blind/seen stake multipliers, paid see stakes, and full betting constraints remain unimplemented. The cards were already visible to their owner in the earlier interface, so the 'look' control only marks their seen status, and must not be described as concealed-card reveal. This is a playable prototype feature, not a full rules release.

Testing: 46 automated tests pass (including the corrected outdated deck-capacity assertion); server syntax passes. The new challenge flow has not been end-to-end tested with actual Socket.IO clients. No GitHub or Render deployment.
