# REQ-22: Reasoning Engine — ограничения как первоклассные правила

**Статус:** Done  
**Приоритет:** P1  
**Компонент:** simulation  

## Описание

Текущий greedy-движок (`simulation.ts`) работает по схеме: для каждого загрязнителя ищет модуль с максимальным overlap, добавляет в систему, повторяет. Предварительные условия (`PREREQUISITES`) проверяются *после* отбора — движок сначала выбирает UV, потом добавляет sediment как обязательный.

Проблема: движок не *рассуждает* о порядке, а *исправляет* порядок постфактум. Это работает для простых случаев, но даёт неверные результаты когда:
- UV выбирается при наличии turbidity (turbidity блокирует UV, а не просто требует предфильтрации)
- Несовместимые методы выбираются вместе
- Нужна логика ветвления: «если arsenic И nitrates → RO — единственное пересечение»

Нужно перевести ограничения в *предусловия выбора*, а не постусловия.

## Архитектура

### Новый файл данных: `src/data/treatment-constraints.json`

```json
{
  "uv_disinfection": {
    "waterConditionRequires": ["low_turbidity"],
    "moduleRequires": ["sediment"],
    "incompatibleWith": []
  },
  "reverse_osmosis": {
    "waterConditionRequires": ["adequate_pressure"],
    "moduleRequires": ["sediment", "activated_carbon"],
    "incompatibleWith": []
  },
  "activated_carbon": {
    "waterConditionRequires": [],
    "moduleRequires": ["sediment"],
    "incompatibleWith": []
  }
}
```

`waterConditionRequires` — абстрактные состояния воды, вычисляемые из набора загрязнителей:
- `"low_turbidity"` → `turbidity` не входит в активные требования

### Изменения в движке

1. Перед scoring кандидата проверять `waterConditionRequires` и `incompatibleWith` — если условие не выполнено, модуль исключается из кандидатов этого прохода.
2. Вместо добавления prerequisite-модулей *после* финального выбора — добавлять их *до* scoring (как обязательные первые слоты).
3. Greedy-цикл остаётся, но теперь работает над *валидными кандидатами*, а не над всеми модулями.

### Логика вычисления состояний воды

```
WaterCondition "low_turbidity": turbidity NOT in activeContaminants
WaterCondition "adequate_pressure": выводится из inletPressureBar
```

### Вывод цепочки рассуждений

Движок накапливает лог решений:
```typescript
type ReasoningStep = {
  action: 'select' | 'exclude' | 'require'
  moduleId: string
  reason: string        // human-readable
  contaminantsAddressed?: ContaminantId[]
  constraint?: string   // если action === 'exclude'
}
```

Этот лог передаётся в `TierResult` и используется REQ-24 для explainable output.

## Что нужно сделать

1. Создать `src/data/treatment-constraints.json`
2. Добавить `WaterCondition` type и функцию `evaluateWaterConditions(contaminants: ContaminantId[]): Set<WaterCondition>`
3. Обновить greedy-цикл: фильтровать кандидатов по constraints до scoring
4. Добавить `reasoningSteps: ReasoningStep[]` в `TierResult`
5. Обновить `enforcePrerequisites` → перенести логику в начало greedy-цикла

## Критерии приёмки

- [ ] При наличии `turbidity` в требованиях UV не выбирается до добавления sediment-фильтра
- [ ] `treatmentConstraints.json` охватывает UV, RO, hollow_fiber, activated_carbon, ion_exchange
- [ ] `reasoningSteps` присутствуют в каждом `TierResult`
- [ ] Сценарий «arsenic + nitrates → RO» даёт RO как первый выбранный модуль
- [ ] Нет регрессий: существующие тест-кейсы конфигуратора дают те же или лучшие результаты

## Ограничения

- Не менять структуру `WaterInput` — только внутреннюю логику движка
- Greedy-алгоритм остаётся (не CSP-solver) — улучшается эвристика, не алгоритм
- Не вводить ИИ или вероятностные модели — только детерминированные правила

## Связи

- Зависит от: REQ-21
- Блокирует: REQ-23, REQ-24
