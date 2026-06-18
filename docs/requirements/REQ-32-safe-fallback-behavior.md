# REQ-32: Safe Fallback Behavior — безопасное поведение при недостатке данных

**Статус:** Done  
**Приоритет:** P1  
**Компонент:** configurator | ui | i18n  

## Описание

Система должна честно сообщать пользователю о качестве своей рекомендации. Нельзя показывать уверенную рекомендацию, если критической информации нет. Текущий explainer (REQ-24) уже показывает advisory `water_testing` — это расширение добавляет формальную политику fallback и UI-обратную связь.

**Политика fallback:**

| Условие | Действие |
|---|---|
| `dataConfidence = 'low'` | Показать баннер «Limited data — recommendations may not reflect your actual water quality» |
| `recommendationConfidence = 'low'` | Показать баннер «Some contaminants cannot be addressed within the selected budget and scope» |
| `dataConfidence = 'low'` + `use = 'drinking'` | Усиленный баннер + recommended action: «Have your water tested before installation» |
| `testingStatus = 'none'` + source = `well` | Автоматически добавить advisory `water_testing` даже без явного riskFactor |
| Все `remainingContaminants` не адресованы (`recommendationConfidence = 'low'`) + `use = 'drinking'` | Показать предупреждение: «This system does not address all detected contaminants. Not recommended for drinking water without additional treatment.» |

**Правило «не молчать»:**

Каждая причина низкой confidence должна быть явно указана в `dataReasons` или `recommendationReasons` — не просто отображать уровень "Low", но и объяснять почему.

## Что нужно сделать

1. В `RecommendationExplainer` добавить `FallbackBanner` компонент:
   - Красный/жёлтый баннер в зависимости от severity.
   - Видим только при `dataConfidence = 'low'` или `recommendationConfidence = 'low'`.
2. В `computeConfidence` (REQ-31): при `well` + `testingStatus = 'none'` → добавить `water_testing` в advisories независимо от riskFactors.
3. В `GreedySimulationResult.advisories`: не удалять источниковые advisories если движок добавляет свои.
4. В `ResultPanel`: при критической ситуации (`dataConfidence = 'low'` + `use = 'drinking'`) показать предупреждение над TierResult-карточкой.
5. Добавить i18n-ключи:
   - `result.fallback.limitedData`
   - `result.fallback.incompleteAddressing`
   - `result.fallback.drinkingWaterWarning`
   - `result.fallback.testBeforeInstall`
6. `FallbackBanner` получает `{ confidence: ConfidenceScore, use: WaterUseType, advisories: string[] }` и рендерит нужный контент.

## Критерии приёмки

- [ ] `FallbackBanner` отображается при `dataConfidence = 'low'`
- [ ] `FallbackBanner` отображается при `recommendationConfidence = 'low'`
- [ ] При `well + none + drinking`: показывается усиленный баннер + рекомендация лаб. анализа
- [ ] При `dataConfidence = 'high'` и `recommendationConfidence = 'high'` баннер не отображается
- [ ] `dataReasons` никогда не пустой при `dataConfidence = 'low'`
- [ ] Все i18n-ключи добавлены в `en/translation.json`
- [ ] `FallbackBanner` не отображается в Simple Mode с хорошими входными данными

## Ограничения

- Не убирать существующий advisory блок в `RecommendationExplainer` — добавлять рядом
- Не блокировать пользователя от просмотра рекомендации — только предупреждать
- `FallbackBanner` — только UI компонент, не меняет логику engine

## Связи

- Зависит от: REQ-24, REQ-31
- Блокирует: —
