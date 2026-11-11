# Phase 10 — Opt-in recovery checkpoint

Added optional atomic JSON checkpoint persistence. Set `GILDED_STATE_FILE=/var/data/gilded-rooms.json` on a host with a **persistent writable disk**. The default is memory-only (unchanged). Room codes, seat recovery tokens, chip balances and game selection are saved. Restarted rooms reopen as lobbies; any interrupted hand is cancelled and the chip balances are rolled back to the pre-hand checkpoint. This is deliberately **not** live hand recovery.

**Security:** the checkpoint contains bearer session tokens; secure the file and persistent volume and never commit it to GitHub. Tokens are not shown in public room updates. The save is debounced (150ms), so a sudden process failure may lose the most recent completed hand. For strict durability or multi-instance deployment, use a transactional database instead.

**Important:** Traditional Three-Card Brag blind/seen betting and see challenges remain outstanding. Full multi-device integration tests and Render deployment remain outstanding. This release prioritises recoverability and does not claim to complete those features.

Run `npm test` after installing dependencies. To enable persistence, set `GILDED_STATE_FILE` to a writable persistent-disk path. On ephemeral Render storage, persistence will **not** survive instance replacement.
