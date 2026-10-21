# Phase 8 — Three-Card Brag (initial implementation)

Added three private cards, one poker-style betting round and server-evaluated Brag hand rankings with existing play-chip side-pot framework. Host can select the mode between hands. No community cards.

House rules: prial > running flush > run > flush > pair > high card; three threes is highest prial; A-2-3 is highest run, followed by A-K-Q. Brag conventions vary by table.

**Limitations:** This is not full traditional Brag betting. Blind/seen betting, see challenges and variants are not implemented. Existing poker-style blinds/call/raise/fold remain. Full multi-device testing pending.

Verification: server syntax and ten focused ranking tests passed. No GitHub/Render deployment.
