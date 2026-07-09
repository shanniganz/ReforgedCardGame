const ALIGNMENT_FACTIONS = ["order", "chaos"];
const REALM_FACTIONS = ["ashkara", "orilune", "jungoom", "naleri", "thaloryn", "eldrik"];
const DECK_TYPE_SECTIONS = [
  { label: "Hero", heading: "---HERO---", type: "hero" },
  { label: "Quest", heading: "---QUEST---", type: "quest" },
  { label: "Ashen", heading: "---ASHEN---", type: "ashen" },
  { label: "Spells", heading: "---SPELLS---", type: "spell" },
  { label: "Relics", heading: "---RELICS---", type: "relic" },
  { label: "Relic Weapons", heading: "---RELIC WEAPONS---", type: "relic weapon" }
];

function addCardToDeck(card) {
    const limitMessage = getDeckLimitMessage(card);
    if (limitMessage) {
      showDeckMessage(limitMessage);
      return;
    }

    if (!deck[card.id]) {
      deck[card.id] = {
        card: card,
        count: 0
      };
    }
  
    deck[card.id].count++;
    clearDeckMessage();
    renderDeck();
  }

  function getDeckLimitMessage(card) {
    const cardType = getCardType(card);
    const currentCount = deck[card.id]?.count || 0;

    if (cardType === "hero" && getDeckTypeCount("hero") >= 1) {
      return "A deck can only include 1 Hero.";
    }

    if (cardType === "quest" && getDeckTypeCount("quest") >= 1) {
      return "A deck can only include 1 Quest.";
    }

    const factionMessage = getDeckFactionLimitMessage(card);
    if (factionMessage) {
      return factionMessage;
    }

    if (card.legendary === "Y" && currentCount >= 1) {
      return "A deck can only include 1 copy of a legendary card.";
    }

    if (card.legendary !== "Y" && currentCount >= 3) {
      return "A deck can only include 3 copies of a non-legendary card.";
    }

    return "";
  }

  function getCardType(card) {
    return String(card.type || "").trim().toLowerCase();
  }

  function getDeckTypeCount(type) {
    return Object.values(deck).reduce((total, entry) => {
      return getCardType(entry.card) === type ? total + entry.count : total;
    }, 0);
  }

  function getDeckFactionLimitMessage(card) {
    const cardFaction = getCardFaction(card);
    const selectedAlignmentFaction = getSelectedDeckFaction(ALIGNMENT_FACTIONS);
    const selectedRealmFaction = getSelectedDeckFaction(REALM_FACTIONS);

    if (
      ALIGNMENT_FACTIONS.includes(cardFaction) &&
      selectedAlignmentFaction &&
      selectedAlignmentFaction !== cardFaction
    ) {
      return `A deck can include either ${formatFactionName(selectedAlignmentFaction)} or ${formatFactionName(cardFaction)}, not both.`;
    }

    if (
      REALM_FACTIONS.includes(cardFaction) &&
      selectedRealmFaction &&
      selectedRealmFaction !== cardFaction
    ) {
      return `A deck can only include one realm faction. This deck is already using ${formatFactionName(selectedRealmFaction)}.`;
    }

    return "";
  }

  function getCardFaction(card) {
    return String(card.faction || "").trim().toLowerCase();
  }

  function getSelectedDeckFaction(factions) {
    const deckEntry = Object.values(deck).find(entry => factions.includes(getCardFaction(entry.card)));
    return deckEntry ? getCardFaction(deckEntry.card) : "";
  }

  function formatFactionName(faction) {
    return faction.charAt(0).toUpperCase() + faction.slice(1);
  }

  function showDeckMessage(message) {
    if (!deckMessage) return;

    deckMessage.textContent = message;
    deckMessage.classList.add("show");
  }

  function clearDeckMessage() {
    if (!deckMessage) return;

    deckMessage.textContent = "";
    deckMessage.classList.remove("show");
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
  
    DECK_TYPE_SECTIONS.forEach(section => {
      const sectionEntries = deckEntries.filter(entry => getCardType(entry.card) === section.type);

      if (sectionEntries.length === 0) {
        return;
      }

      deckList.appendChild(createDeckListHeader(section.label));

      sectionEntries.forEach(entry => {
        totalCards += entry.count;
        deckList.appendChild(createDeckRow(entry));
      });
    });
  
    deckCount.textContent = totalCards;
  
    deckExport.value = formatDeckExport(deckEntries);

    renderDeckIdentity();
    renderDeckSummary(deckEntries);
  }

  function renderDeckIdentity() {
    if (!deckIdentity) return;

    const alignmentFaction = getSelectedDeckFaction(ALIGNMENT_FACTIONS);
    const realmFaction = getSelectedDeckFaction(REALM_FACTIONS);
    const badges = [];

    if (realmFaction) {
      badges.push(createDeckIdentityBadge("Faction", formatFactionName(realmFaction)));
    }

    if (alignmentFaction) {
      badges.push(createDeckIdentityBadge("Alignment", formatFactionName(alignmentFaction)));
    }

    deckIdentity.innerHTML = "";
    badges.forEach(badge => deckIdentity.appendChild(badge));
    deckIdentity.classList.toggle("show", badges.length > 0);
  }

  function createDeckIdentityBadge(label, value) {
    const badge = document.createElement("div");
    badge.className = "deck-identity-badge";

    const labelElement = document.createElement("span");
    labelElement.textContent = `${label}:`;

    badge.appendChild(labelElement);
    badge.append(value);

    return badge;
  }

  function createDeckListHeader(label) {
    const header = document.createElement("div");
    header.className = "deck-list-header";
    header.textContent = label;

    return header;
  }

  function createDeckRow(entry) {
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

    return row;
  }

  function formatDeckExport(deckEntries) {
    return DECK_TYPE_SECTIONS
      .map(section => {
        const sectionEntries = deckEntries.filter(entry => getCardType(entry.card) === section.type);

        if (sectionEntries.length === 0) {
          return "";
        }

        return [
          section.heading,
          ...sectionEntries.map(entry => `${entry.count} ${entry.card.name}`)
        ].join("\n");
      })
      .filter(Boolean)
      .join("\n\n");
  }
  
