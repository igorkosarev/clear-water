# Requirement: Educational Content Overhaul

## What

Expand and correct all educational content across `contaminants.json`, `treatment-methods.json`, the English translation file, and the configurator's data layer. Add ~28 new contaminants, split the `heavy_metals` group into individual entries, add 5 new treatment methods, produce a machine-readable effectiveness matrix, and add safety/disclaimer text. Update `FilterTypes.ts` and the configurator `removes` arrays to reflect the expanded data.

## Why

The current 8-contaminant, 7-method dataset is an MVP placeholder. It contains oversimplified and scientifically inaccurate statements, omits entire contaminant categories (PFAS, heavy metal sub-types, microplastics, radioactive, agricultural), and is too thin to support credible configurator recommendations. Correcting this before redesigning the configurator engine prevents building on a flawed knowledge base.

---

## Phase 1 — Accuracy corrections (existing content)

### Statements to correct in `public/locales/en/translation.json`

| Location | Current statement | Problem | Corrected direction |
|---|---|---|---|
| `methods.activated_carbon.description` | "adsorbs chlorine, pesticides, **and heavy metals**" | GAC/carbon block has limited and inconsistent heavy metal removal; not a reliable primary metals treatment | "adsorbs chlorine, chlorination by-products, many pesticides, and some organic chemicals" |
| `methods.activated_carbon.howItWorks` | "some heavy metals onto its surface" | Same as above | Remove heavy metals claim; note it may reduce lead slightly via ion exchange in certified NSF/ANSI 53 blocks only |
| `methods.reverse_osmosis.description` | "removes **virtually all** dissolved contaminants" | Does not remove dissolved gases (radon, H₂S, CO₂) well; rejection varies by system quality | "removes the majority of dissolved inorganic contaminants including salts, most heavy metals, nitrates, and fluoride" |
| `methods.reverse_osmosis.howItWorks` | No mention of removal of beneficial minerals | RO also strips calcium and magnesium — remineralisation is often needed | Add: "also removes beneficial minerals; post-treatment remineralisation is recommended for long-term use" |
| `methods.uv_disinfection.description` | "destroys the DNA of bacteria, viruses, **and protozoa**" | Cryptosporidium requires 10× higher UV dose (40 mJ/cm²) than standard systems provide | "inactivates bacteria, viruses, and most protozoa at standard dose; Cryptosporidium requires validated high-dose systems" |
| `methods.biosand.description` | "biological layer that **removes** pathogens" | Biosand does NOT reliably remove viruses — virus removal is 0–1 log, considered ineffective | "reduces bacteria, protozoa, and turbidity; provides limited virus removal" |
| `contaminants.heavy_metals.description` | Treats all heavy metals as one group | Lead, arsenic, chromium-6 have distinct sources, health thresholds, and treatment requirements | Split into individual entries (see Phase 2) |
| `contaminants.chlorine.name` | "Chlorine / Taste & Odour" | Framing as a taste/odour issue understates the real concern: THM formation | Rename to "Chlorine & Disinfection By-products"; expand health risks to cover THMs/HAAs prominently |
| `methods.chlorination.limitations` | "forms potentially carcinogenic THMs" | "potentially" is weaker than the evidence supports — IARC Group 2A classification | "forms trihalomethanes (THMs) and haloacetic acids, classified as probable human carcinogens; risk increases with organic-rich source water" |

### `treatment-methods.json` — `removes` array corrections

| Method | Current `removes` | Correction |
|---|---|---|
| `activated_carbon` | `["chlorine", "heavy_metals"]` | Remove `heavy_metals`; add `chlorination_byproducts`, `pesticides`, `vocs` |
| `biosand` | `["bacteria", "protozoa", "turbidity"]` | Keep as-is (remove viruses if it was ever included — it is not, which is correct) |
| `uv_disinfection` | `["bacteria", "viruses", "protozoa"]` | Keep but add a new field `"notes"` or handle via text: Cryptosporidium requires high-dose certified system |

---

## Phase 2 — New contaminants

### Data model changes

- **Remove** `heavy_metals` entry from `contaminants.json` (replaced by individual metals below)
- **Add** all entries below to `contaminants.json` with the same field structure: `id`, `nameKey`, `descriptionKey`, `sourcesKey`, `healthRisksKey`, `detectionKey`, `category`, `color`
- **Add** corresponding translation strings to `public/locales/en/translation.json`

### Complete list of contaminants to add

#### Biological (category: `"biological"`)

| id | Name | color |
|---|---|---|
| `cyanobacteria` | Cyanobacteria (Blue-Green Algae) | `#16a34a` |
| `cyanotoxins` | Cyanotoxins (Microcystin etc.) | `#15803d` |

#### Physical (category: `"physical"`)

| id | Name | color |
|---|---|---|
| `sediment` | Sediment, Sand & Silt | `#92400e` |
| `microplastics` | Microplastics | `#7c3aed` |

*Note: `turbidity` entry stays but its description should clarify it is a measure, not a contaminant — sediment/silt are the underlying cause.*

#### Heavy metals — replace `heavy_metals` with individual entries (category: `"chemical"`)

| id | Name | color |
|---|---|---|
| `lead` | Lead (Pb) | `#6b7280` |
| `arsenic` | Arsenic (As) | `#78716c` |
| `mercury` | Mercury (Hg) | `#94a3b8` |
| `cadmium` | Cadmium (Cd) | `#64748b` |
| `chromium_6` | Chromium-6 (Cr-VI) | `#dc2626` |
| `copper` | Copper (Cu) | `#b45309` |

#### Agricultural (category: `"chemical"`)

| id | Name | color |
|---|---|---|
| `nitrites` | Nitrites | `#4ade80` |
| `pesticides` | Pesticides | `#84cc16` |
| `herbicides` | Herbicides | `#65a30d` |

#### Industrial (category: `"chemical"`)

| id | Name | color |
|---|---|---|
| `pfas` | PFAS (Forever Chemicals) | `#f43f5e` |
| `vocs` | Volatile Organic Compounds (VOCs) | `#fb923c` |
| `petroleum` | Petroleum & Fuel Residues | `#b45309` |

#### Mineral / Water Quality (category: `"physical"` or `"chemical"` as noted)

| id | Name | category | color |
|---|---|---|---|
| `hardness` | Hardness (Calcium & Magnesium) | `physical` | `#e2e8f0` |
| `iron` | Iron (Fe) | `chemical` | `#b45309` |
| `manganese` | Manganese (Mn) | `chemical` | `#7c3aed` |
| `salinity` | High Salinity / TDS | `physical` | `#0ea5e9` |
| `hydrogen_sulfide` | Hydrogen Sulfide (H₂S) | `chemical` | `#facc15` |

#### Emerging (category: `"chemical"`)

| id | Name | color |
|---|---|---|
| `pharmaceuticals` | Pharmaceutical Residues | `#e879f9` |
| `hormones` | Hormones & Endocrine Disruptors | `#c084fc` |

#### Radioactive (category: `"radiological"`)

| id | Name | color |
|---|---|---|
| `uranium` | Uranium | `#4ade80` |
| `radon` | Radon | `#a3e635` |
| `radionuclides` | Radionuclides (general) | `#86efac` |

### Content requirements per contaminant (translation keys)

Each new entry must have:
- `contaminants.{id}.name` — display name
- `contaminants.{id}.description` — 1–2 sentence overview, no marketing language
- `contaminants.{id}.sources` — typical environmental/anthropogenic sources
- `contaminants.{id}.healthRisks` — evidence-based health effects with WHO/EPA thresholds where available; no absolute safety claims
- `contaminants.{id}.detection` — how to detect; note limitations of field vs lab testing

---

## Phase 3 — New and updated treatment methods

### New methods to add to `treatment-methods.json`

Same field structure as existing methods. Add to `public/locales/en/translation.json`.

| id | Name | complexity | costTier | color |
|---|---|---|---|---|
| `hollow_fiber` | Hollow Fiber / Ultrafiltration | `intermediate` | `medium` | `#38bdf8` |
| `distillation` | Distillation | `beginner` | `medium` | `#94a3b8` |
| `ion_exchange` | Ion Exchange | `advanced` | `high` | `#f59e0b` |
| `water_softening` | Water Softening | `intermediate` | `medium` | `#60a5fa` |
| `sediment_filtration` | Sediment / Mechanical Filtration | `beginner` | `low` | `#a8a29e` |

### `removes` arrays for new methods (indicative — confirmed in matrix)

| Method | removes |
|---|---|
| `hollow_fiber` | `["bacteria", "protozoa", "cyanobacteria", "turbidity", "sediment", "microplastics"]` |
| `distillation` | `["bacteria", "viruses", "protozoa", "lead", "arsenic", "mercury", "cadmium", "chromium_6", "copper", "nitrates", "nitrites", "fluoride", "salinity", "heavy_metals"]` |
| `ion_exchange` | `["lead", "arsenic", "cadmium", "nitrates", "nitrites", "fluoride", "hardness"]` |
| `water_softening` | `["hardness", "iron", "manganese"]` |
| `sediment_filtration` | `["turbidity", "sediment"]` |

### Content requirements per method (translation keys)

- `methods.{id}.name`
- `methods.{id}.description` — concise overview
- `methods.{id}.howItWorks` — mechanism, no absolute claims
- `methods.{id}.limitations` — must include what it does NOT remove
- `methods.{id}.typicalUse` — typical deployment context

### Existing methods — text updates required

All existing method texts must be reviewed for:
- No use of "removes everything", "completely safe", "guarantees safety"
- Explicit statement of what the method does NOT remove
- Maintenance requirements mentioned in `limitations`

---

## Phase 4 — Effectiveness matrix

### New file: `src/data/effectiveness-matrix.json`

Structure:

```json
{
  "version": 1,
  "legend": {
    "effective": "Removes or inactivates reliably under normal operating conditions",
    "partial": "Partially effective; depends on dose, contact time, or system design",
    "not_effective": "Not designed to address this contaminant",
    "depends": "Effectiveness depends on certification, water chemistry, or configuration"
  },
  "matrix": {
    "method_id": {
      "contaminant_id": "effective | partial | not_effective | depends"
    }
  }
}
```

The matrix must cover all contaminants × all methods. Values based on WHO, NSF/ANSI, EPA guidance. Developer must populate this with correct values — it is not a UI mock.

---

## Phase 5 — Safety disclaimers

### New translation keys to add under `safety.*`

```
safety.testingRequired.title
safety.testingRequired.body
safety.surfaceWaterRisks.title
safety.surfaceWaterRisks.body
safety.maintenanceRequired.title
safety.maintenanceRequired.body
```

**Content guidelines:**
- `testingRequired`: Water appearance does not indicate safety. Many contaminants are colourless, odourless, and tasteless. Water testing by a certified laboratory is recommended before selecting a treatment system.
- `surfaceWaterRisks`: Surface water (rivers, lakes, ponds) may contain biological, agricultural, and industrial contamination simultaneously. Multiple treatment stages are typically required.
- `maintenanceRequired`: All treatment systems require maintenance. Expired filter cartridges, fouled membranes, and depleted UV lamps do not provide protection. Improperly maintained systems may provide false assurance and increase health risk.

These strings are stored now for use in future UI components (e.g., configurator result page, encyclopedia footer). No UI component is required in this task — content only.

---

## Phase 6 — FilterTypes.ts updates

### New `FilterType` values to add

```ts
| 'hollow_fiber'
| 'distillation'
| 'ion_exchange'
| 'water_softening'
| 'sediment_filtration'
```

### `FILTER_TYPE_CONFIG` entries for new types

Each needs `color`, `label`, `Icon` (Lucide), and `removes` array matching the treatment-methods.json entries.

### Remove / migrate `heavy_metals` from all `removes` arrays

After splitting heavy_metals into individual contaminants, update `removes` arrays in:
- `FilterTypes.ts` (FILTER_TYPE_CONFIG)
- `treatment-methods.json`
- Any other reference

---

## Acceptance criteria

### Data completeness
- [ ] `contaminants.json` contains all entries listed in Phase 2 (no `heavy_metals` group entry remains)
- [ ] `treatment-methods.json` contains all entries listed in Phase 3
- [ ] `src/data/effectiveness-matrix.json` exists and covers all contaminant × method combinations with one of the four defined values
- [ ] All new contaminants and methods have complete translation strings in `public/locales/en/translation.json`

### Accuracy
- [ ] `activated_carbon.removes` no longer contains `heavy_metals`
- [ ] `activated_carbon` description does not claim heavy metal removal
- [ ] `reverse_osmosis` description does not use "virtually all"
- [ ] All method texts include an explicit statement of what the method does NOT remove
- [ ] No method text uses language such as "removes everything", "completely safe", or "guarantees safety"
- [ ] `uv_disinfection` text notes dose-dependence for Cryptosporidium
- [ ] `biosand` text does not claim virus removal

### New content
- [ ] All new contaminants have `description`, `sources`, `healthRisks`, `detection` text — scientifically grounded, no marketing language
- [ ] All new methods have `howItWorks`, `limitations`, `typicalUse` text
- [ ] Safety disclaimer strings exist under `safety.*` translation keys

### Code
- [ ] `FilterTypes.ts` includes all new FilterType values with correct Lucide icons and `removes` arrays
- [ ] TypeScript compiles with no errors after all changes
- [ ] Existing contaminant detail pages (`/learn/contaminants/:id`) render for all new contaminant IDs

---

## Out of scope

- Russian (`ru`) translations — English-first; Russian deferred
- UI/UX changes to encyclopedia pages beyond rendering new content
- Configurator wizard step redesign
- Contaminant particle animation patterns for new entries (use fallback/default)
- Supplier data updates
- Assembly guides referencing new filter types

---

## Affected files

- `src/data/contaminants.json` — expand and split
- `src/data/treatment-methods.json` — expand and correct
- `src/data/effectiveness-matrix.json` — new file
- `src/components/filter/FilterTypes.ts` — new FilterType values
- `public/locales/en/translation.json` — all new content + corrections
- `src/components/encyclopedia/contaminantConfig.ts` — add Lucide icons for new contaminants
- `src/pages/Learn/ContaminantDetail.tsx` — particle PATTERNS map needs fallback for new IDs (no animation needed — use empty `[]`)

---

## Open questions

- None — all decisions resolved.
