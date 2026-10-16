# Texas Hold'em Party Poker (Render)

A starter multiplayer Texas Hold'em app using Node.js, Express, Socket.IO and Pokersolver.

## Included
- TV/table view and phone controller view in one responsive web app
- Room codes and QR-friendly join URL
- Server-authoritative deck, Fisher-Yates shuffle, dealing, betting actions, showdown and pot awards
- Private hole cards sent only to the relevant player's socket
- Public table state sent to everyone in the room
- Basic no-limit betting controls: fold, check, call, raise, all-in
- Render deployment configuration

## Run locally
1. Install Node.js 20 or newer.
2. Extract this folder and open a terminal inside it.
3. Run `npm install`
4. Run `npm start`
5. Open `http://localhost:3000` on the host screen.
6. For phone testing on the same network, open `http://YOUR-PC-LAN-IP:3000` on the phone.

## Deploy to Render
1. Put this folder in a GitHub repository.
2. In Render, choose **New + → Blueprint** and connect the repository, or create a **Web Service**.
3. Build command: `npm install`
4. Start command: `npm start`
5. Open the generated `https://...onrender.com` URL.

Render supplies `PORT`; the server binds to `0.0.0.0`.

## How to use
- On the TV/browser, choose **Host / TV**, create a room, and share the room code or URL/QR. The TV is spectator-only and does not occupy a seat.
- On each phone, open the same URL and choose **Join on phone**.
- Players enter a name, join the room, and wait.
- The host starts when at least two players have joined.

## Important prototype limits
- This is a playable starter, not a casino-grade or tournament-certified implementation.
- Game rooms and stacks live in server memory. A Render restart/deploy clears active games.
- The server is intended for one running instance. Do not scale to multiple instances without shared state/sticky Socket.IO configuration.
- Betting is simplified for a party game. Side pots are handled by contribution tiers, but edge cases such as tournament clocks, straddles, rebuys, persistence, and extensive adversarial testing are not implemented.
- Do not use real money. Test hand evaluation and edge cases before public use.
