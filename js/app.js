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
  clearFiltersButton.addEventListener("click", clearFilters);
  addVisibleCardsButton.addEventListener("click", addVisibleCardsToDeck);

  deckListTab.addEventListener("click", () => showDeckTab("list"));
  deckSummaryTab.addEventListener("click", () => showDeckTab("summary"));
  clearDeckButton.addEventListener("click", clearDeck);
  copyDeckButton.addEventListener("click", copyDeckExport);
  cardPdfButton.addEventListener("click", openCardPdfExport);
  copyDeckCodeButton.addEventListener("click", copyDeckCode);
  importDeckCodeButton.addEventListener("click", importDeckCode);

  renderDeck();
  
  loadCards();
