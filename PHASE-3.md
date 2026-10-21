# Phase 3 — Omaha poker

Added host-selectable Omaha alongside Texas Hold’em. Omaha deals four private cards and evaluates each showdown using **exactly two** private cards and **exactly three** community cards, including side-pot comparisons. Existing shared blinds, turns and betting UI are reused. The host may switch variants only between hands; selecting a game returns the room to its lobby state. Blackjack, Draw, Brag and Stud are not implemented.

Validation: Node server syntax check. Full browser and multi-device acceptance testing is outstanding. This release is not verified production-ready.
