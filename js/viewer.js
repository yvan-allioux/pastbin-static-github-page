/**
 * viewer.js
 * Logique de la vue lecteur : modal de saisie de clé, déchiffrement,
 * affichage du contenu et copie dans le presse-papier.
 */

// ── Déchiffrement ─────────────────────────────────────────────────────────

async function attemptDecrypt(encoded) {
  const key = modalKey.value;
  if (!key) { showError(modalError, "Entrez la clé de chiffrement."); return; }

  hideError(modalError);
  btnDecrypt.disabled  = true;
  btnDecrypt.textContent = "Déchiffrement…";

  try {
    const plaintext = await decrypt(encoded, key);

    // Succès : ferme la modale et affiche le contenu
    modalOverlay.classList.remove("active");

    pasteContent.textContent = plaintext;
    pasteContent.classList.remove("hidden");
    btnCopyContent.classList.remove("hidden");

    const bytes = new TextEncoder().encode(plaintext).length;
    pasteMeta.textContent = `${plaintext.length} caractères · ${bytes} octets`;

  } catch {
    showError(modalError, "Clé incorrecte ou données corrompues. Vérifiez votre clé.");
    modalKey.value = "";
    modalKey.focus();
  } finally {
    btnDecrypt.disabled    = false;
    btnDecrypt.textContent = "Déchiffrer";
  }
}

btnDecrypt.addEventListener("click", () => {
  attemptDecrypt(location.hash.slice(1));
});

// Validation au clavier dans le champ de clé
modalKey.addEventListener("keydown", e => {
  if (e.key === "Enter") btnDecrypt.click();
});

// ── Copie du contenu déchiffré ────────────────────────────────────────────

btnCopyContent.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(pasteContent.textContent);
    const original = btnCopyContent.textContent;
    btnCopyContent.textContent = "Copié !";
    setTimeout(() => { btnCopyContent.textContent = original; }, 2000);
  } catch { /* presse-papier indisponible */ }
});

// ── Nouveau paste ─────────────────────────────────────────────────────────

btnNewPaste.addEventListener("click", () => {
  location.href = location.pathname;
});
