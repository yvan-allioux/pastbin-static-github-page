# PastBin Statique

A serverless, privacy-first pastebin that lives entirely in a URL.

No backend. No database. No accounts. Your content never leaves your browser.

---

## How it works

When you paste text and provide an encryption key, the app:

1. Derives a 256-bit key from your passphrase using **PBKDF2** (250 000 iterations, SHA-256)
2. Encrypts your content with **AES-256-GCM** using a random salt and IV
3. Encodes the result (`salt | IV | ciphertext`) as **Base64url**
4. Places it in the **URL hash** (`#…`)

The recipient opens the link, enters the key, and the content is decrypted locally. The key should always be shared through a separate channel (SMS, phone call, etc.) — never in the same link.

```
https://you.github.io/repo/#<base64url(salt + iv + ciphertext)>
```

Since the payload lives in the URL hash, it is **never sent to any server** — not even GitHub's.

---

## Security properties

| Property | Detail |
|---|---|
| Encryption | AES-256-GCM (authenticated encryption) |
| Key derivation | PBKDF2 / SHA-256 / 250 000 iterations |
| Randomness | 16-byte salt + 12-byte IV, generated fresh for every paste |
| Tampering detection | GCM authentication tag rejects any modified ciphertext |
| Crypto implementation | Web Crypto API (native browser, no dependencies) |
| Data storage | None — everything is in the URL |

---

## Project structure

```
index.html        ← HTML structure
css/
  style.css       ← All styles
js/
  crypto.js       ← AES-256-GCM, PBKDF2, Base64url helpers
  ui.js           ← DOM references, shared UI utilities
  editor.js       ← Encrypt, generate link, copy, clear
  viewer.js       ← Decrypt modal, display content
  main.js         ← Routing (hash present → viewer, else → editor)
```

No build step. No bundler. No dependencies. Open `index.html` and it works.

---

## Deployment

This is a plain static site. Any static host works.

**GitHub Pages:**

1. Push the repository to GitHub
2. Go to **Settings → Pages**
3. Set source to `main` branch, `/ (root)` folder
4. Done — your pastebin is live at `https://<username>.github.io/<repo>/`

---

## Limitations

- **URL length** — the encrypted payload is roughly 4/3 the size of the original content. Large pastes produce long URLs. This is an inherent trade-off of the serverless approach.
- **No history** — there is no list of pastes. If you lose the URL, the content is gone.
- **Passphrase strength matters** — a weak key is the weakest link. Use a strong, random passphrase.

---

## License

MIT
