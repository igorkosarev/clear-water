# Requirement: Suppliers page redesign

## What

Restyle `src/pages/Suppliers.tsx` to match the site-wide dark design language: slate-950 background, slate-800/900 card surfaces, white/slate text, Framer Motion fade-in animations. No structural changes — same filtering logic, same data, no new sections.

## Why

The current page uses a light gray/blue theme (`text-gray-900`, `text-blue-600`) that is visually inconsistent with every other page on the site. Users arriving from the nav feel a jarring theme switch.

---

## Acceptance criteria

### Theme
- [ ] Page background: `bg-slate-950`, top-level wrapper gets `min-h-screen text-white`
- [ ] Page title and subtitle use `text-white` / `text-slate-400` (matching Configurator/Learn pattern)
- [ ] No `text-gray-*` or `text-blue-*` class names remain on the page
- [ ] Status line text (showing-all, filtered-by) uses `text-slate-400` / `text-sky-400`

### Cards
- [ ] Each supplier card: `bg-slate-900/80 border border-slate-800 rounded-2xl p-5`
- [ ] Supplier name: `text-white font-semibold`
- [ ] Country line: flag emoji + country name in `text-slate-400 text-sm`
- [ ] URL link: `text-sky-400 hover:text-sky-300 text-sm`, truncated if too long (`truncate`)
- [ ] Card grid: `grid grid-cols-1 sm:grid-cols-2 gap-4` (unchanged)
- [ ] Cards animate in with Framer Motion: `initial={{ opacity: 0, y: 16 }}`, `animate={{ opacity: 1, y: 0 }}`, staggered by index (`delay: index * 0.06`)

### Empty state banner
- [ ] Keeps existing amber warning style but on dark background: `bg-amber-400/10 border border-amber-400/20 rounded-xl`
- [ ] Text: `text-amber-300` for heading, `text-slate-300` for body (already correct — verify)
- [ ] "Show all" button: `text-sky-400 hover:text-sky-300`

### Page header (no hero)
- [ ] Simple centred header block: `MapPin` icon from Lucide (`text-cyan-400`), `h1` title, subtitle paragraph — matching the pattern from Learn/Contaminants pages
- [ ] No radial gradient background, no animated glow — keep it minimal
- [ ] `border-b border-slate-800/60` under the header block to separate from the card grid

### Constraints (CLAUDE.md)
- [ ] Tailwind utility classes only — no custom CSS
- [ ] No new npm packages
- [ ] All strings through `t()` — no hardcoded text added
- [ ] Framer Motion already in the project — use it for card stagger

---

## Out of scope

- Adding module/category tags to cards
- Hero section with animated background
- Search or text-filter input
- Any changes to filtering logic or CountryContext

---

## Affected files / components

- `src/pages/Suppliers.tsx` — restyled, no logic changes

---

## Open questions

- None.
