const SUITS = ["spades", "hearts", "diamonds", "clubs"];
const SUIT_SYMBOL = { spades: "♠", hearts: "♥", diamonds: "♦", clubs: "♣" };
const RANK_LABEL = {
  1: "A", 2: "2", 3: "3", 4: "4", 5: "5", 6: "6", 7: "7",
  8: "8", 9: "9", 10: "10", 11: "J", 12: "Q", 13: "K"
};

const state = {
  stock: [],
  waste: [],
  foundations: { spades: [], hearts: [], diamonds: [], clubs: [] },
  tableau: [[], [], [], [], [], [], []],
};

const stockEl = document.getElementById("stock");
const wasteEl = document.getElementById("waste");
const tableauEl = document.getElementById("tableau");
const statusEl = document.getElementById("status");
const newGameBtn = document.getElementById("new-game");
const drawBtn = document.getElementById("draw-card");

let dragPayload = null;

function cardColor(suit) {
  return suit === "hearts" || suit === "diamonds" ? "red" : "black";
}

function createDeck() {
  const deck = [];
  for (const suit of SUITS) {
    for (let rank = 1; rank <= 13; rank += 1) {
      deck.push({
        id: `${suit}-${rank}-${crypto.randomUUID()}`,
        suit,
        rank,
        faceUp: false,
      });
    }
  }
  return deck;
}

function shuffle(deck) {
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}

function setupGame() {
  const deck = createDeck();
  shuffle(deck);

  state.stock = [];
  state.waste = [];
  state.foundations = { spades: [], hearts: [], diamonds: [], clubs: [] };
  state.tableau = [[], [], [], [], [], [], []];

  for (let col = 0; col < 7; col += 1) {
    for (let depth = 0; depth <= col; depth += 1) {
      const card = deck.pop();
      card.faceUp = depth === col;
      state.tableau[col].push(card);
    }
  }

  state.stock = deck;
  setStatus("Game started. Draw from stock or move cards.");
  render();
}

function setStatus(text) {
  statusEl.textContent = text;
}

function drawFromStock() {
  if (state.stock.length > 0) {
    const card = state.stock.pop();
    card.faceUp = true;
    state.waste.push(card);
  } else {
    while (state.waste.length) {
      const card = state.waste.pop();
      card.faceUp = false;
      state.stock.push(card);
    }
  }

  render();
}

function topFoundationRank(suit) {
  const pile = state.foundations[suit];
  return pile.length ? pile[pile.length - 1].rank : 0;
}

function canPlaceOnFoundation(card, suit) {
  return card.suit === suit && card.rank === topFoundationRank(suit) + 1;
}

function canStackTableau(movingCard, targetCard) {
  if (!targetCard) return movingCard.rank === 13;
  return cardColor(movingCard.suit) !== cardColor(targetCard.suit)
    && movingCard.rank === targetCard.rank - 1;
}

function revealTopIfNeeded(tableauIndex) {
  const pile = state.tableau[tableauIndex];
  if (pile.length && !pile[pile.length - 1].faceUp) {
    pile[pile.length - 1].faceUp = true;
  }
}

function extractTableauRun(tableauIndex, cardId) {
  const pile = state.tableau[tableauIndex];
  const idx = pile.findIndex((c) => c.id === cardId);
  if (idx === -1) return null;
  const moving = pile.slice(idx);
  if (!moving[0].faceUp) return null;
  state.tableau[tableauIndex] = pile.slice(0, idx);
  revealTopIfNeeded(tableauIndex);
  return moving;
}

function returnRunToTableau(tableauIndex, run) {
  state.tableau[tableauIndex].push(...run);
}

function handleDropToFoundation(suit) {
  if (!dragPayload) return;

  if (dragPayload.source === "waste") {
    const card = state.waste[state.waste.length - 1];
    if (card && canPlaceOnFoundation(card, suit)) {
      state.waste.pop();
      state.foundations[suit].push(card);
      setStatus(`Moved ${RANK_LABEL[card.rank]}${SUIT_SYMBOL[card.suit]} to foundation.`);
    }
  } else if (dragPayload.source === "tableau") {
    const run = extractTableauRun(dragPayload.tableauIndex, dragPayload.cardId);
    if (!run) return;

    if (run.length === 1 && canPlaceOnFoundation(run[0], suit)) {
      state.foundations[suit].push(run[0]);
      setStatus(`Moved ${RANK_LABEL[run[0].rank]}${SUIT_SYMBOL[run[0].suit]} to foundation.`);
    } else {
      returnRunToTableau(dragPayload.tableauIndex, run);
      setStatus("Invalid move to foundation.");
    }
  }

  dragPayload = null;
  render();
  checkWin();
}

function handleDropToTableau(targetTableau) {
  if (!dragPayload) return;

  const targetPile = state.tableau[targetTableau];
  const targetCard = targetPile.length ? targetPile[targetPile.length - 1] : null;

  if (dragPayload.source === "waste") {
    const card = state.waste[state.waste.length - 1];
    if (card && canStackTableau(card, targetCard)) {
      state.waste.pop();
      targetPile.push(card);
      setStatus(`Moved ${RANK_LABEL[card.rank]}${SUIT_SYMBOL[card.suit]} to tableau.`);
    } else {
      setStatus("Invalid tableau move.");
    }
  } else if (dragPayload.source === "tableau") {
    const run = extractTableauRun(dragPayload.tableauIndex, dragPayload.cardId);
    if (!run) return;

    if (dragPayload.tableauIndex === targetTableau) {
      returnRunToTableau(dragPayload.tableauIndex, run);
    } else if (canStackTableau(run[0], targetCard)) {
      targetPile.push(...run);
      setStatus("Moved stack.");
    } else {
      returnRunToTableau(dragPayload.tableauIndex, run);
      setStatus("Invalid tableau move.");
    }
  }

  dragPayload = null;
  render();
  checkWin();
}

function checkWin() {
  const complete = SUITS.every((s) => state.foundations[s].length === 13);
  if (complete) {
    setStatus("🎉 You won!");
  }
}

function makeCardEl(card, y, draggable, dragData) {
  const el = document.createElement("div");
  el.className = `card ${card.faceUp ? "face-up" : "back"} ${cardColor(card.suit)}`;
  if (draggable) el.classList.add("draggable");
  el.style.top = `${y}px`;
  el.dataset.cardId = card.id;

  if (card.faceUp) {
    el.textContent = `${RANK_LABEL[card.rank]}${SUIT_SYMBOL[card.suit]}`;
  } else {
    el.textContent = "";
  }

  if (draggable) {
    el.draggable = true;
    el.addEventListener("dragstart", (e) => {
      dragPayload = dragData;
      e.dataTransfer.setData("text/plain", card.id);
    });
  }

  return el;
}

function renderStock() {
  stockEl.innerHTML = "";
  if (!state.stock.length) return;
  const top = { ...state.stock[state.stock.length - 1], faceUp: false };
  stockEl.appendChild(makeCardEl(top, 0, false, null));
}

function renderWaste() {
  wasteEl.innerHTML = "";
  if (!state.waste.length) return;
  const card = state.waste[state.waste.length - 1];
  wasteEl.appendChild(makeCardEl(card, 0, true, { source: "waste" }));
}

function renderFoundations() {
  document.querySelectorAll(".foundation").forEach((f) => {
    const suit = f.dataset.suit;
    f.innerHTML = "";

    const pile = state.foundations[suit];
    if (pile.length) {
      const top = pile[pile.length - 1];
      f.appendChild(makeCardEl(top, 0, false, null));
    }

    f.addEventListener("dragover", (e) => {
      e.preventDefault();
      f.classList.add("drag-over");
    });
    f.addEventListener("dragleave", () => f.classList.remove("drag-over"));
    f.addEventListener("drop", (e) => {
      e.preventDefault();
      f.classList.remove("drag-over");
      handleDropToFoundation(suit);
    });
  });
}

function renderTableau() {
  tableauEl.innerHTML = "";

  state.tableau.forEach((pile, pileIndex) => {
    const col = document.createElement("div");
    col.className = "tableau-pile";

    col.addEventListener("dragover", (e) => {
      e.preventDefault();
      col.classList.add("drag-over");
    });
    col.addEventListener("dragleave", () => col.classList.remove("drag-over"));
    col.addEventListener("drop", (e) => {
      e.preventDefault();
      col.classList.remove("drag-over");
      handleDropToTableau(pileIndex);
    });

    pile.forEach((card, depth) => {
      const draggable = card.faceUp;
      col.appendChild(makeCardEl(card, depth * 28, draggable, {
        source: "tableau",
        tableauIndex: pileIndex,
        cardId: card.id,
      }));
    });

    tableauEl.appendChild(col);
  });
}

function render() {
  renderStock();
  renderWaste();
  renderFoundations();
  renderTableau();
}

newGameBtn.addEventListener("click", setupGame);
drawBtn.addEventListener("click", drawFromStock);
stockEl.addEventListener("click", drawFromStock);

setupGame();
