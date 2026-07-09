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

  function getTypeCount(type) {
    if (type === "All") {
      return allCards.length;
    }
  
    return allCards.filter(card => card.type === type).length;
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
  