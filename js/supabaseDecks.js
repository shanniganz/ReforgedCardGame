const SUPABASE_URL = "https://nvzwwpeoppimnxnnkajj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_bjDruzKxnslAe6TLIUDKNQ_sm80FHEA";

let supabaseClient = null;
let currentUser = null;
let savedDecks = [];
let isPasswordRecoveryMode = false;

function initializeSupabaseDecks() {
  if (!window.supabase) {
    showDeckMessage("Supabase could not load. Check your connection.");
    return;
  }

  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

  signInButton.addEventListener("click", signInWithSupabase);
  signUpButton.addEventListener("click", signUpWithSupabase);
  forgotPasswordButton.addEventListener("click", sendPasswordResetEmail);
  signOutButton.addEventListener("click", signOutWithSupabase);
  resetPasswordButton.addEventListener("click", resetPasswordWithSupabase);
  saveDeckButton.addEventListener("click", saveDeckToSupabase);
  loadDeckButton.addEventListener("click", loadSelectedDeckFromSupabase);
  deleteDeckButton.addEventListener("click", deleteSelectedDeckFromSupabase);
  savedDeckSelect.addEventListener("change", syncSelectedSavedDeck);

  supabaseClient.auth.onAuthStateChange((event, session) => {
    if (event === "PASSWORD_RECOVERY") {
      isPasswordRecoveryMode = true;
      window.location.hash = "my-decks";
      showAppView("my-decks");
      showDeckMessage("Enter a new password to finish resetting your account.");
    }

    currentUser = session?.user || null;
    updateAuthDisplay();
    refreshSavedDecks();
  });

  loadInitialSupabaseSession();
}

async function loadInitialSupabaseSession() {
  const { data, error } = await supabaseClient.auth.getSession();

  if (error) {
    console.error(error);
    showDeckMessage("Could not check saved deck sign-in status.");
    return;
  }

  currentUser = data.session?.user || null;
  updateAuthDisplay();
  refreshSavedDecks();
}

async function signInWithSupabase() {
  const email = authEmail.value.trim();
  const password = authPassword.value;

  if (!email || !password) {
    showDeckMessage("Enter an email and password to sign in.");
    return;
  }

  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });

  if (error) {
    console.error(error);
    showDeckMessage(error.message);
    return;
  }

  authPassword.value = "";
  showDeckMessage("Signed in.");
}

async function signUpWithSupabase() {
  const email = authEmail.value.trim();
  const password = authPassword.value;

  if (!email || !password) {
    showDeckMessage("Enter an email and password to sign up.");
    return;
  }

  const { error } = await supabaseClient.auth.signUp({ email, password });

  if (error) {
    console.error(error);
    showDeckMessage(error.message);
    return;
  }

  authPassword.value = "";
  showDeckMessage("Sign-up submitted. Check your email if confirmation is enabled.");
}

async function sendPasswordResetEmail() {
  const email = authEmail.value.trim();

  if (!email) {
    showDeckMessage("Enter your email address before requesting a password reset.");
    return;
  }

  const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
    redirectTo: getPasswordResetRedirectUrl()
  });

  if (error) {
    console.error(error);
    showDeckMessage(error.message);
    return;
  }

  showDeckMessage("Password reset email sent.");
}

async function resetPasswordWithSupabase() {
  const password = newPassword.value;

  if (!password) {
    showDeckMessage("Enter a new password.");
    return;
  }

  const { error } = await supabaseClient.auth.updateUser({ password });

  if (error) {
    console.error(error);
    showDeckMessage(error.message);
    return;
  }

  isPasswordRecoveryMode = false;
  newPassword.value = "";
  updateAuthDisplay();
  showDeckMessage("Password reset. You are signed in with the new password.");
}

async function signOutWithSupabase() {
  const { error } = await supabaseClient.auth.signOut();

  if (error) {
    console.error(error);
    showDeckMessage(error.message);
    return;
  }

  showDeckMessage("Signed out.");
}

function updateAuthDisplay() {
  const isSignedIn = Boolean(currentUser);

  authStatus.textContent = isSignedIn ? currentUser.email : "Signed out";
  signOutButton.hidden = !isSignedIn;
  signInButton.hidden = isSignedIn;
  signUpButton.hidden = isSignedIn;
  forgotPasswordButton.hidden = isSignedIn;
  authEmail.hidden = isSignedIn;
  authPassword.hidden = isSignedIn;
  passwordResetPanel.hidden = !isPasswordRecoveryMode;
  saveDeckButton.disabled = !isSignedIn;
  loadDeckButton.disabled = !isSignedIn;
  deleteDeckButton.disabled = !isSignedIn;
  savedDeckSelect.disabled = !isSignedIn;
}

function getPasswordResetRedirectUrl() {
  const url = new URL(window.location.href);
  url.hash = "my-decks";
  return url.toString();
}

async function refreshSavedDecks() {
  savedDecks = [];
  savedDeckSelect.innerHTML = '<option value="">Saved decks</option>';

  if (!currentUser) {
    deckNameInput.value = "";
    return;
  }

  const { data, error } = await supabaseClient
    .from("decks")
    .select("id,name,deck_code,cards,anvil,updated_at")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error(error);
    showDeckMessage(error.message);
    return;
  }

  savedDecks = data || [];
  savedDecks.forEach(savedDeck => {
    const option = document.createElement("option");
    option.value = savedDeck.id;
    option.textContent = savedDeck.name;
    savedDeckSelect.appendChild(option);
  });
}

function syncSelectedSavedDeck() {
  const savedDeck = getSelectedSavedDeck();
  deckNameInput.value = savedDeck?.name || "";
}

async function saveDeckToSupabase() {
  if (!currentUser) {
    showDeckMessage("Sign in before saving a deck.");
    return;
  }

  const payload = createDeckPayload();
  if (!payload) {
    showDeckMessage("Add cards before saving a deck.");
    return;
  }

  const name = deckNameInput.value.trim() || "Untitled Deck";
  const deckRecord = {
    user_id: currentUser.id,
    name,
    deck_code: encodeDeckCode(payload),
    cards: Object.fromEntries(payload.cards),
    anvil: payload.anvil || "none",
    updated_at: new Date().toISOString()
  };

  const selectedId = savedDeckSelect.value;
  const query = selectedId
    ? supabaseClient.from("decks").update(deckRecord).eq("id", selectedId).select("id").single()
    : supabaseClient.from("decks").insert(deckRecord).select("id").single();

  const { data, error } = await query;

  if (error) {
    console.error(error);
    showDeckMessage(error.message);
    return;
  }

  await refreshSavedDecks();
  savedDeckSelect.value = data.id;
  deckNameInput.value = name;
  showDeckMessage("Deck saved.");
}

async function loadSelectedDeckFromSupabase() {
  const savedDeck = getSelectedSavedDeck();

  if (!savedDeck) {
    showDeckMessage("Choose a saved deck to load.");
    return;
  }

  if (allCards.length === 0) {
    showDeckMessage("Cards are still loading. Try again in a moment.");
    return;
  }

  let payload;
  try {
    payload = decodeDeckCode(savedDeck.deck_code);
  } catch (error) {
    console.error(error);
    payload = createPayloadFromSavedCards(savedDeck);
  }

  if (!payload || payload.v !== 1 || !Array.isArray(payload.cards)) {
    showDeckMessage("Saved deck format is not recognized.");
    return;
  }

  payload.anvil = savedDeck.anvil || payload.anvil || "none";
  const result = loadDeckPayload(payload);
  deckNameInput.value = savedDeck.name;
  showDeckMessage(formatDeckLoadMessage("Saved deck loaded.", result));
}

async function deleteSelectedDeckFromSupabase() {
  const savedDeck = getSelectedSavedDeck();

  if (!savedDeck) {
    showDeckMessage("Choose a saved deck to delete.");
    return;
  }

  if (!window.confirm(`Delete saved deck "${savedDeck.name}"?`)) {
    return;
  }

  const { error } = await supabaseClient
    .from("decks")
    .delete()
    .eq("id", savedDeck.id);

  if (error) {
    console.error(error);
    showDeckMessage(error.message);
    return;
  }

  deckNameInput.value = "";
  await refreshSavedDecks();
  showDeckMessage("Saved deck deleted.");
}

function getSelectedSavedDeck() {
  return savedDecks.find(savedDeck => savedDeck.id === savedDeckSelect.value) || null;
}

function createPayloadFromSavedCards(savedDeck) {
  if (!savedDeck.cards || typeof savedDeck.cards !== "object") {
    return null;
  }

  return {
    v: 1,
    cards: Object.entries(savedDeck.cards),
    anvil: savedDeck.anvil || "none"
  };
}
