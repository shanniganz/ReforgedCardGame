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
  
  searchBox.addEventListener("input", renderCards);
  setFilter.addEventListener("change", renderCards);
  factionFilter.addEventListener("change", renderCards);
  subtypeFilter.addEventListener("change", renderCards);
  damageTypeFilter.addEventListener("change", renderCards);
  legendaryFilter.addEventListener("change", renderCards);
  costFilter.addEventListener("change", renderCards);
  clearFiltersButton.addEventListener("click", clearFilters);

  deckListTab.addEventListener("click", () => showDeckTab("list"));
  deckSummaryTab.addEventListener("click", () => showDeckTab("summary"));

  renderDeck();
  
  loadCards();
