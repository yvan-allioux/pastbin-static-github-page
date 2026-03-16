/**
 * ui.js
 * Références aux éléments du DOM et utilitaires d'interface partagés.
 */

// Raccourci getElementById
const $ = id => document.getElementById(id);

// ── Vues ──────────────────────────────────────────────────────────────────
const editorView = $("editor-view");
const viewerView = $("viewer-view");

// ── Éditeur ───────────────────────────────────────────────────────────────
const pasteText    = $("paste-text");
const pasteKey     = $("paste-key");
const btnEncrypt   = $("btn-encrypt");
const btnClear     = $("btn-clear");
const btnCopy      = $("btn-copy");
const urlResult    = $("url-result");
const generatedUrl = $("generated-url");
const editorError  = $("editor-error");
const keyWarn      = $("key-warn");

// ── Viewer ────────────────────────────────────────────────────────────────
const pasteContent   = $("paste-content");
const pasteMeta      = $("paste-meta");
const btnCopyContent = $("btn-copy-content");
const btnNewPaste    = $("btn-new-paste");
const viewerError    = $("viewer-error");

// ── Modal ─────────────────────────────────────────────────────────────────
const modalOverlay = $("modal-overlay");
const modalKey     = $("modal-key");
const btnDecrypt   = $("btn-modal-decrypt");
const modalError   = $("modal-error");

// ── SVG inline réutilisables ──────────────────────────────────────────────
const SVG = {
  lock: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  copy: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,
  check: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  errorCircle: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="notice-icon"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
};

// ── Helpers ───────────────────────────────────────────────────────────────

/**
 * Affiche un message d'erreur dans l'élément notice donné.
 * @param {HTMLElement} el
 * @param {string}      msg
 */
function showError(el, msg) {
  el.innerHTML = SVG.errorCircle; // SVG statique, contrôlé par nous
  const span = document.createElement("span");
  span.textContent = msg;         // textContent : aucune interprétation HTML possible
  el.appendChild(span);
  el.classList.remove("hidden");
}

/** Cache l'élément d'erreur. */
function hideError(el) {
  el.classList.add("hidden");
}

/** Affiche l'alerte de clé courte. */
function showWarning(el) { el.classList.remove("hidden"); }

/** Cache l'alerte de clé courte. */
function hideWarning(el) { el.classList.add("hidden"); }

/**
 * Copie du texte dans le presse-papier et donne un retour visuel
 * temporaire sur le bouton (icône check pendant 2 s).
 * @param {string}      text
 * @param {HTMLElement} btn        Bouton sur lequel afficher le feedback
 * @param {string}      [resetHTML] HTML à restaurer après 2 s (défaut : icône copie)
 */
async function copyWithFeedback(text, btn, resetHTML = SVG.copy) {
  try {
    await navigator.clipboard.writeText(text);
    btn.innerHTML = SVG.check;
    setTimeout(() => { btn.innerHTML = resetHTML; }, 2000);
  } catch {
    /* presse-papier indisponible, on ignore silencieusement */
  }
}
