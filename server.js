const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { Hand } = require("pokersolver");
const crypto = require("crypto");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: true } });
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));
app.get("/health", (_req, res) => res.status(200).json({ ok: true }));

const rooms = new Map();
const SUITS = ["♠", "♥", "♦", "♣"];
const RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A"];

function code() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 4; i++) result += alphabet[crypto.randomInt(alphabet.length)];
  return result;
}
function makeDeck() {
  const deck = [];
  for (const suit of SUITS) for (const rank of RANKS) {
    const solverSuit = ({ "♠": "s", "♥": "h", "♦": "d", "♣": "c" })[suit];
    deck.push({ rank, suit, code: `${rank}${solverSuit}` });
  }
  for (let i = deck.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}
function newPlayer(id, name) {
  return { id, name: String(name || "Player").trim().slice(0, 18) || "Player", stack: 1000,
    hole: [], committed: 0, roundBet: 0, folded: false, allIn: false, acted: false, connected: true };
}
function roomPublic(room) {
  return {
    code: room.code, status: room.status, hostId: room.hostId,
    players: room.players.map((p, i) => ({
      id: p.id, name: p.name, stack: p.stack, committed: p.committed,
      roundBet: p.roundBet, folded: p.folded, allIn: p.allIn, connected: p.connected,
      seat: i, isDealer: i === room.dealerIndex, isTurn: room.players[room.turnIndex]?.id === p.id
    })),
    community: room.community, pot: room.pot, currentBet: room.currentBet,
    minRaise: room.minRaise, street: room.street, message: room.message,
    dealerIndex: room.dealerIndex, turnId: room.players[room.turnIndex]?.id || null,
    handNumber: room.handNumber, smallBlind: room.smallBlind, bigBlind: room.bigBlind,
    winners: room.winners || [], lastAction: room.lastAction || ""
  };
}
function emitRoom(room) {
  io.to(room.code).emit("update-tv", roomPublic(room));
  for (const p of room.players) {
    if (!p.connected) continue;
    io.to(p.id).emit("update-player", {
      roomCode: room.code, playerId: p.id, hole: p.hole,
      stack: p.stack, committed: p.committed, roundBet: p.roundBet,
      isTurn: room.players[room.turnIndex]?.id === p.id,
      canCheck: room.currentBet === p.roundBet,
      callAmount: Math.max(0, Math.min(p.stack, room.currentBet - p.roundBet)),
      minRaiseTo: Math.min(p.stack + p.roundBet, room.currentBet + room.minRaise),
      maxRaiseTo: p.stack + p.roundBet,
      pot: room.pot, currentBet: room.currentBet, status: room.status, street: room.street
    });
  }
}
function createRoom(hostId) {
  let roomCode;
  do { roomCode = code(); } while (rooms.has(roomCode));
  const room = {
    code: roomCode, hostId, players: [], status: "lobby", deck: [], community: [],
    pot: 0, currentBet: 0, minRaise: 20, turnIndex: -1, dealerIndex: 0,
    street: "lobby", message: "Waiting for players to join", handNumber: 0,
    smallBlind: 10, bigBlind: 20, winners: [], lastAction: "", actedThisStreet: new Set()
  };
  rooms.set(roomCode, room);
  return room;
}
function nextEligible(room, from, predicate = p => !p.folded && !p.allIn && p.stack >= 0) {
  for (let step = 1; step <= room.players.length; step++) {
    const idx = (from + step + room.players.length) % room.players.length;
    if (predicate(room.players[idx])) return idx;
  }
  return -1;
}
function activePlayers(room) { return room.players.filter(p => !p.folded); }
function actionablePlayers(room) { return room.players.filter(p => !p.folded && !p.allIn && p.stack > 0); }
function roundComplete(room) {
  const able = actionablePlayers(room);
  if (able.length === 0) return true;
  if (able.length === 1) return able[0].acted && able[0].roundBet === room.currentBet;
  return able.every(p => p.acted && p.roundBet === room.currentBet);
}
function cardCode(card) { return card.code; }
function resetStreet(room) {
  room.currentBet = 0;
  room.minRaise = room.bigBlind;
  room.actedThisStreet = new Set();
  for (const p of room.players) { p.roundBet = 0; p.acted = p.folded || p.allIn; }
}
function drawCommunity(room, count) {
  for (let i = 0; i < count; i++) room.community.push(room.deck.pop());
}
function advanceStreet(room) {
  if (activePlayers(room).length === 1) return finishHand(room, activePlayers(room));
  if (room.street === "pre-flop") { room.street = "flop"; drawCommunity(room, 3); }
  else if (room.street === "flop") { room.street = "turn"; drawCommunity(room, 1); }
  else if (room.street === "turn") { room.street = "river"; drawCommunity(room, 1); }
  else if (room.street === "river") return showdown(room);
  resetStreet(room);
  room.message = room.street[0].toUpperCase() + room.street.slice(1);
  if (actionablePlayers(room).length <= 1) {
    while (room.community.length < 5) {
      if (room.street === "flop") { room.street = "turn"; drawCommunity(room, 1); }
      else if (room.street === "turn") { room.street = "river"; drawCommunity(room, 1); }
      else if (room.street === "river") break;
      else break;
    }
    if (room.community.length === 5) return showdown(room);
  }
  room.turnIndex = nextEligible(room, room.dealerIndex);
  if (room.turnIndex < 0) return advanceStreet(room);
  emitRoom(room);
}
function settlePots(room, winnersByHand) {
  const eligible = room.players.filter(p => !p.folded);
  const levels = [...new Set(room.players.map(p => p.committed).filter(v => v > 0))].sort((a,b)=>a-b);
  let previous = 0;
  const awards = new Map();
  for (const level of levels) {
    const contributors = room.players.filter(p => p.committed >= level);
    const amount = (level - previous) * contributors.length;
    const contenders = contributors.filter(p => !p.folded);
    let winners = contenders;
    if (contenders.length > 1) {
      const solved = contenders.map(p => ({ p, hand: winnersByHand.get(p.id) })).filter(x => x.hand);
      let best = [];
      for (const item of solved) {
        if (!best.length) best = [item];
        else {
          const cmp = item.hand.compare(best[0].hand);
          if (cmp > 0) best = [item];
          else if (cmp === 0) best.push(item);
        }
      }
      winners = best.map(x => x.p);
    }
    if (winners.length) {
      const share = Math.floor(amount / winners.length);
      let remainder = amount - share * winners.length;
      winners.forEach(p => {
        awards.set(p.id, (awards.get(p.id) || 0) + share + (remainder-- > 0 ? 1 : 0));
      });
    }
    previous = level;
  }
  for (const p of room.players) p.stack += awards.get(p.id) || 0;
  return [...awards.entries()].filter(([, amount]) => amount > 0).map(([id, amount]) => ({
    id, name: room.players.find(p => p.id === id)?.name, amount
  }));
}
function finishHand(room, winners) {
  const hands = new Map();
  if (room.community.length === 5) {
    for (const p of room.players.filter(p => !p.folded)) {
      try { hands.set(p.id, Hand.solve([...p.hole, ...room.community].map(cardCode))); } catch {}
    }
  }
  if (winners && winners.length === 1 && activePlayers(room).length === 1) {
    const winner = winners[0];
    winner.stack += room.pot;
    room.winners = [{ id: winner.id, name: winner.name, amount: room.pot }];
  } else {
    room.winners = settlePots(room, hands);
  }
  room.pot = 0;
  room.status = "complete";
  room.street = "showdown";
  room.turnIndex = -1;
  room.message = room.winners.length
    ? `Hand complete — ${room.winners.map(w => `${w.name} +${w.amount}`).join(", ")}`
    : "Hand complete";
  emitRoom(room);
}
function showdown(room) {
  const eligible = activePlayers(room);
  if (eligible.length === 1) return finishHand(room, eligible);
  const hands = new Map();
  for (const p of eligible) {
    try { hands.set(p.id, Hand.solve([...p.hole, ...room.community].map(cardCode))); } catch {}
  }
  // finishHand recalculates hands and distributes contribution tiers, including side pots.
  finishHand(room, eligible);
}
function postBet(room, p, amount) {
  const paid = Math.max(0, Math.min(p.stack, amount));
  p.stack -= paid; p.roundBet += paid; p.committed += paid; room.pot += paid;
  if (p.stack === 0) p.allIn = true;
  return paid;
}
function startHand(room) {
  if (room.players.filter(p => p.connected && p.stack > 0).length < 2) { room.message = "At least two players are required"; return emitRoom(room); }
  room.players = room.players.filter(p => p.connected && p.stack > 0);
  room.status = "playing"; room.handNumber++; room.deck = makeDeck(); room.community = [];
  room.pot = 0; room.currentBet = room.bigBlind; room.minRaise = room.bigBlind;
  room.winners = []; room.lastAction = ""; room.street = "pre-flop"; room.actedThisStreet = new Set();
  room.players.forEach(p => {
    p.hole = [room.deck.pop(), room.deck.pop()]; p.committed = 0; p.roundBet = 0;
    p.folded = false; p.allIn = false; p.acted = false;
  });
  room.dealerIndex = (room.dealerIndex + (room.handNumber === 1 ? 0 : 1)) % room.players.length;
  const sb = room.players.length === 2 ? room.dealerIndex : (room.dealerIndex + 1) % room.players.length;
  const bb = (sb + 1) % room.players.length;
  postBet(room, room.players[sb], room.smallBlind);
  postBet(room, room.players[bb], room.bigBlind);
  room.currentBet = Math.max(...room.players.map(p => p.roundBet));
  room.turnIndex = room.players.length === 2 ? nextEligible(room, bb) : nextEligible(room, bb);
  room.message = `Hand ${room.handNumber} — pre-flop`;
  emitRoom(room);
}
function advanceTurn(room, from = room.turnIndex) {
  if (activePlayers(room).length <= 1) return finishHand(room, activePlayers(room));
  if (roundComplete(room)) return advanceStreet(room);
  const next = nextEligible(room, from);
  if (next < 0) return advanceStreet(room);
  room.turnIndex = next;
  emitRoom(room);
}
function act(room, player, action, amount) {
  if (room.status !== "playing") return;
  if (room.players[room.turnIndex]?.id !== player.id) return io.to(player.id).emit("action-error", "It is not your turn.");
  const owed = Math.max(0, room.currentBet - player.roundBet);
  action = String(action || "").toLowerCase();
  if (action === "fold") {
    player.folded = true; player.acted = true; room.lastAction = `${player.name} folded`;
  } else if (action === "check") {
    if (owed > 0) return io.to(player.id).emit("action-error", "You cannot check while facing a bet.");
    player.acted = true; room.lastAction = `${player.name} checked`;
  } else if (action === "call") {
    if (owed <= 0) { player.acted = true; room.lastAction = `${player.name} checked`; }
    else { const paid = postBet(room, player, owed); player.acted = true; room.lastAction = `${player.name} called ${paid}`; }
  } else if (action === "raise" || action === "all-in") {
    const target = action === "all-in" ? player.roundBet + player.stack : Number(amount);
    const maxTarget = player.roundBet + player.stack;
    if (!Number.isFinite(target) || target <= room.currentBet || target > maxTarget) {
      return io.to(player.id).emit("action-error", "Raise must be above the current bet and no more than your stack.");
    }
    const raiseBy = target - room.currentBet;
    if (raiseBy < room.minRaise && target !== maxTarget) return io.to(player.id).emit("action-error", `Minimum raise is ${room.currentBet + room.minRaise}.`);
    const paid = target - player.roundBet;
    postBet(room, player, paid);
    if (target > room.currentBet) {
      const fullRaise = target - room.currentBet >= room.minRaise;
      if (fullRaise) room.minRaise = target - room.currentBet;
      room.currentBet = target;
      room.players.forEach(p => { if (p.id !== player.id && !p.folded && !p.allIn && (fullRaise || p.roundBet < target)) p.acted = false; });
    }
    player.acted = true;
    room.lastAction = `${player.name} ${action === "all-in" || player.allIn ? "went all-in" : `raised to ${player.roundBet}`}`;
  } else {
    return io.to(player.id).emit("action-error", "Unknown action.");
  }
  if (activePlayers(room).length === 1) return finishHand(room, activePlayers(room));
  advanceTurn(room);
}
io.on("connection", socket => {
  socket.on("create-room", ({ name } = {}, callback) => {
    const room = createRoom(socket.id);
    room.hostId = socket.id;
    socket.join(room.code);
    if (typeof callback === "function") callback({ ok: true, roomCode: room.code, playerId: socket.id });
    emitRoom(room);
  });
  socket.on("join-room", ({ roomCode, name } = {}, callback) => {
    const room = rooms.get(String(roomCode || "").toUpperCase().trim());
    if (!room) return typeof callback === "function" && callback({ ok: false, error: "Room not found." });
    if (room.status !== "lobby" && room.status !== "complete") return typeof callback === "function" && callback({ ok: false, error: "A hand is in progress. Join after it finishes." });
    if (room.players.length >= 8) return typeof callback === "function" && callback({ ok: false, error: "Room is full (8 players maximum)." });
    const player = newPlayer(socket.id, name);
    room.players.push(player); socket.join(room.code);
    if (typeof callback === "function") callback({ ok: true, roomCode: room.code, playerId: socket.id });
    room.message = `${player.name} joined the table`;
    emitRoom(room);
  });
  socket.on("start-game", ({ roomCode } = {}) => {
    const room = rooms.get(String(roomCode || "").toUpperCase());
    if (!room || room.hostId !== socket.id) return;
    if (room.status === "playing") return;
    startHand(room);
  });
  socket.on("player-action", ({ roomCode, action, amount } = {}) => {
    const room = rooms.get(String(roomCode || "").toUpperCase());
    if (!room) return;
    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;
    act(room, player, action, amount);
  });
  socket.on("deal-round", ({ roomCode, round } = {}) => {
    const room = rooms.get(String(roomCode || "").toUpperCase());
    if (!room || room.hostId !== socket.id || room.status !== "complete") return;
    // Host starts the next hand. Round names are accepted for client compatibility; server controls order.
    if (["pre-flop", "flop", "turn", "river", "showdown"].includes(String(round || "pre-flop"))) startHand(room);
  });
  socket.on("disconnect", () => {
    for (const room of rooms.values()) {
      if (room.hostId === socket.id) { room.hostId = null; room.message = "Host disconnected; refresh to create a new table"; emitRoom(room); continue; }
      const p = room.players.find(x => x.id === socket.id);
      if (!p) continue;
      p.connected = false;
      if (room.status === "lobby") {
        room.players = room.players.filter(x => x.id !== socket.id);
        
      }
      if (room.status === "playing" && !p.folded && !p.allIn) {
        p.folded = true; p.acted = true;
        if (room.turnIndex >= 0) advanceTurn(room, room.turnIndex);
      } else emitRoom(room);
      break;
    }
  });
});

server.listen(PORT, "0.0.0.0", () => console.log(`Texas Hold'em server listening on ${PORT}`));
