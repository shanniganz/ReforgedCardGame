const DECK_SUMMARY_TYPES = [
  { label: "Ashen", type: "ashen" },
  { label: "Spells", type: "spell" },
  { label: "Relics", type: "relic" },
  { label: "Relic Weapons", type: "relic weapon" }
];

function showDeckTab(tabName) {
  const showSummary = tabName === "summary";

  deckListTab.classList.toggle("active", !showSummary);
  deckSummaryTab.classList.toggle("active", showSummary);
  deckListTab.setAttribute("aria-selected", String(!showSummary));
  deckSummaryTab.setAttribute("aria-selected", String(showSummary));

  deckListPanel.classList.toggle("active", !showSummary);
  deckSummaryPanel.classList.toggle("active", showSummary);
}

function renderDeckSummary(deckEntries) {
  if (!deckSummary) return;

  const totalCards = getDeckSummaryTotalCount(deckEntries);

  if (deckEntries.length === 0) {
    deckSummary.innerHTML = '<p class="deck-empty">No cards in deck yet.</p>';
    return;
  }

  const typeCounts = getDeckSummaryTypeCounts(deckEntries);
  const costCounts = getDeckCostCounts(deckEntries);

  deckSummary.innerHTML = "";
  deckSummary.appendChild(createDeckTypeSummary(typeCounts));
  deckSummary.appendChild(createCostCurve(costCounts));
}

function getDeckSummaryTotalCount(deckEntries) {
  return deckEntries.reduce((total, entry) => {
    const cardType = getCardType(entry.card);
    return cardType === "hero" || cardType === "quest" ? total : total + entry.count;
  }, 0);
}

function getDeckSummaryTypeCounts(deckEntries) {
  const typeCounts = DECK_SUMMARY_TYPES.map(summaryType => {
    const count = deckEntries.reduce((total, entry) => {
      return getCardType(entry.card) === summaryType.type ? total + entry.count : total;
    }, 0);

    return {
      label: summaryType.label,
      count
    };
  });

  return [
    ...typeCounts,
    { label: "Total Cards", count: getDeckSummaryTotalCount(deckEntries) }
  ];
}

function getDeckCostCounts(deckEntries) {
  const costCounts = new Map();

  deckEntries.forEach(entry => {
    const cardType = getCardType(entry.card);
    if (cardType === "hero" || cardType === "quest") {
      return;
    }

    const normalizedCost = normalizeCardCost(entry.card.cost);
    costCounts.set(normalizedCost, (costCounts.get(normalizedCost) || 0) + entry.count);
  });

  return [...costCounts.entries()].sort((a, b) => {
    if (a[0] === "X") return 1;
    if (b[0] === "X") return -1;

    return Number(a[0]) - Number(b[0]);
  });
}

function normalizeCardCost(cost) {
  if (cost === "" || cost === null || cost === undefined) {
    return "X";
  }

  const numericCost = Number(cost);
  return Number.isFinite(numericCost) ? String(numericCost) : "X";
}

function createDeckTypeSummary(typeCounts) {
  const section = document.createElement("section");
  section.className = "deck-summary-section";

  const heading = document.createElement("h3");
  heading.textContent = "Card Types";
  section.appendChild(heading);

  const list = document.createElement("div");
  list.className = "deck-type-summary";

  typeCounts.forEach(typeCount => {
    const item = document.createElement("div");
    item.className = "deck-type-count";

    const label = document.createElement("span");
    label.textContent = typeCount.label;

    const count = document.createElement("strong");
    count.textContent = typeCount.count;

    item.appendChild(label);
    item.appendChild(count);
    list.appendChild(item);
  });

  section.appendChild(list);
  return section;
}

function createCostCurve(costCounts) {
  const section = document.createElement("section");
  section.className = "deck-summary-section";

  const heading = document.createElement("h3");
  heading.textContent = "Cost Curve";
  section.appendChild(heading);

  const chart = document.createElement("div");
  chart.className = "cost-curve";

  if (costCounts.length === 0) {
    chart.innerHTML = '<p class="deck-empty">No costed cards in deck yet.</p>';
    section.appendChild(chart);
    return section;
  }

  const maxCount = Math.max(...costCounts.map(([, count]) => count));

  costCounts.forEach(([cost, count]) => {
    const row = document.createElement("div");
    row.className = "cost-row";

    const label = document.createElement("span");
    label.className = "cost-label";
    label.textContent = cost;

    const track = document.createElement("div");
    track.className = "cost-track";

    const bar = document.createElement("div");
    bar.className = "cost-bar";
    bar.style.width = `${Math.max((count / maxCount) * 100, 6)}%`;

    const value = document.createElement("span");
    value.className = "cost-value";
    value.textContent = count;

    track.appendChild(bar);
    row.appendChild(label);
    row.appendChild(track);
    row.appendChild(value);
    chart.appendChild(row);
  });

  section.appendChild(chart);
  return section;
}
