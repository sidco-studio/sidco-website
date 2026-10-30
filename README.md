# SIDCO Future

A website for SIDCO, an AI software studio, built around a futuristic neon identity: graphite backgrounds, electric lime with selective neon glow, an original interactive 2D brand visual, and a concise Dutch presentation led by practical AI, supported by automation and custom software.

GitHub repository: https://github.com/sidco-studio/sidco-website

Live website: https://sidco-studio.github.io/sidco-website/

## Local preview

Requires Node.js 22 or later. No installation or build step is needed.

```sh
npm run dev
```

Open http://127.0.0.1:4190. Set `PORT` to use another loopback port.

```sh
npm run check
```

## GitHub Pages

`.github/workflows/pages.yml` publishes only `dist/` when website files change on `main`, or when run manually from Actions. In repository Settings → Pages, the source is **GitHub Actions**. No install or build step is needed. Relative asset paths support the `/sidco-website/` prefix and local preview.

## Structure

- `dist/index.html`: complete Dutch Belgian site with AI-led copy throughout the hero, expertise, approach, founder and email contact. AI is first in visible and accessible capability lists and is the initially selected service example.
- `dist/styles.css`: responsive layouts, local typography, focus styles and reduced-motion support.
- `dist/controls.css`: compact pill-shaped controls with stationary, unchanged surfaces on hover and the same fine green-grey borders as the preview windows. Presses immediately brighten the inner rim and lime light, then fade on release without shifting the control. Includes a borderless glowing contact chevron, section chevrons, visible keyboard focus and compact sticky navigation with a dark translucent neon wash. The header uses a larger, optically aligned brand symbol and independently centered desktop links with slightly larger text.
- `dist/examples.css`: a company portal and concrete Teamleader, Odoo, Teams and Outlook workflows, with recognizable SVG marks adapted to the lime palette.
- `dist/expertise.css`: compact desktop composition, with introduction and service choices beside the shared preview, fitting a normal laptop viewport.
- `dist/mobile-hero.css`: one centered reading axis on desktop and phone, with the branded background behind the headline and action. Phone layouts use a readable 16px explanation and a 50px pill action. The mobile opening groups the hero and capability marquee into the viewport below the measured navbar, with the moving strip at its bottom. Longer content and reduced-motion wrapping can expand naturally. Secondary mobile signoffs are hidden. Only the relevant action is displayed at each breakpoint.
- `dist/app.js`: mobile navigation, keyboard-accessible service tabs with separately measured, shared window and caption heights, a cancellable crossfade between scenarios, a compact mobile tab row, gentle proximity snapping for sections that fit below the navigation, and email copying. The expertise strip loops seamlessly with the abstract brand symbol, pauses on hover or keyboard focus, and stays static for reduced-motion preferences.
- `dist/ambient.js`: subtle cursor-following light clipped inside actual or styled buttons, with the service rows clipped only vertically and the borderless contact chevron glow allowed to spread freely. A muted green 4px scrollbar overlays the full-width page without reserving a gutter; its desktop halo is centered directly behind the thumb and hidden on mobile. Both fade after three seconds of inactivity and return on scrolling or movement near the right edge. The scrollbar supports dragging, track clicks and keyboard navigation, stays visible while focused, and falls back to the native scrollbar without JavaScript. Cursor motion respects reduced-motion preferences.
- `dist/core.js`: the original dependency-free interactive Canvas 2D pixel field, retained for possible reuse. It is no longer loaded or mounted in the page. To restore it, add its module script and a `.hero-art` wrapper containing `canvas#energy-core` with the accessible control label and instruction.
- `dist/hero-field.js`: a decorative branded light field behind the hero copy. Five continuous angular routes connect the four outward chevrons, with three slow light segments and diffuse lime light. Hero-scoped pointer and touch feedback preserves links, native scrolling and pinch zoom; reduced motion keeps a static atmosphere.
- `dist/assets/`: locally served DM Sans (SIL Open Font License included) and Gilles Kindt’s portrait, reused from the existing SIDCO material and originally sourced from the official Tectonic team page.
- `dist/favicon.svg`: the abstract SIDCO expansion symbol in the navbar's lime palette, on a dark tile with a soft radial glow.
- `scripts/serve.mjs`: local static preview server.
- `.openai/hosting.json`: independent private Sites deployment identity.

The service previews show possible applications in AI-first order: intake from Outlook and attachments preparing a Teamleader quote with human review, a won Teamleader deal preparing an Odoo order and Teams update, and a company portal for internal teams and clients. Window and caption heights are measured across all tabs at the responsive width, so switching scenarios keeps both rectangles and the surrounding section stable.

Capability references: [Odoo external API](https://www.odoo.com/documentation/19.0/developer/misc/api/external_api.html), [Teamleader API](https://developer.focus.teamleader.eu/), [Teamleader quotation AI](https://support.focus.teamleader.eu/hc/en-150/articles/51014294144401-Create-and-send-a-quotation-faster-with-Focus-AI). These examples would require project-specific implementation and compatible software access; Odoo external API access requires its Custom plan. The company portal stands on its own; the AI scenario connects external sources and company rules rather than claiming Teamleader lacks native quotation AI.

The previews show possible applications. They are not delivered client cases or live integrations. No customer names, testimonials or performance figures are invented.

Contact opens the visitor’s email client at the owner-supplied `info@sidco.be`. The copy button uses the browser clipboard on request. There is no form backend, visitor tracking, storage or external service integration. All runtime assets are served locally.

This repository is independent of the previous SIDCO implementations.
