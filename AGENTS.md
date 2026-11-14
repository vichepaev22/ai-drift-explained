# Development guidance: Russian AI Atlas

## Modern web platform (GoogleChrome/modern-web-guidance)

This repository uses [Modern Web Guidance](https://github.com/GoogleChrome/modern-web-guidance) as developer-time reference, not a runtime script.

Before changing HTML, CSS, accessibility, layout, animations, or client-side JS:

1. Search for focused relevant platform guidance, e.g.
   `DISABLE_TELEMETRY=1 npx --yes modern-web-guidance@1.0.0 search "responsive layout container queries"`
2. Read matched guide(s) with `retrieve <guide-id>`. Check Baseline browser support; use progressive enhancement and simple fallbacks.
3. Check likely legacy patterns with `DISABLE_TELEMETRY=1 npx --yes modern-web-guidance@1.0.0 legacy-scan .`. This scanner covers only part of the guidance and is not a comprehensive audit.
4. Keep the Russian design, research data accuracy and source attribution intact. Avoid replacing existing charts, UMAP data or Three.js with fabricated datasets.
5. Test `node --check app.js && node --check visual.js && node --test tests/*.test.mjs` and the Playwright browser test via GitHub Actions.

Browser support: current Chrome, Firefox, Safari and their modern mobile variants. Prefer native Web APIs and accessible HTML. For newer APIs, supply a lightweight fallback without extra client dependencies.

### Atlas-specific decisions
- Native modal `<dialog>` for scientific source details, so focus containment, Esc and return-focus are managed by the browser. Use outside-click fallback when `closedby="any"` is unsupported.
- Mobile navigation drawer: make the rest of the app inert while open; restore focus when dismissed.
- Observe canvas parent size with `ResizeObserver` rather than guessing from the global window.
- Suspend WebGL animation off-screen or while the document is hidden; honor `prefers-reduced-motion`.
- Keep a 2D fallback when WebGL is unavailable and do not load all claim text shards until requested.
- Do not persist or send user behavior to analytics services. Disable optional Modern Web Guidance CLI telemetry via `DISABLE_TELEMETRY=1`.
