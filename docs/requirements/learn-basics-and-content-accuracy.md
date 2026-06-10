# Requirement: Learn Basics section + content accuracy improvements

## What

Three coordinated changes:
1. Verify and correct the treatment effectiveness matrix for six specific method–contaminant pairs.
2. Expand limitations and add short contextual dependency notes on individual method detail pages.
3. Create a new `/learn/basics` educational hub covering six foundational topics, served from a new `/learn` index page that acts as the entry point to the entire encyclopedia.

## Why

Users currently encounter method detail pages that describe what a technology does but not what it does not do, what conditions it requires, or how it fits into a complete system. This leads to over-reliance on a single method and unrealistic expectations. The Basics section fills the educational gap that individual method or contaminant pages cannot fill without becoming cluttered.

---

## Part 1 — Effectiveness matrix corrections

### Pairs to verify

Cross-check each pair against WHO Guidelines for Drinking-water Quality, US EPA drinking water standards, and NSF/ANSI 58/55/42 certification data. For each pair, confirm whether the contaminant should be in the method's `removes` array or not.

| Method | Contaminant | Current state | Expected finding |
|---|---|---|---|
| Reverse Osmosis | Arsenic | ✅ listed | Correct. Add limitation note: As(III) removal is significantly lower than As(V); oxidation pre-treatment (e.g. chlorination or aeration) is required to achieve reliable arsenic removal. |
| UV Disinfection | Protozoa | ✅ listed | Correct. Add limitation note: effective dose requirements vary by organism; Cryptosporidium requires higher UV dose than bacteria and viruses. |
| Chlorination | Pharmaceuticals | ❌ not listed | Correct — chlorination does not reliably remove pharmaceuticals. Confirm not listed, add limitation note. |
| Chlorination | Hormones | ❌ not listed | Correct — chlorination does not reliably remove hormones. Confirm not listed, add limitation note. |
| Ion Exchange | Pharmaceuticals | ❌ not listed | Correct — ion exchange targets ionic species; most pharmaceuticals are not effectively removed. Confirm not listed, add limitation note. |
| Ion Exchange | Hormones | ❌ not listed | Correct — hormones are not reliably removed by ion exchange. Confirm not listed, add limitation note. |

### Deliverable

- If any pair is incorrectly classified, update `src/data/treatment-methods.json` `removes` array.
- If already correct, no data change — only limitation text updates (see Part 2).
- Document the source consulted for each correction in a brief changelog comment in the requirement file or commit message.

### Acceptance criteria

- [ ] Each of the six pairs is verified against at least one authoritative source (WHO, EPA, or NSF/ANSI).
- [ ] `removes` arrays are updated only where evidence supports a change.
- [ ] No contaminant is added to a `removes` array without a clear mechanistic basis.

---

## Part 2 — Expanded limitations and contextual dependency notes

### 2a. Expanded limitations text

The existing `limitationsKey` translation values for the five priority methods must be expanded to explicitly cover:

| Method | Required additions to limitations text |
|---|---|
| Reverse Osmosis | Requires sediment and carbon pre-filtration to protect the membrane. Rejects 3–4 L of water per litre produced (brine). Membrane integrity must be verified periodically. Does not remove dissolved gases (radon, CO₂). |
| UV Disinfection | Requires low turbidity (< 1 NTU recommended) and low colour for UV to reach target organisms. Does not remove chemical contaminants, heavy metals, or dissolved solids. Lamp intensity degrades over time; annual replacement recommended. |
| Activated Carbon | Effectiveness depends entirely on remaining adsorption capacity; an exhausted cartridge provides no protection and may leach previously adsorbed compounds. Does not remove nitrates, heavy metals, or pathogens reliably. Requires regular replacement per manufacturer schedule. |
| Chlorination | Requires adequate contact time (typically ≥ 30 minutes at correct dosage). Significantly less effective against Cryptosporidium and Giardia at standard doses. Forms disinfection by-products (THMs, HAAs) at elevated concentrations. Does not remove chemical contaminants. |
| Distillation | Energy-intensive. Volatile organic compounds (VOCs) with boiling points near or below water may carry over into the distillate unless a carbon post-filter is used. Slow throughput. |

### 2b. Contextual dependency notes (Option A — selective)

Add a short contextual note to method detail pages where a dependency on other treatment stages is operationally significant. This note appears as an additional row in the existing `InfoRow` block in `MethodDetail.tsx`, rendered only when the translation key is non-empty.

Translation key pattern: `methods.{id}.contextNote`

Methods that require a contextNote:

| Method | Note content |
|---|---|
| `reverse_osmosis` | "Requires pre-filtration (sediment + activated carbon) to protect the membrane and extend its service life." |
| `uv_disinfection` | "Requires low turbidity. Often installed after sediment and carbon filtration as the final disinfection stage." |
| `activated_carbon` | "Performance depends on cartridge condition. Part of most multi-stage systems; does not replace disinfection." |
| `chlorination` | "Requires sufficient contact time before the water reaches the consumer. Often followed by activated carbon to remove taste and disinfection by-products." |
| `distillation` | "VOC carry-over risk; a carbon post-filter is recommended for complete treatment." |
| `biosand` | "Biological layer (schmutzdecke) requires 2–4 weeks to establish. Flow rate must be maintained for the layer to remain active." |
| `hollow_fiber` | "Does not remove dissolved chemicals or heavy metals. Typically combined with activated carbon for comprehensive treatment." |

### Acceptance criteria

- [ ] `methods.{method_id}.limitations` translation values for the five priority methods are updated in both `en` and `ru`.
- [ ] `methods.{method_id}.contextNote` keys exist in both `en` and `ru` for the seven methods listed above.
- [ ] `MethodDetail.tsx` renders the contextNote row only when the translated value is non-empty (no visible change for methods without a note).
- [ ] No full educational explanation is duplicated from the Basics section — notes are one or two sentences only.

---

## Part 3 — New `/learn` index and `/learn/basics` page

### 3a. `/learn` index page (`src/pages/Learn/index.tsx`)

A new hub page served at `/learn`. It replaces the currently missing index for that path segment.

**Content:**
- Page title: "Learn" / "Узнать"
- Brief intro: the encyclopedia covers contaminants, treatment methods, and educational foundations.
- Three navigation cards linking to:
  1. `/learn/contaminants` — Contaminants encyclopedia
  2. `/learn/methods` — Treatment methods encyclopedia
  3. `/learn/basics` — Water treatment basics (new)

**Style:** consistent with the existing Contaminants and Methods hero/card pattern.

### 3b. `/learn/basics` page (`src/pages/Learn/Basics.tsx`)

A single scrollable page with six named sections, each with an anchor `id` for direct linking. Navigation between sections via in-page anchor links at the top of the page.

#### Sections

**Section 1 — Multi-stage treatment** (`id="section-multi-stage"`)

Content must cover:
- Why a single method rarely addresses all contaminants present in a water source.
- The concept of a treatment train: each stage targets a specific class of contaminants or protects the next stage.
- Three practical examples of common treatment trains:
  - Emergency field treatment: coagulation/flocculation → ceramic filtration → chlorination
  - Urban tap water: sediment filter → activated carbon → UV
  - Well water with hardness: sediment filter → water softener → activated carbon → UV
- Link to the configurator as the recommended tool for personalised system design.
- This section is linked from the configurator result screen.

**Section 2 — Surface water risks** (`id="section-surface-water"`)

Content must cover:
- Why rivers, lakes, and ponds carry higher and more variable contamination loads than groundwater.
- Biological risks: bacteria, viruses, protozoa, helminths — especially downstream of human or animal activity.
- Agricultural runoff: nitrates, pesticides, herbicides — seasonal variation.
- Industrial contamination: heavy metals, solvents, petroleum.
- The key safety principle: visual clarity does not indicate microbiological safety.
- Minimum recommended treatment train for surface water: coagulation/settling → filtration → disinfection.

**Section 3 — Water testing and laboratory analysis** (`id="section-water-testing"`)

Content must cover:
- When to test: before choosing a treatment system, after installing a new system, and periodically thereafter.
- Types of tests: basic potability panel (bacteria, nitrates, pH, turbidity), heavy metals panel, full chemical analysis.
- How to interpret results: WHO guideline values as a reference point; what "below detection limit" means.
- Home test kits vs. accredited laboratory: what each is suitable for.
- Testing after treatment: how to verify a system is performing as expected.

**Section 4 — Certification and standards** (`id="section-certification"`)

Content must cover:
- Why two products using the same technology can perform very differently.
- What NSF/ANSI certification means (NSF 42, 53, 58, 55) and what each certifies.
- WHO performance targets for household water treatment.
- The importance of testing under realistic conditions, not idealised lab conditions.
- Red flags: marketing claims without referenced certifications or test data.

**Section 5 — How to choose a treatment system** (`id="section-how-to-choose"`)

Content must cover:
- Start with a water test, not a product.
- Match the treatment method to the actual contaminant profile.
- Consider source water type (groundwater vs. surface water vs. municipal tap).
- Factor in operational context: electricity availability, maintenance capacity, flow rate requirements, budget.
- Multi-stage vs. single-stage: when each is appropriate.
- A decision framework as a short numbered list (6–8 steps).
- Link to the configurator.
- This section is linked from the configurator result screen.

**Section 6 — Common misconceptions** (`id="section-misconceptions"`)

Each misconception as a heading + short correction. Minimum six:
1. "Clear water is safe water" — turbidity is not a reliable indicator of microbiological or chemical safety.
2. "Boiling removes everything" — boiling kills pathogens but does not remove heavy metals, nitrates, or chemicals; may concentrate them.
3. "More filtration stages is always better" — redundant stages add cost without benefit; mismatched stages can introduce new problems.
4. "My filter is working because the water tastes good" — taste and odour thresholds are far above safety limits for most contaminants.
5. "Reverse osmosis is the safest option for all situations" — RO removes beneficial minerals, wastes water, and requires maintenance; it is not appropriate for all contexts.
6. "Once installed, a filter works indefinitely" — all treatment systems require maintenance; an exhausted or fouled filter may perform worse than no filter.

### Routing

Add to `src/router.tsx`:
```
{ path: 'learn',          element: <LearnIndex /> }
{ path: 'learn/basics',   element: <Basics /> }
```

### Navigation

Add "Basics" as a navigation entry from the `/learn` index page. The top-level nav (`App.tsx`) does not require a new item — existing links to `/learn/contaminants` and `/learn/methods` remain. The `/learn/basics` entry point is the Learn index page.

### i18n

All text lives in `public/locales/en/translation.json` and `public/locales/ru/translation.json` under the key namespace `basics.*`. No new JSON data file is required.

Recommended key structure:
```
basics.pageTitle
basics.pageIntro
basics.nav.{sectionKey}            ← in-page anchor nav labels
basics.multiStage.title
basics.multiStage.intro
basics.multiStage.examplesTrain    ← array of strings
...
basics.misconceptions.items        ← array of { heading, correction }
```

### Acceptance criteria

- [ ] `/learn` route renders a hub page with three navigation cards (Contaminants, Methods, Basics).
- [ ] `/learn/basics` renders all six sections with correct anchor `id` attributes.
- [ ] In-page navigation at the top of `/learn/basics` links to all six section anchors.
- [ ] All six sections contain the content specified above in both `en` and `ru`.
- [ ] `/learn/basics` is reachable via the Learn index page.
- [ ] No full topic content is duplicated on method or contaminant detail pages.
- [ ] Page renders correctly on mobile (single-column) and desktop.

---

## Out of scope

- Option C (reusable safety panel component) — deferred to a later requirement.
- `/learn/basics/:topic` individual topic routes — all content on a single page for MVP.
- Water testing laboratory directory or external links.
- Interactive decision tree for system selection (the configurator already serves this).
- Changes to the contaminant database (database is considered complete for current scope).

## Affected files

| File | Change |
|---|---|
| `src/data/treatment-methods.json` | `removes` array corrections if matrix verification finds errors |
| `public/locales/en/translation.json` | Expanded limitations (5 methods), new contextNote keys (7 methods), all `basics.*` content |
| `public/locales/ru/translation.json` | Same |
| `src/pages/Learn/index.tsx` | **New** — Learn hub page |
| `src/pages/Learn/Basics.tsx` | **New** — Basics page with 6 sections |
| `src/pages/Learn/MethodDetail.tsx` | Render `contextNote` row when key is non-empty |
| `src/router.tsx` | Add `learn` and `learn/basics` routes |
| `src/pages/Configurator.tsx` (result screen) | Add links to `/learn/basics#section-multi-stage` and `/learn/basics#section-how-to-choose` |

## Decisions (resolved)

1. **Visuals on `/learn/basics`:** Article-style layout — no animated particle headers. Clean, readable, optimised for long-form text. Consistent dark background (`bg-slate-950`) with prose typography.
2. **Russian content:** Full Russian translations written in the same pass, not deferred. Both `en` and `ru` must be complete before the feature ships.
3. **Link from configurator result:** Yes — the configurator result screen should link to `/learn/basics#section-multi-stage` ("Learn about multi-stage treatment") and `/learn/basics#section-how-to-choose` ("How to choose a system"). This is **in scope** for this requirement. Add to the affected files table below.

## Open questions

- None. All decisions resolved.
