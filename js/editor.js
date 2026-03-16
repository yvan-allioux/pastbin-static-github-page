/**
 * editor.js
 * Logique de la vue éditeur : chiffrement du texte, génération de l'URL,
 * copie dans le presse-papier et remise à zéro du formulaire.
 */

// ── Chiffrement & génération de l'URL ─────────────────────────────────────

btnEncrypt.addEventListener("click", async () => {
  hideError(editorError);

  const text = pasteText.value.trim();
  const key  = pasteKey.value;

  if (!text) { showError(editorError, "Le contenu ne peut pas être vide.");          return; }
  if (!key)  { showError(editorError, "Vous devez fournir une clé de chiffrement."); return; }

  btnEncrypt.disabled  = true;
  btnEncrypt.innerHTML = "Chiffrement…";

  try {
    const encoded = await encrypt(text, key);
    const url     = `${location.origin}${location.pathname}#${encoded}`;

    generatedUrl.textContent = url;
    urlResult.classList.add("visible");
    generatedUrl.scrollIntoView({ behavior: "smooth", block: "nearest" });
  } catch (e) {
    showError(editorError, "Erreur lors du chiffrement : " + e.message);
  } finally {
    btnEncrypt.disabled  = false;
    btnEncrypt.innerHTML = `${SVG.lock} Générer le lien`;
  }
});

// ── Alerte clé courte (live) ──────────────────────────────────────────────

pasteKey.addEventListener("input", () => {
  if (pasteKey.value.length > 0 && pasteKey.value.length < 8) {
    showWarning(keyWarn);
  } else {
    hideWarning(keyWarn);
  }
});

// ── Copie de l'URL ────────────────────────────────────────────────────────

btnCopy.addEventListener("click", () => {
  copyWithFeedback(generatedUrl.textContent, btnCopy);
});

// ── Remise à zéro ─────────────────────────────────────────────────────────

btnClear.addEventListener("click", () => {
  pasteText.value = "";
  pasteKey.value  = "";
  urlResult.classList.remove("visible");
  hideError(editorError);
  // Supprime le hash sans recharger la page
  history.replaceState(null, "", location.pathname);
});
