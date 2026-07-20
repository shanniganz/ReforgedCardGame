const ALIGNMENT_FACTIONS = ["order", "chaos"];
const REALM_FACTIONS = ["ashkara", "orilune", "jungoom", "naleri", "thaloryn", "eldrik"];
const ANVIL_PDF_CARDS = {
  order: { name: "Anvil of Order", image: "img/AnvilofOrder.webp", type: "anvil" },
  chaos: { name: "Anvil of Chaos", image: "img/AnvilofChaos.webp", type: "anvil" }
};
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

  function addVisibleCardsToDeck() {
    if (visibleCards.length === 0) {
      showDeckMessage("No visible cards to add.");
      return;
    }

    let addedCount = 0;

    visibleCards.forEach(card => {
      if (deck[card.id]) {
        return;
      }

      deck[card.id] = {
        card,
        count: 1
      };
      addedCount++;
    });

    renderDeck();
    showDeckMessage(`Added ${addedCount} visible card${addedCount === 1 ? "" : "s"} as single copies.`);
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

  function clearDeck() {
    deck = {};
    renderDeck();
    showDeckMessage("Deck cleared.");
  }

  async function copyDeckExport() {
    const exportText = deckExport.value;

    if (!exportText) {
      showDeckMessage("There is no deck text to copy.");
      return;
    }

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(exportText);
      } else {
        copyTextWithFallback(exportText);
      }

      showDeckMessage("Deck export copied to clipboard.");
    } catch (error) {
      console.error(error);
      showDeckMessage("Could not copy deck export.");
    }
  }

  function copyTextWithFallback(text) {
    deckExport.focus();
    deckExport.select();

    const copied = document.execCommand("copy");
    window.getSelection().removeAllRanges();

    if (!copied) {
      throw new Error("Clipboard copy failed");
    }
  }

  async function copyDeckCode() {
    const deckCodeText = createDeckCode();

    if (!deckCodeText) {
      showDeckMessage("There is no deck to export.");
      return;
    }

    deckCode.value = deckCodeText;

    try {
      await copyTextToClipboard(deckCodeText, deckCode);
      showDeckMessage("Deck code copied to clipboard.");
    } catch (error) {
      console.error(error);
      showDeckMessage("Deck code created, but could not copy it.");
    }
  }

  function createDeckCode() {
    const payload = createDeckPayload();

    if (!payload) {
      return "";
    }

    return encodeDeckCode(payload);
  }

  function createDeckPayload() {
    const deckEntries = Object.values(deck).sort((a, b) =>
      a.card.name.localeCompare(b.card.name)
    );

    if (deckEntries.length === 0) {
      return null;
    }

    return {
      v: 1,
      cards: deckEntries.map(entry => [entry.card.name, entry.count]),
      anvil: getSelectedAnvilValue()
    };
  }

  function importDeckCode() {
    const code = deckCode.value.trim();

    if (!code) {
      showDeckMessage("Paste a deck code before importing.");
      return;
    }

    let payload;
    try {
      payload = decodeDeckCode(code);
    } catch (error) {
      console.error(error);
      showDeckMessage("Deck code could not be decoded.");
      return;
    }

    if (!payload || payload.v !== 1 || !Array.isArray(payload.cards)) {
      showDeckMessage("Deck code format is not recognized.");
      return;
    }

    const result = loadDeckPayload(payload);
    showDeckMessage(formatDeckLoadMessage("Deck code imported.", result));
  }

  function loadDeckPayload(payload) {
    const cardsByName = getCardsByName();
    const importedDeck = {};
    const missingNames = [];
    const duplicateNames = [];

    payload.cards.forEach(([name, count]) => {
      const matches = cardsByName.get(name);
      const parsedCount = Number(count);

      if (!matches || matches.length === 0) {
        missingNames.push(name);
        return;
      }

      if (!Number.isInteger(parsedCount) || parsedCount <= 0) {
        return;
      }

      if (matches.length > 1) {
        duplicateNames.push(name);
      }

      const card = matches[0];
      importedDeck[card.id] = {
        card,
        count: parsedCount
      };
    });

    deck = importedDeck;
    setSelectedAnvilValue(payload.anvil || "none");
    renderDeck();

    return { missingNames, duplicateNames };
  }

  function formatDeckLoadMessage(baseMessage, result) {
    const messages = [baseMessage];
    if (result.missingNames.length > 0) {
      messages.push(`Missing: ${result.missingNames.join(", ")}`);
    }
    if (result.duplicateNames.length > 0) {
      messages.push(`Duplicate names used first match: ${result.duplicateNames.join(", ")}`);
    }

    return messages.join(" ");
  }

  function getCardsByName() {
    return allCards.reduce((cardsByName, card) => {
      if (!cardsByName.has(card.name)) {
        cardsByName.set(card.name, []);
      }

      cardsByName.get(card.name).push(card);
      return cardsByName;
    }, new Map());
  }

  function encodeDeckCode(payload) {
    const json = JSON.stringify(payload);
    return btoa(unescape(encodeURIComponent(json)));
  }

  function decodeDeckCode(code) {
    const json = decodeURIComponent(escape(atob(code)));
    return JSON.parse(json);
  }

  async function copyTextToClipboard(text, fallbackElement) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }

    fallbackElement.focus();
    fallbackElement.select();

    const copied = document.execCommand("copy");
    window.getSelection().removeAllRanges();

    if (!copied) {
      throw new Error("Clipboard copy failed");
    }
  }

  function openCardPdfExport() {
    const cardCopies = getDeckCardCopies();
    const anvilCard = getSelectedAnvilCard();

    if (anvilCard) {
      cardCopies.push(anvilCard);
    }

    if (cardCopies.length === 0) {
      showDeckMessage("Add cards to the deck before exporting card images.");
      return;
    }

    const exportWindow = window.open("", "_blank");
    if (!exportWindow) {
      showDeckMessage("Allow popups to export card images.");
      return;
    }

    exportWindow.document.open();
    exportWindow.document.write(createCardPdfExportHtml(cardCopies));
    exportWindow.document.close();
  }

  function getDeckCardCopies() {
    return Object.values(deck)
      .sort((a, b) => a.card.name.localeCompare(b.card.name))
      .flatMap(entry => Array.from({ length: entry.count }, () => entry.card));
  }

  function getSelectedAnvilCard() {
    return ANVIL_PDF_CARDS[getSelectedAnvilValue()] || null;
  }

  function getSelectedAnvilValue() {
    const selectedOption = Array.from(anvilOptions).find(option => option.checked);
    return selectedOption?.value || "none";
  }

  function setSelectedAnvilValue(value) {
    const normalizedValue = ANVIL_PDF_CARDS[value] ? value : "none";
    anvilOptions.forEach(option => {
      option.checked = option.value === normalizedValue;
    });
  }

  function createCardPdfExportHtml(cards) {
    const pages = [];

    for (let index = 0; index < cards.length; index += 9) {
      pages.push(cards.slice(index, index + 9));
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Reforged Deck Card PDF</title>
  <base href="${escapeHtml(getBaseUrl())}">
  <style>
    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      background: #eee;
      font-family: Arial, Helvetica, sans-serif;
    }

    .toolbar {
      position: sticky;
      top: 0;
      z-index: 10;
      display: flex;
      justify-content: center;
      gap: 8px;
      padding: 10px;
      background: #222;
    }

    .toolbar button {
      padding: 8px 12px;
      border: 1px solid #777;
      border-radius: 6px;
      background: white;
      color: #222;
      font-weight: bold;
      cursor: pointer;
    }

    .page {
      --card-width: 230px;
      --card-height: 325px;
      --card-gap: 2px;
      --grid-width: calc((var(--card-width) * 3) + (var(--card-gap) * 2));
      --grid-height: calc((var(--card-height) * 3) + (var(--card-gap) * 2));
      --grid-left: calc((100% - var(--grid-width)) / 2);
      --grid-top: calc((100% - var(--grid-height)) / 2);
      --gutter-one-x: calc(var(--grid-left) + var(--card-width));
      --gutter-two-x: calc(var(--grid-left) + (var(--card-width) * 2) + var(--card-gap));
      --gutter-one-y: calc(var(--grid-top) + var(--card-height));
      --gutter-two-y: calc(var(--grid-top) + (var(--card-height) * 2) + var(--card-gap));
      position: relative;
      display: grid;
      grid-template-columns: repeat(3, var(--card-width));
      grid-template-rows: repeat(3, var(--card-height));
      gap: var(--card-gap);
      justify-content: center;
      align-content: center;
      width: 816px;
      min-height: 1056px;
      margin: 16px auto;
      background: white;
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
      page-break-after: always;
      break-after: page;
    }

    .page:last-child {
      page-break-after: auto;
      break-after: auto;
    }

    .card-slot {
      width: 230px;
      height: 325px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      background: white;
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }

    .card-image {
      width: 230px;
      height: 325px;
      object-fit: fill;
      display: block;
    }

    .card-slot.rotated .card-image {
      width: 325px;
      height: 230px;
      transform: rotate(90deg);
      transform-origin: center;
    }

    .registration-mark {
      position: absolute;
      z-index: 2;
      background: black;
      pointer-events: none;
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }

    .registration-mark.vertical {
      width: 2px;
      height: 10px;
    }

    .registration-mark.horizontal {
      width: 10px;
      height: 2px;
    }

    .registration-mark.top {
      top: calc(var(--grid-top) - 10px);
    }

    .registration-mark.bottom {
      top: calc(var(--grid-top) + var(--grid-height));
    }

    .registration-mark.v-one {
      left: var(--gutter-one-x);
    }

    .registration-mark.v-two {
      left: var(--gutter-two-x);
    }

    .registration-mark.v-left {
      left: var(--grid-left);
    }

    .registration-mark.v-right {
      left: calc(var(--grid-left) + var(--grid-width) - 2px);
    }

    .registration-mark.left {
      left: calc(var(--grid-left) - 10px);
    }

    .registration-mark.right {
      left: calc(var(--grid-left) + var(--grid-width));
    }

    .registration-mark.h-one {
      top: var(--gutter-one-y);
    }

    .registration-mark.h-two {
      top: var(--gutter-two-y);
    }

    .registration-mark.h-top {
      top: var(--grid-top);
    }

    .registration-mark.h-bottom {
      top: calc(var(--grid-top) + var(--grid-height) - 2px);
    }

    @page {
      size: letter portrait;
      margin: 0;
    }

    @media print {
      html,
      body {
        width: 8.5in;
        min-height: 11in;
        background: white;
      }

      .toolbar {
        display: none;
      }

      .page {
        width: 8.5in;
        height: 11in;
        min-height: 11in;
        margin: 0;
        box-shadow: none;
        overflow: hidden;
      }
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <button type="button" onclick="window.print()">Print / Save PDF</button>
  </div>
  ${pages.map(createCardPdfPageHtml).join("")}
</body>
</html>`;
  }

  function createCardPdfPageHtml(cards) {
    return `<section class="page">${cards.map(card => `
    <div class="card-slot${getCardType(card) === "quest" ? " rotated" : ""}">
      <img class="card-image" src="${escapeHtml(card.image || FALLBACK_IMAGE)}" alt="${escapeHtml(card.name || "Card")}">
    </div>`).join("")}
    ${createRegistrationMarksHtml()}
  </section>`;
  }

  function createRegistrationMarksHtml() {
    return `
    <span class="registration-mark vertical top v-one"></span>
    <span class="registration-mark vertical top v-two"></span>
    <span class="registration-mark vertical top v-left"></span>
    <span class="registration-mark vertical top v-right"></span>
    <span class="registration-mark vertical bottom v-one"></span>
    <span class="registration-mark vertical bottom v-two"></span>
    <span class="registration-mark vertical bottom v-left"></span>
    <span class="registration-mark vertical bottom v-right"></span>
    <span class="registration-mark horizontal left h-one"></span>
    <span class="registration-mark horizontal left h-two"></span>
    <span class="registration-mark horizontal left h-top"></span>
    <span class="registration-mark horizontal left h-bottom"></span>
    <span class="registration-mark horizontal right h-one"></span>
    <span class="registration-mark horizontal right h-two"></span>
    <span class="registration-mark horizontal right h-top"></span>
    <span class="registration-mark horizontal right h-bottom"></span>`;
  }

  function getBaseUrl() {
    return new URL(".", window.location.href).href;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
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

      const sectionCount = sectionEntries.reduce((sum, entry) => sum + entry.count, 0);
      if (section.type !== "hero" && section.type !== "quest") {
        totalCards += sectionCount;
      }

      deckList.appendChild(createDeckListHeader(section.label, sectionCount));

      sectionEntries.forEach(entry => {
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

  function createDeckListHeader(label, count) {
    const header = document.createElement("div");
    header.className = "deck-list-header";
    header.textContent = `${label} - (${count})`;

    return header;
  }

  function createDeckRow(entry) {
    const row = document.createElement("div");
    row.className = "deck-row";

    const cardText = document.createElement("span");
    cardText.className = "deck-card-name";
    cardText.textContent = `${entry.count}x ${entry.card.name}`;
    cardText.addEventListener("mouseenter", () => showCardPreview(entry.card));

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
  
