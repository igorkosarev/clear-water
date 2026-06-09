# Requirement: Contaminants index + individual detail pages

## What

Split the current single-scroll `/learn/contaminants` page into two levels:
an index page with a card grid (one card per contaminant) and individual detail pages at `/learn/contaminants/:id` that reuse the existing full-bleed section design.

## Why

The current page forces users to scroll through all contaminants at once. A card grid gives a quick overview; clicking through to a detail page lets users focus on one contaminant without distraction.

---

## Acceptance criteria

### Index page (`/learn/contaminants`)

- [ ] Keep the existing hero section (radial glow + floating particles + title/subtitle) unchanged
- [ ] Below the hero: a responsive card grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5`)
- [ ] Each card contains:
  - Top accent strip (2–3 px) in `contaminant.color`
  - Category badge (`biological` / `chemical` / `physical`) using existing `BADGE_CLASS` styles
  - Contaminant icon (Lucide, from existing `CONTAMINANT_ICONS` map), colored with `contaminant.color`
  - Contaminant name (`text-white font-bold`)
  - Short description (`t(contaminant.descriptionKey)`, 2–3 lines max, `line-clamp-3`)
  - "Learn more" button / link → navigates to `/learn/contaminants/:id`
- [ ] Cards animate in with Framer Motion stagger (same `contentVariants` / `itemVariants` pattern already in the file)
- [ ] Card background: `bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden`
- [ ] "Learn more" link styled as a small pill button: `bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors`

### Detail page (`/learn/contaminants/:id`)

- [ ] New file: `src/pages/Learn/ContaminantDetail.tsx`
- [ ] Reads `:id` from `useParams()`, looks up contaminant in `contaminants.json`
- [ ] If `:id` not found → renders a simple "Not found" message (no redirect needed)
- [ ] Renders the exact same full-bleed section design currently used in `ContaminantSection`:
  - Radial gradient background in `contaminant.color`
  - Animated floating particles (PARTICLE_CONFIGS)
  - Large Lucide icon (right or left side, alternating — for a single page always position on the right)
  - Category badge, name, description, InfoRows (Sources / Health risks / Detection)
  - "Removed by" method pills that open the method preview Modal
- [ ] A "← Back to Contaminants" link at the top of the page (above the section), styled as `text-slate-400 hover:text-white text-sm` with a `ChevronLeft` icon; uses React Router `Link` to `/learn/contaminants`
- [ ] Page title (`document.title`) set to the contaminant name via a `useEffect`

### Routing

- [ ] `src/router.tsx`: add route `{ path: 'learn/contaminants/:id', element: <ContaminantDetail /> }`
- [ ] Import `ContaminantDetail` in `router.tsx`

### Code organisation

- [ ] All particle/pattern logic (`PATTERNS`, `PARTICLE_CONFIGS`, `BASE_POS`, etc.) moves from `Contaminants.tsx` into `ContaminantDetail.tsx` (or a shared local helper — developer's choice, as long as no duplication)
- [ ] `CONTAMINANT_ICONS`, `BADGE_CLASS`, `COMPLEXITY_CLASS`, `COST_CLASS` constants: if used by both files, extract to a shared file (e.g. `src/components/encyclopedia/contaminantConfig.ts`); otherwise keep in `ContaminantDetail.tsx`
- [ ] `InfoRow` sub-component: move to `ContaminantDetail.tsx` (or shared if also used in Methods)
- [ ] `Contaminants.tsx` becomes a clean index page with no particle/section logic

### Constraints (CLAUDE.md)

- [ ] No new npm packages — React Router `useParams` and `Link` already in the project
- [ ] All strings through `t()` — no hardcoded text
- [ ] Tailwind utility classes only

---

## Out of scope

- Pagination or search on the index page
- Breadcrumb navigation beyond the single back-link
- Applying the same split to the Methods page (separate task)
- Any changes to the Methods page cross-reference modal

---

## Affected files / components

- `src/pages/Learn/Contaminants.tsx` — stripped to hero + card grid
- `src/pages/Learn/ContaminantDetail.tsx` — new file, full-bleed detail page
- `src/router.tsx` — add `learn/contaminants/:id` route
- Possibly `src/components/encyclopedia/contaminantConfig.ts` — shared constants (developer's choice)

---

## Open questions

- None.
