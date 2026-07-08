let allCards = [];
let deck = {};

const cardGrid = document.getElementById("cardGrid");
const deckList = document.getElementById("deckList");
const deckCount = document.getElementById("deckCount");
const deckExport = document.getElementById("deckExport");

const searchBox = document.getElementById("searchBox");
const factionFilter = document.getElementById("factionFilter");
const typeFilter = document.getElementById("typeFilter");

const cardPreview = document.getElementById("cardPreview");
const previewName = document.getElementById("previewName");

async function loadCards() {
  try {
    const response = await fetch("CardList.json");

    if (!response.ok) {
      throw new Error("Could not load CardList.json");
    }

    const cardDatabase = await response.json();

    allCards = Object.values(cardDatabase);

    populateFilters();
    renderCards();
  } catch (error) {
    console.error(error);
    cardGrid.innerHTML = "<p>Could not load cards. Check CardList.json.</p>";
  }
}

function populateFilters() {
  const factions = [...new Set(allCards.map(card => card.faction).filter(Boolean))].sort();
  const types = [...new Set(allCards.map(card => card.type).filter(Boolean))].sort();

  factions.forEach(faction => {
    const option = document.createElement("option");
    option.value = faction;
    option.textContent = faction;
    factionFilter.appendChild(option);
  });

  types.forEach(type => {
    const option = document.createElement("option");
    option.value = type;
    option.textContent = type;
    typeFilter.appendChild(option);
  });
}

function renderCards() {
  const searchText = searchBox.value.toLowerCase();
  const selectedFaction = factionFilter.value;
  const selectedType = typeFilter.value;

  const filteredCards = allCards.filter(card => {
    const name = card.name || "";
    const faction = card.faction || "";
    const type = card.type || "";

    const nameMatch = name.toLowerCase().includes(searchText);
    const factionMatch = !selectedFaction || faction === selectedFaction;
    const typeMatch = !selectedType || type === selectedType;

    return nameMatch && factionMatch && typeMatch;
  });

  cardGrid.innerHTML = "";

  filteredCards.forEach(card => {
    const cardDiv = document.createElement("div");
    cardDiv.className = "card";

    const img = document.createElement("img");
    img.src = card.face.front.image;
    img.alt = card.name;
    img.loading = "lazy";

    const name = document.createElement("div");
    name.className = "card-name";
    name.textContent = card.name;

    cardDiv.appendChild(img);
    cardDiv.appendChild(name);

    cardDiv.addEventListener("click", () => addCardToDeck(card));

    cardDiv.addEventListener("mouseenter", () => {
      cardPreview.src = card.face.front.image;
      cardPreview.alt = card.name;
      cardPreview.style.display = "block";
      previewName.textContent = card.name;
    });

    cardGrid.appendChild(cardDiv);
  });
}

function addCardToDeck(card) {
  if (!deck[card.id]) {
    deck[card.id] = {
      card: card,
      count: 0
    };
  }

  deck[card.id].count++;
  renderDeck();
}

function removeCardFromDeck(cardId) {
  if (!deck[cardId]) return;

  deck[cardId].count--;

  if (deck[cardId].count <= 0) {
    delete deck[cardId];
  }

  renderDeck();
}

function renderDeck() {
  deckList.innerHTML = "";

  const deckEntries = Object.values(deck).sort((a, b) =>
    a.card.name.localeCompare(b.card.name)
  );

  let totalCards = 0;

  deckEntries.forEach(entry => {
    totalCards += entry.count;

    const row = document.createElement("div");
    row.className = "deck-row";

    const cardText = document.createElement("span");
    cardText.textContent = `${entry.count}x ${entry.card.name}`;

    const buttons = document.createElement("span");
    buttons.className = "deck-buttons";

    const plusButton = document.createElement("button");
    plusButton.textContent = "+";
    plusButton.addEventListener("click", () => addCardToDeck(entry.card));

    const minusButton = document.createElement("button");
    minusButton.textContent = "-";
    minusButton.addEventListener("click", () => removeCardFromDeck(entry.card.id));

    buttons.appendChild(plusButton);
    buttons.appendChild(minusButton);

    row.appendChild(cardText);
    row.appendChild(buttons);

    deckList.appendChild(row);
  });

  deckCount.textContent = totalCards;

  deckExport.value = deckEntries
    .map(entry => `${entry.count} ${entry.card.name}`)
    .join("\n");
}

searchBox.addEventListener("input", renderCards);
factionFilter.addEventListener("change", renderCards);
typeFilter.addEventListener("change", renderCards);

loadCards();
