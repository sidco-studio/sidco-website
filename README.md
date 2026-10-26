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
- `dist/controls.css`: compact pill-shaped controls with stationary, unchanged surfaces on hover and the same fine green-grey borders as the preview windows, a borderless glowing contact chevron, section chevrons, visible keyboard focus and compact sticky navigation with a dark translucent neon wash.
- `dist/examples.css`: a company portal and concrete Teamleader, Odoo, Teams and Outlook workflows, with recognizable SVG marks adapted to the lime palette.
- `dist/expertise.css`: compact desktop composition, with introduction and service choices beside the shared preview, fitting a normal laptop viewport.
- `dist/mobile-hero.css`: centered phone composition with one reading axis, a balanced headline, readable 16px explanation, a living mark and a 50px pill action. Secondary signoffs are hidden. The mobile action follows the graphic in DOM and keyboard order; the desktop action stays beside its copy, and only the relevant action is displayed at each breakpoint.
- `dist/app.js`: mobile navigation, keyboard-accessible service tabs with separately measured, shared window and caption heights, a cancellable crossfade between scenarios, a compact mobile tab row, gentle proximity snapping for sections that fit below the navigation, and email copying. The expertise strip loops seamlessly with the abstract brand symbol, pauses on hover or keyboard focus, and stays static for reduced-motion preferences.
- `dist/ambient.js`: subtle cursor-following light clipped inside actual or styled buttons, with the service rows clipped only vertically and the borderless contact chevron glow allowed to spread freely. A muted green 4px scrollbar overlays the full-width page without reserving a gutter; its desktop halo is centered directly behind the thumb and hidden on mobile. Both fade after three seconds of inactivity and return on scrolling or movement near the right edge. The scrollbar supports dragging, track clicks and keyboard navigation, stays visible while focused, and falls back to the native scrollbar without JavaScript. Cursor motion respects reduced-motion preferences.
- `dist/core.js`: dependency-free Canvas 2D brand visual. Phones use crisp filled SIDCO facets, fine edge traces and gentle automatic contour pulses; taps add immediate light and expanding facet contours. The desktop retains its interactive pixel field. Touch taps are separated from scrolling, pinching and cancelled gestures; keyboard activation remains available. Offscreen animation pauses, and reduced-motion mode uses a brief brightness response instead of an expanding wave.
- `dist/assets/`: locally served DM Sans (SIL Open Font License included) and Gilles Kindt’s portrait, reused from the existing SIDCO material and originally sourced from the official Tectonic team page.
- `dist/favicon.svg`: original abstract SIDCO expansion symbol.
- `scripts/serve.mjs`: local static preview server.
- `.openai/hosting.json`: independent private Sites deployment identity.

The service previews show possible applications: a company portal for internal teams and clients, a won Teamleader deal preparing an Odoo order and Teams update, and intake from Outlook and attachments preparing a Teamleader quote with human review. Window and caption heights are measured across all tabs at the responsive width, so switching scenarios keeps both rectangles and the surrounding section stable.

Capability references: [Odoo external API](https://www.odoo.com/documentation/19.0/developer/misc/api/external_api.html), [Teamleader API](https://developer.focus.teamleader.eu/), [Teamleader quotation AI](https://support.focus.teamleader.eu/hc/en-150/articles/51014294144401-Create-and-send-a-quotation-faster-with-Focus-AI). These examples would require project-specific implementation and compatible software access; Odoo external API access requires its Custom plan. The company portal stands on its own; the AI scenario connects external sources and company rules rather than claiming Teamleader lacks native quotation AI.

The previews show possible applications. They are not delivered client cases or live integrations. No customer names, testimonials or performance figures are invented.

Contact opens the visitor’s email client at the owner-supplied `info@sidco.be`. The copy button uses the browser clipboard on request. There is no form backend, visitor tracking, storage or external service integration. All runtime assets are served locally.

This repository is independent of the previous SIDCO implementations.
