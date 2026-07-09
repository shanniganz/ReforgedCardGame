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
  