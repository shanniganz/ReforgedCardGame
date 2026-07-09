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
const clearDeckButton = document.getElementById("clearDeckButton");
const copyDeckButton = document.getElementById("copyDeckButton");

const searchBox = document.getElementById("searchBox");
const setFilter = document.getElementById("setFilter");
const setFilterButton = document.getElementById("setFilterButton");
const setFilterOptions = document.getElementById("setFilterOptions");
const factionFilter = document.getElementById("factionFilter");
const factionFilterButton = document.getElementById("factionFilterButton");
const factionFilterOptions = document.getElementById("factionFilterOptions");
const subtypeFilter = document.getElementById("subtypeFilter");
const subtypeFilterButton = document.getElementById("subtypeFilterButton");
const subtypeFilterOptions = document.getElementById("subtypeFilterOptions");
const damageTypeFilter = document.getElementById("damageTypeFilter");
const damageTypeFilterButton = document.getElementById("damageTypeFilterButton");
const damageTypeFilterOptions = document.getElementById("damageTypeFilterOptions");
const legendaryFilter = document.getElementById("legendaryFilter");
const legendaryFilterButton = document.getElementById("legendaryFilterButton");
const legendaryFilterOptions = document.getElementById("legendaryFilterOptions");
const costFilter = document.getElementById("costFilter");
const costFilterButton = document.getElementById("costFilterButton");
const costFilterOptions = document.getElementById("costFilterOptions");
const clearFiltersButton = document.getElementById("clearFiltersButton");

const cardPreview = document.getElementById("cardPreview");
const previewName = document.getElementById("previewName");
const previewDetails = document.getElementById("previewDetails");
const previewText = document.getElementById("previewText");
