# SIDCO Future

A new, independent website for SIDCO, built from scratch around a futuristic neon identity: graphite backgrounds, electric lime with selective neon glow, an original interactive 2D signal field, and a concise Dutch presentation of custom software, automation and practical AI.

Private GitHub repository: https://github.com/gilleskindt/sidco-future

## Local preview

Requires Node.js 22 or later. No installation or build step is needed.

```sh
npm run dev
```

Open http://127.0.0.1:4190. Set `PORT` to use another loopback port.

```sh
npm run check
```

## Structure

- `dist/index.html`: complete Dutch Belgian site, including expertise, approach, founder and email contact.
- `dist/styles.css`: responsive layouts, local typography, focus styles and reduced-motion support.
- `dist/controls.css`: soft borderless glow controls, section chevrons, visible keyboard focus and compact sticky navigation with a dark translucent neon wash.
- `dist/app.js`: mobile navigation, keyboard-accessible service tabs with measured stable panel height, and email copying. The expertise strip loops seamlessly with the abstract brand symbol, pauses on hover or keyboard focus, and stays static for reduced-motion preferences.
- `dist/core.js`: original dependency-free Canvas 2D signal field, with an abstract expanding symbol, pointer interaction with sparse shaftless chevrons, touch and keyboard light pulses, resize support, visibility pause and reduced-motion support.
- `dist/assets/`: locally served DM Sans (SIL Open Font License included) and Gilles Kindt’s portrait, reused from the existing SIDCO material and originally sourced from the official Tectonic team page.
- `dist/favicon.svg`: original abstract SIDCO expansion symbol.
- `scripts/serve.mjs`: local static preview server.
- `.openai/hosting.json`: independent private Sites deployment identity.

The service previews show possible applications. They are not delivered client cases or live integrations. No customer names, testimonials or performance figures are invented.

Contact opens the visitor’s email client at the owner-supplied `info@sidco.be`. The copy button uses the browser clipboard on request. There is no form backend, visitor tracking, storage or external service integration. All runtime assets are served locally.

This repository is independent of the previous SIDCO implementations.
