# REQ-35: Acceptance Test Cleanup — удаление устаревших комментариев и уточнение T7

**Статус:** Approved  
**Приоритет:** P2  
**Компонент:** simulation | data  

## Описание

После добавления модулей `water_softener`, `iron_manganese_filter`, `oxidation_filter` (REQ-34)
ряд комментариев в `simulation.acceptance.test.ts` стал неактуальным. Кроме того, тест T7
ожидает общие модули (`sediment_5um`, `activated_carbon_block`, `uv_lamp_6w`), не связанные
со сценарием «железо + жёсткость, whole-house». Необходимо привести тесты в соответствие
с реальным поведением движка.

### 1. Удалить устаревшие комментарии

Убрать строки вида:
- `// This test is expected to FAIL until a whole_house softener/iron-filter module is added`
- `// This test is expected to FAIL until a module that removes H2S is added`
- `// This test is expected to FAIL until a whole_house softener module is added`

Все эти тесты сейчас проходят — комментарии вводят в заблуждение.

### 2. Обновить T7 — whole-house, железо + жёсткость

Текущая проверка:
```ts
const wholeHouseModules = ['sediment_5um', 'activated_carbon_block', 'uv_lamp_6w']
expect(mods.some(m => wholeHouseModules.includes(m))).toBe(true)
```
Эти модули не связаны со сценарием и не являются целевыми для whole-house iron/hardness.

Заменить на проверку, что среди модулей есть хотя бы один из:
- `water_softener`
- `iron_manganese_filter`
- `oxidation_filter`

### 3. Убрать `under_sink` из `water_softener.scopeTags`

Умягчитель — это whole-house устройство. Под-мойка (under_sink) не является стандартным
применением для умягчителя: под мойку ставят RO или угольные фильтры, но не ионный обмен
из-за требований к пространству, регенерации и объёму. Убрать `under_sink` из `scopeTags`.

## Критерии приёмки

- [ ] Ни один из 108 тестов не регрессирует
- [ ] В файле `simulation.acceptance.test.ts` нет комментариев "expected to FAIL"
- [ ] T7 проверяет `water_softener`, `iron_manganese_filter` или `oxidation_filter`
- [ ] `water_softener.scopeTags` содержит только `["whole_house"]`

## Ограничения

- Не менять логику движка
- Не добавлять новые тесты — только переписать существующие проверки
- Не трогать тесты, которые не упомянуты явно

## Связи

- Зависит от: REQ-33, REQ-34
