# REQ-27: Contaminant Certainty Model — подтверждённые vs предполагаемые загрязнители

**Статус:** Done  
**Приоритет:** P1  
**Компонент:** simulation | data | configurator | i18n  

## Описание

Сейчас `WaterInput.contaminants: ContaminantId[]` — плоский список. Движок не знает, лабораторно ли подтверждён каждый загрязнитель или пользователь предполагает его наличие по симптомам. Нужно добавить статус уверенности к каждому загрязнителю.

**Три уровня статуса:**

| Статус | Источник | Влияние |
|---|---|---|
| `confirmed` | Лабораторный анализ / официальный отчёт | Максимальный приоритет в scoring; dataConfidence +1 на каждый confirmed |
| `suspected` | Симптомы, вкус, запах, пользовательский выбор | Нормальный приоритет; не влияет на confidence напрямую |
| `inferred` | Автоматически из source profile | Снижен приоритет; если ни одного inferred нет в confirmed → riskFactor не выбран → confidence −1 |

**Расширение source profiles (данные):**

Добавить в `src/data/source-profiles.json` недостающие загрязнители:
- `tap` / `municipal`: `chloramines` в riskFactors
- `rain`: `roof_contamination` (как alias/tag, не самостоятельный контаминант) → mapped на bacteria + sediment inferred
- `well`: добавить `salinity` в riskFactors

## Модель данных

```typescript
export type ContaminantStatus = 'confirmed' | 'suspected' | 'inferred'

export interface ContaminantEntry {
  id: ContaminantId
  status: ContaminantStatus
}
```

`WaterInput.contaminants` меняется с `ContaminantId[]` на `ContaminantEntry[]`.

**Обратная совместимость:** все существующие call sites передают `ContaminantId[]` — добавить вспомогательную функцию:

```typescript
function normalizeContaminants(raw: ContaminantId[] | ContaminantEntry[]): ContaminantEntry[]
// ContaminantId[] → все как 'suspected'
```

## Влияние на движок

- В greedy scoring: `confirmed` загрязнитель получает вес ×2 по сравнению с `suspected`; `inferred` — ×0.75.
- `computeConfidence`: каждый `confirmed` загрязнитель: dataScore +1 (до макс. +2 суммарно).
- `GreedySimulationResult.inferredContaminants` остаётся: движок помечает автодобавленные как `inferred`.

## Что нужно сделать

1. Добавить `ContaminantStatus` и `ContaminantEntry` в `src/types/index.ts`.
2. Изменить `WaterInput.contaminants: ContaminantEntry[]`.
3. Добавить `normalizeContaminants()` в `src/engine/simulation.ts` для обратной совместимости.
4. Обновить `runSimulation` и `computeConfidence` для учёта `ContaminantStatus`.
5. Обновить `src/data/source-profiles.json`: добавить `chloramines`, `salinity` в соответствующие профили.
6. В Simple Mode wizard: все выбранные пользователем контаминанты = `suspected` по умолчанию.
7. В Advanced Mode (REQ-28): пользователь выбирает статус вручную.

## Критерии приёмки

- [ ] `ContaminantEntry` тип существует в `src/types/index.ts`
- [ ] `WaterInput.contaminants` принимает `ContaminantEntry[]`
- [ ] `normalizeContaminants` корректно конвертирует `ContaminantId[]`
- [ ] Confirmed загрязнитель получает удвоенный приоритет в greedy scoring
- [ ] `dataConfidence` растёт при наличии confirmed загрязнителей
- [ ] Source profiles обновлены: chloramines в tap/rain, salinity в well
- [ ] Все существующие сценарии (Simple Mode) работают без изменений

## Ограничения

- Не ломать существующий Simple Mode — все выбранные через симптомы = `suspected`
- Не требовать `status` во входных данных — `normalizeContaminants` делает это прозрачным
- `inferred` статус назначается движком, не пользователем

## Связи

- Зависит от: REQ-21, REQ-26
- Блокирует: REQ-28, REQ-29, REQ-31
