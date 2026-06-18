# REQ-31: Extended Confidence Logic — расширенная формула уверенности

**Статус:** Done  
**Приоритет:** P1  
**Компонент:** simulation | i18n  

## Описание

Текущая `computeConfidence` (REQ-23) учитывает: источник воды, явно выбранные загрязнители, riskFactors, advisory `water_testing`. После реализации REQ-25–REQ-30 появились новые сигналы, которые должны влиять на уверенность.

Цель: чётко разграничить «сильная рекомендация на основе данных» и «предположительная рекомендация при отсутствии данных».

**Обновлённая формула `dataConfidence`:**

| Сигнал | Δ score | Условие |
|---|---|---|
| Источник воды указан | +1 | всегда |
| Хотя бы один загрязнитель selected | +1 | всегда |
| Загрязнители overlap с профилем источника | +1 | если есть overlap |
| `testingStatus = 'laboratory'` | +2 | — |
| `testingStatus = 'home_kit'` | +1 | — |
| `testingStatus = 'none'` | −1 | — |
| Наличие confirmed загрязнителей | +1 | до макс. +2 суммарно |
| riskFactors не выбраны ни одного | −1 | если profile имеет riskFactors |
| Advisory `water_testing` активен | −1 | — |
| `use = 'drinking'/'emergency_survival'` + score < 2 | −1 | higher stakes penalty |

Уровни: `high` (≥ 4), `medium` (2–3), `low` (≤ 1).

**Обновлённая формула `recommendationConfidence`:**

| Сигнал | Пороги |
|---|---|
| `removedContaminants / totalRequired` (confirmed) | ≥ 0.9 → high; 0.6–0.89 → medium; < 0.6 → low |
| Наличие `high`-severity unaddressed загрязнителей | ограничивает до medium |
| `scope` задан и не все модули подходят | ограничивает до medium |

Если `remainingContaminants.length > 0` → `recommendationConfidence ≠ high` (сохраняется из REQ-23).

**Приоритизация `dataReasons` (порядок в UI):**

1. Критические warnings (no testing + high severity)
2. Нейтральные positive signals (laboratory, confirmed)
3. Advisory recommendations (water testing)

## Что нужно сделать

1. Обновить `computeConfidence` в `src/engine/simulation.ts` по новой формуле.
2. Обновить сигнатуру: добавить `testingStatus`, `contaminantEntries: ContaminantEntry[]`, `scope?: TreatmentScope` как параметры (или передавать через расширенный `WaterInput`).
3. Обновить пороговые уровни: `high` = 4+, `medium` = 2–3, `low` = ≤ 1.
4. Добавить новые ключи в `dataReasons`:
   - `"Laboratory analysis provided — high data reliability"`
   - `"Home test kit used — moderate reliability"`
   - `"No water testing performed — recommendations based on source profile only"`
   - `"Confirmed contaminants detected — high priority treatment required"`
   - `"High severity unaddressed: [name] — consider higher budget or specialized treatment"`
5. Добавить i18n-ключи для всех новых `dataReasons` строк.
6. Обновить существующие сценарии Playwright так, чтобы новые пороги не давали регрессий (пересмотреть ожидаемые уровни).

## Критерии приёмки

- [ ] `computeConfidence` принимает `testingStatus`, `ContaminantEntry[]`, `scope?`
- [ ] `laboratory` + confirmed → dataConfidence = high
- [ ] `none` + riskFactors + no selection → dataConfidence = low
- [ ] `high` severity unaddressed → recommendationConfidence ≤ medium
- [ ] `scope` constraint без совместимых модулей → recommendationConfidence ≤ medium
- [ ] Все новые `dataReasons` строки переведены (en)
- [ ] Существующие тест-сценарии (river/tap/well) дают корректные уровни с новыми порогами

## Ограничения

- Не менять интерфейс `ConfidenceScore` — только логику `computeConfidence`
- Не снижать уверенность искусственно — нейтральный ввод должен давать `medium`, не `low`
- Обратная совместимость: если `testingStatus` не передан → применяется старая логика advisory

## Связи

- Зависит от: REQ-23, REQ-25, REQ-26, REQ-27, REQ-29, REQ-30
- Блокирует: REQ-32
