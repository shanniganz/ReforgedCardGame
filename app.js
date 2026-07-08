let allCards = [];
let deck = {};
let selectedTypeTab = "All";

const cardGrid = document.getElementById("cardGrid");
const deckList = document.getElementById("deckList");
const deckCount = document.getElementById("deckCount");
const deckExport = document.getElementById("deckExport");

const searchBox = document.getElementById("searchBox");
const setFilter = document.getElementById("setFilter");
const factionFilter = document.getElementById("factionFilter");
const subtypeFilter = document.getElementById("subtypeFilter");
const damageTypeFilter = document.getElementById("damageTypeFilter");
const costFilter = document.getElementById("costFilter");

const cardPreview = document.getElementById("cardPreview");
const previewName = document.getElementById("previewName");
const previewDetails = document.getElementById("previewDetails");
const previewText = document.getElementById("previewText");

async function loadCards() {
  try {
    const response = await fetch("CardList.json");

    if (!response.ok) {
      throw new Error("Could not load CardList.json");
    }

    const cardDatabase = await response.json();
    allCards = Object.values(cardDatabase);

    populateFilters();
    createTypeTabs();
    renderCards();
  } catch (error) {
    console.error(error);
    cardGrid.innerHTML = "<p>Could not load cards. Check CardList.json.</p>";
  }
}

function populateSelect(selectElement, values) {
  values.forEach(value => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    selectElement.appendChild(option);
  });
}

function populateFilters() {
  populateSelect(setFilter, [...new Set(allCards.map(card => card.setname).filter(Boolean))].sort());
  populateSelect(factionFilter, [...new Set(allCards.map(card => card.faction).filter(Boolean))].sort());
  populateSelect(subtypeFilter, [...new Set(allCards.map(card => card.subtype).filter(Boolean))].sort());
  populateSelect(damageTypeFilter, [...new Set(allCards.map(card => card.damagetype).filter(Boolean))].sort());

  const costs = [...new Set(allCards.map(card => card.cost).filter(cost => cost !== "" && cost !== null && cost !== undefined))]
    .sort((a, b) => Number(a) - Number(b));

  populateSelect(costFilter, costs);
}

function createTypeTabs() {
  const controls = document.querySelector(".controls");

  const existingTabs = document.getElementById("typeTabs");
  if (existingTabs) {
    existingTabs.remove();
  }

  const typeTabs = document.createElement("div");
  typeTabs.id = "typeTabs";
  typeTabs.className = "type-tabs";

  const types = [...new Set(allCards.map(card => card.type).filter(Boolean))].sort();
  const tabNames = ["All", ...types];

  tabNames.forEach(type => {
    const button = document.createElement("button");
    button.className = "type-tab";
    button.textContent = `${type} (${getTypeCount(type)})`;
    button.dataset.type = type;

    if (type === selectedTypeTab) {
      button.classList.add("active");
    }

    button.addEventListener("click", () => {
      selectedTypeTab = type;
      updateActiveTab();
      renderCards();
    });

    typeTabs.appendChild(button);
  });

  controls.appendChild(typeTabs);
}

function getTypeCount(type) {
  if (type === "All") {
    return allCards.length;
  }

  return allCards.filter(card => card.type === type).length;
}

function updateActiveTab() {
  document.querySelectorAll(".type-tab").forEach(button => {
    button.classList.toggle("active", button.dataset.type === selectedTypeTab);
  });
}
function updateTypeTabCounts() {
  const searchText = searchBox.value.toLowerCase();
  const selectedSet = setFilter.value;
  const selectedFaction = factionFilter.value;
  const selectedSubtype = subtypeFilter.value;
  const selectedDamageType = damageTypeFilter.value;
  const selectedCost = costFilter.value;

  document.querySelectorAll(".type-tab").forEach(button => {
    const type = button.dataset.type;

    const count = allCards.filter(card => {
      const searchableText = [
        card.name,
        card.type,
        card.faction,
        card.subtype,
        card.damagetype,
        card.cardtext,
        card.flavortext
      ]
        .join(" ")
        .toLowerCase();

      const searchMatch = searchableText.includes(searchText);
      const typeMatch = type === "All" || card.type === type;
      const setMatch = !selectedSet || card.setname === selectedSet;
      const factionMatch = !selectedFaction || card.faction === selectedFaction;
      const subtypeMatch = !selectedSubtype || card.subtype === selectedSubtype;
      const damageTypeMatch = !selectedDamageType || card.damagetype === selectedDamageType;
      const costMatch = !selectedCost || String(card.cost) === selectedCost;

      return searchMatch &&
        typeMatch &&
        setMatch &&
        factionMatch &&
        subtypeMatch &&
        damageTypeMatch &&
        costMatch;
    }).length;

    button.textContent = `${type} (${count})`;
  });
}

function renderCards() {
  const searchText = searchBox.value.toLowerCase();
  const selectedSet = setFilter.value;
  const selectedFaction = factionFilter.value;
  const selectedSubtype = subtypeFilter.value;
  const selectedDamageType = damageTypeFilter.value;
  const selectedCost = costFilter.value;

  const filteredCards = allCards.filter(card => {
    const searchableText = [
      card.name,
      card.type,
      card.faction,
      card.subtype,
      card.damagetype,
      card.cardtext,
      card.flavortext
    ]
      .join(" ")
      .toLowerCase();

    const searchMatch = searchableText.includes(searchText);
    const typeMatch = selectedTypeTab === "All" || card.type === selectedTypeTab;
    const setMatch = !selectedSet || card.setname === selectedSet;
    const factionMatch = !selectedFaction || card.faction === selectedFaction;
    const subtypeMatch = !selectedSubtype || card.subtype === selectedSubtype;
    const damageTypeMatch = !selectedDamageType || card.damagetype === selectedDamageType;
    const costMatch = !selectedCost || String(card.cost) === selectedCost;

    return searchMatch &&
      typeMatch &&
      setMatch &&
      factionMatch &&
      subtypeMatch &&
      damageTypeMatch &&
      costMatch;
  });

  filteredCards.sort((a, b) => {
    if ((a.cost || 0) !== (b.cost || 0)) {
      return (a.cost || 0) - (b.cost || 0);
    }

    return (a.name || "").localeCompare(b.name || "");
  });

  cardGrid.innerHTML = "";

  filteredCards.forEach(card => {
    const cardDiv = document.createElement("div");
    cardDiv.className = "card";

    const img = document.createElement("img");
    img.src = card.image;
    img.alt = card.name;
    img.loading = "lazy";

    img.onerror = function () {
        this.onerror = null;           // Prevent infinite retry loop
        this.src = "img/Reforged_CardBack.jpg";
};

    const name = document.createElement("div");
    name.className = "card-name";
    name.textContent = card.name;

    const details = document.createElement("div");
    details.className = "card-details";
    details.textContent = `${card.faction || ""} • Cost ${card.cost ?? ""} • Power ${card.power ?? ""}`;

    cardDiv.appendChild(img);
    cardDiv.appendChild(name);
    cardDiv.appendChild(details);

    cardDiv.addEventListener("click", () => addCardToDeck(card));

    cardDiv.addEventListener("mouseenter", () => {
      cardPreview.onerror = function () {
        this.onerror = null;
        this.src = "img/Reforged_CardBack.jpg";
      };
    
      cardPreview.src = card.image || "img/Reforged_CardBack.jpg";
      cardPreview.alt = card.name;
      cardPreview.style.display = "block";
    
      previewName.textContent = card.name;
    
      previewDetails.textContent =
        `${card.faction || ""} • ${card.type || ""} • Cost ${card.cost ?? ""} • Power ${card.power ?? ""}`;
    
      previewText.textContent = card.cardtext || "";
    });

    cardGrid.appendChild(cardDiv);
  });

  if (filteredCards.length === 0) {
    cardGrid.innerHTML = "<p>No cards match your filters.</p>";
  }
updateTypeTabCounts();

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

function clearFilters() {
  searchBox.value = "";
  setFilter.value = "";
  factionFilter.value = "";
  subtypeFilter.value = "";
  damageTypeFilter.value = "";
  costFilter.value = "";

  selectedTypeTab = "All";
  updateActiveTab();
  renderCards();
}

searchBox.addEventListener("input", renderCards);
setFilter.addEventListener("change", renderCards);
factionFilter.addEventListener("change", renderCards);
subtypeFilter.addEventListener("change", renderCards);
damageTypeFilter.addEventListener("change", renderCards);
costFilter.addEventListener("change", renderCards);
clearFiltersButton.addEventListener("click", clearFilters);

loadCards();
