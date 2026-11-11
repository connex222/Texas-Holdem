# CLAUDE.md - Texas Hold'em (superseded)

Instructions for AI assistants working in this repository.

## Status

This repository is a **superseded starter build**, kept for reference. Its replacement is The Gilded Deck (https://gilded-deck.onrender.com). Do not develop new features here unless Shaun explicitly asks; suggest making the change in The Gilded Deck instead.

## What this is

A TV + phone Texas Hold'em game: Node.js, Express, Socket.IO and Pokersolver. The TV is the table; phones are private controllers. Phase design notes are in `docs/phases/`.

| Part | Location |
|---|---|
| Server | `server.js` |
| Client | `public/index.html` |
| Render settings | `render.yaml` |

## Rules if it is ever revived

- Hole cards must only ever be sent to the owning player's socket, never to the TV.
- The server is authoritative: shuffling, dealing and pot awards happen on the server only.
- Listen on `process.env.PORT`.

## Working with Shaun (the owner)

- Shaun is not a programmer. Explain every step in plain English, in order, and assume no prior knowledge.
- Always return complete files, never partial snippets or "..." placeholders.
- Use UK English.
- Never delete files to tidy up; move old notes into `docs/` instead.
- Never force-push, rewrite history or rename the repository.
