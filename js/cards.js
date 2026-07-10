function renderCards() {
    const searchText = searchBox.value.toLowerCase();
    const selectedSets = getSelectedFilterValues("set");
    const selectedFactions = getSelectedFilterValues("faction");
    const selectedSubtypes = getSelectedFilterValues("subtype");
    const selectedDamageTypes = getSelectedFilterValues("damageType");
    const selectedLegendaryValues = getSelectedFilterValues("legendary");
    const selectedCosts = getSelectedFilterValues("cost");
  
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
      const setMatch = selectedSets.length === 0 || selectedSets.includes(card.setname);
      const factionMatch = selectedTypeTab === "Quest" ||
        selectedFactions.length === 0 ||
        selectedFactions.includes(card.faction);
      const subtypeMatch = selectedSubtypes.length === 0 || selectedSubtypes.includes(card.subtype);
      const damageTypeMatch = selectedDamageTypes.length === 0 || selectedDamageTypes.includes(card.damagetype);
      const legendaryMatch = selectedLegendaryValues.length === 0 || selectedLegendaryValues.includes(card.legendary);
      const costMatch = selectedCosts.length === 0 || selectedCosts.includes(String(card.cost));
  
      return searchMatch &&
        typeMatch &&
        setMatch &&
        factionMatch &&
        subtypeMatch &&
        damageTypeMatch &&
        legendaryMatch &&
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
        this.onerror = null;
        this.src = FALLBACK_IMAGE;
      };
  
      const name = document.createElement("div");
      name.className = "card-name";
      name.textContent = card.name;
  
      const details = document.createElement("div");
      details.className = "card-details";
      details.textContent = `${card.faction || ""} • Cost ${card.cost ?? ""}`;
  
      cardDiv.appendChild(img);
      cardDiv.appendChild(name);
      cardDiv.appendChild(details);
  
      cardDiv.addEventListener("click", () => addCardToDeck(card));
  
      cardDiv.addEventListener("mouseenter", () => showCardPreview(card));
  
      cardGrid.appendChild(cardDiv);
    });
  
    if (filteredCards.length === 0) {
      cardGrid.innerHTML = "<p>No cards match your filters.</p>";
    }
  updateTypeTabCounts();
  
  }
