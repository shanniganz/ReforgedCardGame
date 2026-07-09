function renderCards() {
    const searchText = searchBox.value.toLowerCase();
    const selectedSet = setFilter.value;
    const selectedFaction = factionFilter.value;
    const selectedSubtype = subtypeFilter.value;
    const selectedDamageType = damageTypeFilter.value;
    const selectedLegendary = legendaryFilter.value;
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
      const legendaryMatch = !selectedLegendary || card.legendary === selectedLegendary;
      const costMatch = !selectedCost || String(card.cost) === selectedCost;
  
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
      details.textContent = `${card.faction || ""} • Cost ${card.cost ?? ""} • Power ${card.power ?? ""}`;
  
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
