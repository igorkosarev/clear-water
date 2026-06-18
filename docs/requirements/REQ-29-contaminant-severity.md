# REQ-29: Contaminant Severity — уровень серьёзности загрязнения (Advanced Mode)

**Статус:** Done  
**Приоритет:** P2  
**Компонент:** simulation | configurator | i18n  

## Описание

В Advanced Mode (REQ-28) пользователь знает не только *какой* загрязнитель присутствует, но и *насколько*. Severity позволяет движку лучше расставить приоритеты, не требуя точных числовых значений.

Severity — опциональное поле, не обязательное для завершения wizard.

**Значения:**

| Значение | Описание |
|---|---|
| `low` | Ниже порога здоровья, но присутствует |
| `medium` | Приближается к пределу / превышает рекомендованное |
| `high` | Значительно превышает допустимый уровень |
| `unknown` | Не определено (по умолчанию) |

## Модель данных

`ContaminantEntry` (из REQ-27) расширяется:

```typescript
export type ContaminantSeverity = 'low' | 'medium' | 'high' | 'unknown'

export interface ContaminantEntry {
  id: ContaminantId
  status: ContaminantStatus
  severity?: ContaminantSeverity  // только в Advanced Mode
}
```

**Влияние на движок:**

| Severity | Scoring weight |
|---|---|
| `high` | ×1.5 поверх status-веса |
| `medium` | ×1.2 |
| `low` | ×0.9 |
| `unknown` | ×1.0 (нейтрально) |

Пример: `confirmed` + `high` → итоговый вес = 2.0 × 1.5 = 3.0.

**Влияние на confidence:**

- Наличие хотя бы одного `high` severity загрязнителя при `testingStatus = 'laboratory'` → `dataConfidence` +1.
- `high` severity + `testingStatus = 'none'` → в `dataReasons` добавляется: "High severity reported but not laboratory-confirmed — testing strongly recommended".

## Что нужно сделать

1. Добавить `ContaminantSeverity` в `src/types/index.ts`.
2. Добавить опциональное поле `severity?: ContaminantSeverity` в `ContaminantEntry`.
3. В `normalizeContaminants()` — severity по умолчанию `'unknown'`.
4. В greedy scoring применять severity-множитель поверх status-веса.
5. В `computeConfidence` учитывать комбинацию `high severity + laboratory` / `high severity + none`.
6. В Advanced Mode UI: для каждого выбранного загрязнителя показать опциональный selector severity (4 radio-кнопки).
7. В `RecommendationExplainer` показывать severity badge рядом с `ContaminantBadge` для `high` и `medium`.

## Критерии приёмки

- [ ] `ContaminantSeverity` тип существует
- [ ] `ContaminantEntry.severity` опциональное, дефолт `'unknown'`
- [ ] Scoring применяет severity-множитель к весу загрязнителя
- [ ] `high` + `laboratory` повышает dataConfidence
- [ ] `high` + `none` добавляет reasoning reason к dataReasons
- [ ] Advanced Mode UI показывает severity selector
- [ ] Simple Mode не затронут — severity не отображается и не требуется

## Ограничения

- Severity — только для Advanced Mode; в Simple Mode severity = `'unknown'` для всех
- Не требовать числовых значений концентрации
- Не изменять структуру `TierResult` — только логику scoring

## Связи

- Зависит от: REQ-27, REQ-28
- Блокирует: REQ-31
