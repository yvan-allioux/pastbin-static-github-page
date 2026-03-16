/**
 * main.js
 * Point d'entrée : détecte si l'URL contient un payload chiffré
 * et bascule entre la vue éditeur et la vue lecteur.
 */

function init() {
  const hash = location.hash.slice(1);

  if (hash.length > 0) {
    // ── Mode lecteur ──
    editorView.style.display = "none";
    viewerView.style.display = "flex";

    if (hash.length < 40) {
      // Hash trop court pour être valide
      showError(viewerError, "Le lien semble invalide ou incomplet.");
      return;
    }

    // Ouvre la modale de saisie de clé
    modalOverlay.classList.add("active");
    setTimeout(() => modalKey.focus(), 100);

  } else {
    // ── Mode éditeur ──
    editorView.style.display = "flex";
    viewerView.style.display = "none";
  }
}

init();
