  const FILTER_CONFIG = {
    set: {
      root: setFilter,
      button: setFilterButton,
      options: setFilterOptions,
      defaultLabel: "All Sets",
      pluralLabel: "Sets"
    },
    faction: {
      root: factionFilter,
      button: factionFilterButton,
      options: factionFilterOptions,
      defaultLabel: "All Factions",
      pluralLabel: "Factions"
    },
    subtype: {
      root: subtypeFilter,
      button: subtypeFilterButton,
      options: subtypeFilterOptions,
      defaultLabel: "All Subtypes",
      pluralLabel: "Subtypes"
    },
    damageType: {
      root: damageTypeFilter,
      button: damageTypeFilterButton,
      options: damageTypeFilterOptions,
      defaultLabel: "All Damage Types",
      pluralLabel: "Damage Types"
    },
    legendary: {
      root: legendaryFilter,
      button: legendaryFilterButton,
      options: legendaryFilterOptions,
      defaultLabel: "All Legendary",
      pluralLabel: "Legendary"
    },
    cost: {
      root: costFilter,
      button: costFilterButton,
      options: costFilterOptions,
      defaultLabel: "All Costs",
      pluralLabel: "Costs"
    }
  };

  function populateCheckboxFilter(filterKey, values) {
    const filter = FILTER_CONFIG[filterKey];
    filter.options.innerHTML = "";

    values.forEach(value => {
      const optionValue = typeof value === "object" ? value.value : value;
      const optionLabel = typeof value === "object" ? value.label : value;
      const label = document.createElement("label");
      label.className = "multi-select-option";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.name = `${filterKey}Filter`;
      checkbox.value = optionValue;
      checkbox.addEventListener("change", () => {
        updateFilterButtonText(filterKey);
        renderCards();
      });

      const text = document.createElement("span");
      text.textContent = optionLabel;

      label.appendChild(checkbox);
      label.appendChild(text);
      filter.options.appendChild(label);
    });
  }
  
  function populateFilters() {
    populateCheckboxFilter("set", [...new Set(allCards.map(card => card.setname).filter(Boolean))].sort());
    populateCheckboxFilter("faction", [...new Set(allCards
      .map(card => card.faction)
      .filter(faction => faction && faction !== "Universal"))].sort());
    populateCheckboxFilter("subtype", [...new Set(allCards.map(card => card.subtype).filter(Boolean))].sort());
    populateCheckboxFilter("damageType", [...new Set(allCards.map(card => card.damagetype).filter(Boolean))].sort());
    populateCheckboxFilter("legendary", [
      { value: "Y", label: "Legendary" },
      { value: "N", label: "Non-Legendary" }
    ]);
  
    const costs = [...new Set(allCards
      .filter(card => card.type !== "Hero")
      .map(card => card.cost)
      .filter(cost => cost !== "" && cost !== null && cost !== undefined))]
      .sort((a, b) => Number(a) - Number(b));
  
    populateCheckboxFilter("cost", costs);
    initializeCheckboxFilters();
  }

  function initializeCheckboxFilters() {
    Object.values(FILTER_CONFIG).forEach(filter => {
      if (filter.root.dataset.initialized === "true") return;

      filter.button.addEventListener("click", () => {
        const isOpen = filter.root.classList.toggle("open");
        filter.button.setAttribute("aria-expanded", String(isOpen));
      });

      filter.root.dataset.initialized = "true";
    });

    document.addEventListener("click", event => {
      Object.values(FILTER_CONFIG).forEach(filter => {
        if (filter.root.contains(event.target)) return;

        filter.root.classList.remove("open");
        filter.button.setAttribute("aria-expanded", "false");
      });
    });
  }

  function getSelectedFilterValues(filterKey) {
    return [...FILTER_CONFIG[filterKey].options.querySelectorAll("input:checked")]
      .map(input => input.value);
  }

  function updateFilterButtonText(filterKey) {
    const filter = FILTER_CONFIG[filterKey];
    const selectedValues = getSelectedFilterValues(filterKey);

    if (selectedValues.length === 0) {
      filter.button.textContent = filter.defaultLabel;
    } else if (selectedValues.length === 1) {
      const selectedInput = filter.options.querySelector("input:checked");
      filter.button.textContent = selectedInput.nextElementSibling.textContent;
    } else {
      filter.button.textContent = `${selectedValues.length} ${filter.pluralLabel}`;
    }
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
    const selectedSets = getSelectedFilterValues("set");
    const selectedFactions = getSelectedFilterValues("faction");
    const selectedSubtypes = getSelectedFilterValues("subtype");
    const selectedDamageTypes = getSelectedFilterValues("damageType");
    const selectedLegendaryValues = getSelectedFilterValues("legendary");
    const selectedCosts = getSelectedFilterValues("cost");
  
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
        const setMatch = selectedSets.length === 0 || selectedSets.includes(card.setname);
        const factionMatch = type === "Quest" ||
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
      }).length;
  
      button.textContent = `${type} (${count})`;
    });
  }

  function clearFilters() {
    searchBox.value = "";
    Object.keys(FILTER_CONFIG).forEach(filterKey => {
      FILTER_CONFIG[filterKey].options.querySelectorAll("input:checked").forEach(input => {
        input.checked = false;
      });
      updateFilterButtonText(filterKey);
    });
  
    selectedTypeTab = "All";
    updateActiveTab();
    renderCards();
  }
  
