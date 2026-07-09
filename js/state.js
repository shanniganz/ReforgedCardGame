let allCards = [];
let deck = {};
let selectedTypeTab = "All";

const FALLBACK_IMAGE = "img/Reforged_CardBack.jpg";

const cardGrid = document.getElementById("cardGrid");
const deckList = document.getElementById("deckList");
const deckCount = document.getElementById("deckCount");
const deckExport = document.getElementById("deckExport");
const deckIdentity = document.getElementById("deckIdentity");
const deckMessage = document.getElementById("deckMessage");
const deckListTab = document.getElementById("deckListTab");
const deckSummaryTab = document.getElementById("deckSummaryTab");
const deckListPanel = document.getElementById("deckListPanel");
const deckSummaryPanel = document.getElementById("deckSummaryPanel");
const deckSummary = document.getElementById("deckSummary");

const searchBox = document.getElementById("searchBox");
const setFilter = document.getElementById("setFilter");
const factionFilter = document.getElementById("factionFilter");
const subtypeFilter = document.getElementById("subtypeFilter");
const damageTypeFilter = document.getElementById("damageTypeFilter");
const legendaryFilter = document.getElementById("legendaryFilter");
const costFilter = document.getElementById("costFilter");
const clearFiltersButton = document.getElementById("clearFiltersButton");

const cardPreview = document.getElementById("cardPreview");
const previewName = document.getElementById("previewName");
const previewDetails = document.getElementById("previewDetails");
const previewText = document.getElementById("previewText");
