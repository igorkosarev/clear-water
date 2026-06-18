# REQ-23: Confidence Scoring — двумерная оценка уверенности

**Статус:** Done  
**Приоритет:** P1  
**Компонент:** simulation | configurator  

## Описание

Добавить двумерную оценку уверенности к каждому `TierResult`. Confidence отвечает на вопрос *насколько можно доверять рекомендации*, а не *какую систему выбрать*.

**Два независимых измерения:**

### 1. Data Confidence
Насколько полны и надёжны входные данные.

| Сигнал | Вес | Направление |
|---|---|---|
| Источник воды указан | +1 | ↑ |
| Хотя бы один загрязнитель выбран явно | +1 | ↑ |
| Загрязнители выбраны И соответствуют профилю источника | +1 | ↑ |
| Источник = `well` без явно выбранных химических загрязнителей | −1 | ↓ |
| У источника есть `riskFactors`, ни один не выбран | −1 | ↓ |
| Advisory `water_testing` активен и не исполнен | −1 | ↓ |

Итог: `high` (3+), `medium` (1–2), `low` (0 и ниже).

### 2. Recommendation Confidence
Насколько хорошо предложенная система закрывает заявленные требования.

| Сигнал | Порог | Уровень |
|---|---|---|
| `removedContaminants / totalRequired` | ≥ 0.9 | `high` |
| | 0.6–0.89 | `medium` |
| | < 0.6 | `low` |

При `remainingContaminants.length > 0` рекомендация не может быть `high`.

## Тип данных

```typescript
export type ConfidenceLevel = 'high' | 'medium' | 'low'

export interface ConfidenceScore {
  data: ConfidenceLevel
  recommendation: ConfidenceLevel
  dataReasons: string[]          // i18n keys или plain strings для UI
  recommendationReasons: string[]
}
```

`TierResult` расширяется полем `confidence: ConfidenceScore`.

## Примеры

**Муниципальная вода, хлор + вкус, Carbon + UV:**
```
dataConfidence: high
  — source known: tap
  — contaminants explicitly selected: chlorine
  — inferred contaminants match profile
recommendationConfidence: high
  — all selected contaminants addressed
```

**Колодец без анализа, только bacteria выбрана:**
```
dataConfidence: low
  — well source: riskFactors present (nitrates, arsenic, iron, manganese) not selected
  — advisory: water_testing not acknowledged
recommendationConfidence: high
  — selected contaminants fully addressed
```

**Колодец, arsenic + nitrates, бюджет low:**
```
dataConfidence: medium
recommendationConfidence: low
  — arsenic not addressed (RO outside low budget)
  — 1 of 2 contaminants covered
```

## Что нужно сделать

1. Добавить `ConfidenceLevel` и `ConfidenceScore` в `src/types/index.ts`
2. Реализовать `computeConfidence(input: WaterInput, result: TierResult, profile: SourceProfile): ConfidenceScore`
3. Вызывать в `runSimulation`, добавлять в каждый `TierResult`
4. Передавать `profile` в `runSimulation` из hook/context

## Критерии приёмки

- [ ] `TierResult` содержит `confidence: ConfidenceScore`
- [ ] Для tap + chlorine: dataConfidence = high, recommendationConfidence = high
- [ ] Для well + no chemical selection: dataConfidence = low
- [ ] Для любого TierResult с remainingContaminants > 0: recommendationConfidence ≠ high
- [ ] `dataReasons` и `recommendationReasons` содержат человекочитаемые строки

## Ограничения

- Confidence — только вычисляемое свойство результата, не входной параметр
- Не давать пользователю возможность «повысить» confidence без реальных данных
- Формулы могут упрощаться — важна корректность полярности (low-data ↔ low-confidence)

## Связи

- Зависит от: REQ-21, REQ-22
- Блокирует: REQ-24
