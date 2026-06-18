# REQ-24: Explainable Recommendations — цепочка рассуждений

**Статус:** Done  
**Приоритет:** P1  
**Компонент:** configurator | ui  

## Описание

Вместо «Recommended: RO + Carbon» показывать пользователю *почему* каждый компонент был выбран. Это последний слой reasoning engine: движок уже знает шаги (REQ-22), уже оценил уверенность (REQ-23) — нужно показать это пользователю.

**Целевой вид:**

```
✅ Sediment Filter
   Added as required pre-filtration for UV and RO.

✅ Activated Carbon Block
   Addresses: chlorine, pesticides, VOCs
   Added as required pre-treatment to protect the RO membrane.

✅ RO Membrane
   Addresses: arsenic, nitrates, fluoride, lead, hardness

✅ UV Lamp
   Addresses: bacteria, viruses, protozoa

⚠️ Hydrogen sulfide — not addressed
   No module in this budget tier removes H₂S. Consider aeration as a pre-treatment step.

Data confidence: Low
   The selected source (well) has elevated risk for nitrates, arsenic, and iron.
   No water test results available. Consider laboratory analysis before installation.

Recommendation confidence: High
   All selected contaminants are addressed by the proposed system.
```

## Структура данных

`TierResult` расширяется (через REQ-22) полем `reasoningSteps: ReasoningStep[]`.

Для UI добавить новый вычисляемый тип `ExplainedTierResult`:

```typescript
export interface ModuleExplanation {
  moduleId: ModuleId
  role: 'primary' | 'prerequisite' | 'recommended'
  contaminantsAddressed: ContaminantId[]
  addedBecause: string   // human-readable
}

export interface ExplainedTierResult extends TierResult {
  moduleExplanations: ModuleExplanation[]
  unaddressedWithHints: {
    contaminantId: ContaminantId
    hint: string   // e.g., "Consider aeration" или "Requires higher budget tier"
  }[]
}
```

## UI — компонент `RecommendationExplainer`

Отдельный компонент, используемый в странице результата конфигуратора:

- Список выбранных модулей с иконкой ✅ + список закрываемых загрязнителей
- Список незакрытых загрязнителей с иконкой ⚠️ + подсказка
- Блок confidence с двумя строками: Data / Recommendation + reasons
- Компонент получает `ExplainedTierResult` и не делает логики сам

## Инкрементальный подход

Фаза 1 (MVP):
- Показать для каждого модуля: какие загрязнители он закрывает
- Показать незакрытые загрязнители
- Показать confidence score с reasons

Фаза 2 (после стабилизации):
- Полная цепочка рассуждений из `reasoningSteps`
- «Почему UV не выбран» при наличии turbidity (explanation of exclusions)
- Comparison view: почему medium лучше low для этого кейса

## Что нужно сделать

1. Реализовать `buildModuleExplanations(result: TierResult, input: WaterInput): ModuleExplanation[]`
2. Реализовать `buildUnaddressedHints(remaining: ContaminantId[], budget: BudgetTier): UnaddressedHint[]`
3. Создать компонент `RecommendationExplainer` в `src/components/configurator/Result/`
4. Интегрировать в страницу результата конфигуратора рядом с текущим Result-компонентом
5. Добавить i18n-ключи для объяснений модулей и подсказок

## Критерии приёмки

- [ ] Для каждого выбранного модуля показан список закрываемых им загрязнителей
- [ ] Prerequisite-модули (sediment, carbon перед RO) помечены как `prerequisite` с объяснением
- [ ] Незакрытые загрязнители показаны с ⚠️ и подсказкой (хотя бы «not available in this budget»)
- [ ] Confidence score (data + recommendation) отображается с reasons
- [ ] Компонент работает для всех трёх бюджетных тиров

## Ограничения

- Не менять существующий Result-компонент — добавить рядом
- Объяснения генерируются из данных, не хардкодятся в UI
- На мобильных экранах объяснения могут быть свёрнуты (accordion) — не обязательно всегда развёрнуты

## Связи

- Зависит от: REQ-22, REQ-23
- Блокирует: —
