function showCardPreview(card) {
  cardPreview.onerror = function () {
    this.onerror = null;
    this.src = FALLBACK_IMAGE;
  };

  cardPreview.src = card.image || FALLBACK_IMAGE;
  cardPreview.alt = card.name;
  cardPreview.style.display = "block";

  previewName.textContent = card.name;
  previewDetails.textContent =
    `${card.faction || ""} • Cost ${card.cost ?? ""}`;
  previewText.textContent = card.cardtext || "";
}
