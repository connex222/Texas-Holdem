# Phase 18 — Three-Card Brag complete house-rules implementation

Implemented separate Brag wagering (no poker blinds), equal antes, blind/seen stake ratios, look-at-cards privacy, raise stake capped at double the current blind stake, fold, paid heads-up see, challenger loses ties, and server-side settlement. The game auto-showdowns after 50 actions or when no player can afford another stake to prevent stalled rooms. These are explicitly documented **house rules**; traditional Brag variants differ on blind-to-seen conversion, raises, and who can challenge whom. This implementation does not claim tournament-standard Brag.

Important: side-pot and bankroll behaviour require live multi-device acceptance tests. No GitHub or Render deployment was performed.
