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
  
