# C-137 Dashboard

A browser-based cybersecurity toolkit with a Rick and Morty-inspired interface. No backend, no frameworks, no data leaving your machine. Everything runs locally using native browser APIs.

This started as a redesign of an older project called Sentinel. The goal was to keep it genuinely useful while giving it a visual identity that actually makes it interesting to open.

---

![Dashboard overview](assets/images/pic1.png)

---

## What it does

The dashboard gives you a set of small, self-contained security tools that you can run without installing anything or sending data anywhere. Here is what is included:

**Password Strength Checker** : Type in a password and it scores it on the spot based on length, character variety, and common patterns. Everything stays in memory.

**Password Generator** : Generates passwords using `crypto.getRandomValues()`, which is the browser's cryptographically secure random number generator. You pick the length and character set.

**Hash Generator** : Takes any text input and produces SHA-256, SHA-384, and SHA-512 hashes via the Web Crypto API. Updates as you type.

**Base64 Encoder / Decoder** : Two-panel layout, handles UTF-8 correctly, and lets you swap panels or copy the result with one click.

**Network Lookup** : Enter an IP address or domain and it pulls basic geolocation and ISP data from a public API. No API key needed.

**Port Scanner** : A simulated port scan. It walks through a port range and shows you which ports would typically be open on a given type of host. Clearly labeled as a simulation — it does not make real network connections.

**Embedded Terminal** : A simple command-line interface built into the dashboard. Supports `help`, `status`, `neofetch`, `tools`, `open`, and `clear`. You can also use it to navigate between tools.

**Command Palette** : Press `Ctrl + K` from anywhere in the app to search and jump to any tool instantly.

---

## Tech stack

- HTML5, CSS3, Vanilla JavaScript (ES6+)
- Web Crypto API for hashing and password generation
- LocalStorage for activity logging and session state
- Fetch API for the network lookup tool
- No build step, no npm, no dependencies

## Running it

Clone the repo and open `index.html` in any modern browser. That is it.

If you want to run it through a local server instead (which some browsers prefer for certain APIs), a simple one-liner works fine:

```bash
python3 -m http.server
```

Then go to `http://localhost:8000`.

## Project structure

```
sentinel/
├── index.html
├── assets/
├── css/
│   ├── main.css
│   ├── dashboard.css
│   └── components.css
├── js/
│   ├── app.js
│   ├── terminal.js
│   ├── utils.js
│   └── tools/
│       ├── password.js
│       ├── hash.js
│       ├── encoding.js
│       ├── generator.js
│       ├── ip.js
│       └── scanner.js
└── pages/
    └── about.html
```

## Privacy

There is no server, no analytics, no tracking. The only outbound request the app ever makes is the optional IP/domain lookup, which hits a public third-party API when you explicitly click the lookup button. Everything else is entirely local.

## License

MIT — see [LICENSE](LICENSE) for details.
