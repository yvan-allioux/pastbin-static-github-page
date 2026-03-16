/**
 * crypto.js
 * Chiffrement AES-256-GCM avec dérivation de clé PBKDF2.
 *
 * Format du payload binaire : salt(16) | iv(12) | ciphertext(n)
 * Le payload est ensuite encodé en base64url pour être intégré dans l'URL.
 */

const PBKDF2_ITERATIONS = 250_000;
const SALT_LEN = 16;
const IV_LEN   = 12;

/**
 * Dérive une clé AES-256 depuis une passphrase et un salt via PBKDF2/SHA-256.
 * @param {string}     passphrase
 * @param {Uint8Array} salt
 * @returns {Promise<CryptoKey>}
 */
async function deriveKey(passphrase, salt) {
  const enc  = new TextEncoder();
  const base = await crypto.subtle.importKey(
    "raw",
    enc.encode(passphrase),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, hash: "SHA-256", iterations: PBKDF2_ITERATIONS },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Chiffre un texte avec la passphrase donnée.
 * @param {string} plaintext
 * @param {string} passphrase
 * @returns {Promise<string>} Payload base64url (salt | iv | ciphertext)
 */
async function encrypt(plaintext, passphrase) {
  const enc  = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LEN));
  const iv   = crypto.getRandomValues(new Uint8Array(IV_LEN));
  const key  = await deriveKey(passphrase, salt);

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(plaintext)
  );

  const combined = new Uint8Array(SALT_LEN + IV_LEN + ciphertext.byteLength);
  combined.set(salt, 0);
  combined.set(iv,   SALT_LEN);
  combined.set(new Uint8Array(ciphertext), SALT_LEN + IV_LEN);

  return bufToBase64Url(combined);
}

/**
 * Déchiffre un payload base64url avec la passphrase donnée.
 * Lève une exception si la clé est incorrecte ou les données corrompues.
 * @param {string} encoded    Payload base64url
 * @param {string} passphrase
 * @returns {Promise<string>} Texte en clair
 */
async function decrypt(encoded, passphrase) {
  const combined   = base64UrlToBuf(encoded);
  const salt       = combined.slice(0, SALT_LEN);
  const iv         = combined.slice(SALT_LEN, SALT_LEN + IV_LEN);
  const ciphertext = combined.slice(SALT_LEN + IV_LEN);

  const key = await deriveKey(passphrase, salt);

  const plainBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext
  );

  return new TextDecoder().decode(plainBuffer);
}

// ── Helpers base64url ──────────────────────────────────────────────────────

/**
 * Convertit un Uint8Array en chaîne base64url (sans padding).
 * @param {Uint8Array} buf
 * @returns {string}
 */
function bufToBase64Url(buf) {
  let binary = "";
  buf.forEach(b => (binary += String.fromCharCode(b)));
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Convertit une chaîne base64url en Uint8Array.
 * @param {string} str
 * @returns {Uint8Array}
 */
function base64UrlToBuf(str) {
  const b64    = str.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
  const binary = atob(padded);
  const buf    = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) buf[i] = binary.charCodeAt(i);
  return buf;
}
