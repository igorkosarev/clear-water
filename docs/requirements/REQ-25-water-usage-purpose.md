# REQ-25: Water Usage Purpose — назначение воды как фактор приоритизации

**Статус:** Done
**Приоритет:** P1  
**Компонент:** configurator | simulation | data | i18n  

## Описание

`WaterUseType` уже существует (`'drinking' | 'cooking' | 'irrigation' | 'livestock'`) и передаётся в движок, но не влияет на логику рекомендаций. Нужно расширить тип, добавить новые значения и сделать `use` активным параметром симуляции.

Один и тот же загрязнитель требует разного лечения в зависимости от назначения воды: нитраты критичны для питьевой воды и некритичны для полива. Цель — учитывать это в приоритизации и уверенности.

**Новые значения `WaterUseType`:**

| Значение | Отображение |
|---|---|
| `drinking` | Drinking Water |
| `cooking` | Cooking |
| `whole_house` | Whole House |
| `shower_bathing` | Shower / Bathing |
| `emergency_survival` | Emergency / Survival |
| `irrigation` | Irrigation / Garden |
| `livestock` | Livestock |

**Как назначение влияет на рекомендации:**

- `drinking` / `cooking` / `emergency_survival` — максимальные требования к биологической безопасности; загрязнители категории `biological` получают наивысший приоритет.
- `whole_house` / `shower_bathing` — вирусная инактивация менее критична; акцент на turbidity, hardness, chlorine.
- `irrigation` / `livestock` — биологическая безопасность снижена; химические загрязнители (нитраты, пестициды) остаются важными.

**Как назначение влияет на уверенность:**

- `drinking` + неполные данные → `dataConfidence` снижается (ставки выше).
- `irrigation` + неполные данные → штраф меньше.

## Что нужно сделать

1. Расширить `WaterUseType` в `src/types/index.ts`: добавить `whole_house`, `shower_bathing`, `emergency_survival`.
2. Создать `src/data/purpose-priorities.json` — маппинг `WaterUseType → { biologicalWeight, chemicalWeight, physicalWeight }`.
3. В `runSimulation` учитывать `input.use` при вычислении score кандидата: умножать overlap на вес категории.
4. Добавить `use` в штраф `dataConfidence` когда назначение = `drinking`/`cooking`/`emergency_survival` и данных мало.
5. Обновить wizard: шаг «Для чего вода?» с вариантами.
6. Добавить i18n-ключи для всех новых значений `WaterUseType`.

## Критерии приёмки

- [ ] `WaterUseType` содержит все 7 значений
- [ ] Движок применяет веса категорий при scoring — для `drinking` биологические загрязнители имеют приоритет
- [ ] Для `irrigation` биологические загрязнители не блокируют выбор не-биологических модулей
- [ ] Шаг выбора назначения присутствует в wizard
- [ ] `dataConfidence` снижается на 1 балл при `drinking`/`emergency_survival` + score < high

## Ограничения

- Не удалять существующие `WaterUseType` — только добавлять
- Веса не ломают существующие сценарии: neutral use не меняет текущего поведения (все веса = 1.0)
- Не менять структуру `TierResult` — только логику scoring

## Связи

- Зависит от: REQ-22, REQ-23
- Блокирует: REQ-31
