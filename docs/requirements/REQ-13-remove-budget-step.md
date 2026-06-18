# REQ-13: Remove Budget Step, Auto-select Best Coverage as Primary

**Статус:** Approved  
**Приоритет:** P1  
**Компонент:** configurator  

## Описание

Шаг «Budget» убирает ненужное трение: пользователь не знает заранее, сколько стоит нужная ему система. Вместо явного выбора бюджета движок сам вычисляет все три тира и показывает основной результат — тот, который убирает больше всего загрязнителей. Остальные тиры остаются в «Other Options».

«Optimise for» (предпочтение cost / coverage) переезжает в отдельный последний шаг перед завершением wizard.

## Новый порядок шагов

1. Source
2. Problems
3. Use
4. Pressure
5. **Optimise for** (новый финальный шаг — только preference toggle)

→ Wizard завершается → движок вычисляет все три тира → primary = тир с наибольшим `removedContaminants.length`; при равном покрытии — тир с наименьшей стоимостью.

## Изменения

### `WaterInput`
Поле `budget: BudgetTier` убирается. Движок больше не получает целевой бюджет от пользователя.

```ts
interface WaterInput {
  country: string
  source: WaterSourceType
  contaminants: ContaminantId[]
  use: WaterUseType
  inletPressureBar: number
  preference: OptimizationPreference
}
```

### `GreedySimulationResult`
Поле `primaryBudget` вычисляется движком, а не берётся из `WaterInput`:

```ts
interface GreedySimulationResult {
  tiers: TierResult[]
  primaryBudget: BudgetTier  // тир с max removedContaminants (tie-break: min cost)
}
```

### `Wizard.tsx`
- Удалить `StepBudget` из последовательности шагов
- Добавить новый шаг `StepPreference` (5-й, последний) — только переключатель cost/coverage
- `advanceFromPressure` (бывший `advanceFromBudget`) передаёт preference в `WaterInput` при завершении
- Шаг Pressure теперь получает preview-модули на основе medium-бюджета как дефолтного (для отображения давления)

### `StepBudget.tsx`
Удалить файл. Создать `StepPreference.tsx` — минималистичный шаг только с двумя кнопками preference.

### `src/engine/simulation.ts`
```ts
export function runSimulation(input: WaterInput): GreedySimulationResult {
  // вычислить все три тира
  // primaryBudget = тир с max(removedContaminants.length),
  //                 tie-break: min(estimatedCostUSD)
}
```

## Критерии приёмки

- [ ] Шаг Budget удалён из wizard, шагов стало 5 (Source → Problems → Use → Pressure → Optimise for)
- [ ] Новый шаг `StepPreference` содержит только preference toggle (Cost / Coverage), без budget-карточек
- [ ] `WaterInput` не содержит поля `budget`
- [ ] Движок самостоятельно определяет `primaryBudget` по максимальному покрытию
- [ ] При равном покрытии выбирается более дешёвый тир
- [ ] ResultPanel показывает primary как самый эффективный тир
- [ ] TypeScript strict: нет `any`
- [ ] i18n: строки нового шага через `t()`

## Ограничения

- Не убирать вычисление всех трёх тиров — они всё ещё нужны для «Other Options»
- `BudgetTier` тип оставить — он используется в `TierResult`, `SystemTemplate` и данных
- Не менять страницы `/systems` — там `SystemTemplate.budgetTier` остаётся

## Связи

- Зависит от: `src/components/configurator/Wizard.tsx`, `src/engine/simulation.ts`, `src/types/index.ts`
- Блокирует: отображение primary в ResultPanel (REQ-10)
- Связано с: REQ-11, REQ-12
