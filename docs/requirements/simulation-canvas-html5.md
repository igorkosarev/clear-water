# Requirement: SimulationCanvas — HTML5 Canvas rewrite

## What

Replace `SimulationCanvas.tsx` with a pure HTML5 Canvas implementation that draws the full snake-path pipeline, animated contaminant particles, and filter housings entirely via the Canvas 2D API. No React sub-components are rendered inside the canvas — layout, pipes, filter housings, labels, and particles are all drawn in a single `requestAnimationFrame` loop.

## Why

The current DOM/Framer Motion implementation cannot produce the visual quality of a real pipe schematic: sub-pixel-accurate curves, smooth per-particle physics, and absorption animations. Canvas gives full control over every pixel and keeps the animation at native frame rate without per-element React reconciliation.

---

## Acceptance criteria

### Props & data
- [ ] Component signature is `SimulationCanvas({ filters: FilterType[], inputContaminants: ContaminantId[] })` — unchanged
- [ ] `stageContaminants` computation (FILTER_TYPE_CONFIG[f].removes filtering) stays in React, passed to the canvas draw loop via ref
- [ ] All contaminant metadata (color, nameKey) is resolved from `contaminants.json` as before

### Layout
- [ ] Canvas width = container `div` width (measured via `ResizeObserver`)
- [ ] Canvas height is calculated automatically: `topBox + entryLine + filters × (filterRowHeight + gapHeight) + exitLine + bottomBox`
  - filterRowHeight = 80 px, gapHeight (between rows, used for U-turn arcs) = 60 px
- [ ] Filter housing: rounded rect, full canvas width minus 40 px padding each side, height 48 px, cornerRadius 24 px
- [ ] Left and right pipe ports are at the horizontal padding edges (x = 40, x = canvasWidth − 40), vertically centred on the filter housing
- [ ] "Water In" box at the top, "Clean Water / Partially Filtered" box at the bottom, both drawn as rounded rects on the canvas

### Snake path geometry
- [ ] Entry: vertical line from top-centre down to the left port of filter 0
- [ ] Filter 0 (LTR): horizontal line through the housing from left port to right port
- [ ] U-turn right: semicircle arc on the right side connecting right port of row N to right port of row N+1
- [ ] Filter 1 (RTL): horizontal line from right port to left port
- [ ] U-turn left: semicircle arc on the left side
- [ ] Pattern alternates correctly for any number of filters (even = LTR, odd = RTL)
- [ ] Exit: vertical line from the last filter's exit port down to bottom-centre
- [ ] All path segments are drawn with stroke `#1e3a5f`, strokeWidth 8, lineCap `round`

### Filter housing visuals
- [ ] Housing fill `#0f172a`, stroke `#334155`
- [ ] Left icon area: rounded square `#1e293b`; icon rendered by pre-rendering the Lucide SVG string to an `HTMLImageElement` via a `data:image/svg+xml` URL and then `ctx.drawImage`. If pre-render fails or is impractical, omit the icon and show only the colored area
- [ ] Filter label in white, 14 px, vertically centred in the housing body
- [ ] "Removed" contaminant dots: colored filled circles on the right side of the housing, one per removed contaminant, using `contaminant.color`

### Particles
- [ ] Each active contaminant in a stage has **3 particles** per segment (3 slots per contaminant), for visual density
- [ ] Particle: radius 4 px, `shadowBlur` 8, `shadowColor` = `contaminant.color`, fill = `contaminant.color`
- [ ] Blue "clean water" particles (`#3b82f6`) also have 3 slots per replaced contaminant slot
- [ ] Particles travel parametrically along the snake path (`t = 0..1` per segment)
- [ ] Speed and phase offset are deterministic — derived from `(contaminantIndex * 3 + slotIndex)`, no `Math.random()`
- [ ] When a particle reaches the filter that removes its contaminant: absorption animation — radius shrinks to 0, opacity 1 → 0 over ~0.4 s, then particle stops permanently on that segment
- [ ] After each filter stage: in the downstream pipe segment, slots of removed contaminants are replaced by blue particles
- [ ] Particles on unaffected segments loop continuously (repeat from start of segment)

### "Water In" / "Clean Water" boxes (canvas-drawn)
- [ ] Both boxes drawn as rounded rects on the canvas, not HTML overlays
- [ ] Inside each box: contaminant chips drawn as small rounded-rect labels with fill = `color + '22'`, stroke = `color + '44'`, and the contaminant name as text
- [ ] "Water In" box: slate border (`#334155`), slate background (`#0f172a`)
- [ ] "Clean Water" box: green tint when allClear (`#052e16` fill, `#166534` stroke), amber tint otherwise (`#451a03` fill, `#92400e` stroke)

### Canvas lifecycle
- [ ] Single `useEffect` starts a `requestAnimationFrame` loop on mount
- [ ] Loop is cancelled (`cancelAnimationFrame`) on unmount
- [ ] `ResizeObserver` watches the container div; on width change, canvas dimensions and all layout coordinates are recalculated and the loop continues without restart

### Constraints check (CLAUDE.md)
- [ ] No backend, no SSR — ✅ pure client Canvas API
- [ ] No new npm libraries — Canvas 2D API is built-in; no additional dependencies
- [ ] Framer Motion removed from this component — ✅
- [ ] Wrapper `div` may use Tailwind classes; all drawing is JS — ✅
- [ ] TypeScript strict: canvas context typed as `CanvasRenderingContext2D`, no `any`

---

## Out of scope

- Interactivity (click on filter to open detail) — not in this iteration
- Replicating the canvas to SystemDiagram or Encyclopedia pages — separate task
- i18n of canvas-drawn text — labels use the same `FILTER_TYPE_CONFIG[f].label` strings already in English; translation deferred

---

## Affected files / components

- `src/components/simulation/SimulationCanvas.tsx` — full rewrite
- `src/components/filter/FilterUnit.tsx` — no longer used inside SimulationCanvas (still used elsewhere)
- `src/components/filter/FilterTypes.ts` — read-only, no changes
- `src/data/contaminants.json` — read-only, no changes

---

## Open questions

- None — all decisions resolved.
