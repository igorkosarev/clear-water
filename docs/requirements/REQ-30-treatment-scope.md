# REQ-30: Treatment Scope — масштаб и тип установки системы

**Статус:** Done  
**Приоритет:** P2  
**Компонент:** configurator | simulation | data | i18n  

## Описание

Сейчас рекомендации не учитывают, где пользователь хочет установить систему. RO под раковиной и переносной фильтр стоят в одном бюджетном тире, но принципиально отличаются по применимости. Treatment Scope — новый независимый от бюджета фильтр.

**Значения `TreatmentScope`:**

| Значение | Описание |
|---|---|
| `portable` | Переносное решение (кувшин, бутылка, походный фильтр) |
| `countertop` | На столешницу, без монтажа |
| `under_sink` | Под раковиной, стационарная |
| `whole_house` | Общедомовая (вход в дом) |
| `emergency` | Аварийное / временное решение |

**Как scope фильтрует рекомендации:**

- Каждый `Module` получает опциональное поле `scopeTags: TreatmentScope[]`.
- В движке: перед scoring кандидат исключается, если `input.scope` не входит в `module.scopeTags` (если scopeTags задан).
- Модули без `scopeTags` считаются применимыми для всех scope.

**Примеры маппинга модулей:**

| Модуль | scopeTags |
|---|---|
| sediment (candle) | `['portable', 'countertop', 'emergency']` |
| sediment (housing) | `['under_sink', 'whole_house']` |
| hollow_fiber | `['portable', 'countertop', 'under_sink', 'emergency']` |
| ro | `['under_sink']` |
| uv lamp | `['under_sink', 'whole_house']` |
| boiling | `['portable', 'emergency', 'countertop']` |
| distillation | `['countertop', 'under_sink']` |

## Что нужно сделать

1. Добавить `type TreatmentScope = 'portable' | 'countertop' | 'under_sink' | 'whole_house' | 'emergency'` в `src/types/index.ts`.
2. Добавить `scope?: TreatmentScope` в `WaterInput` (опциональное; если не указан — scope не фильтрует).
3. Добавить `scopeTags?: TreatmentScope[]` в тип `Module`.
4. Обновить `src/data/modules.json`: проставить `scopeTags` для всех модулей.
5. В greedy scoring: если `input.scope` задан, фильтровать кандидатов по `scopeTags`.
6. Добавить шаг «Тип установки» в wizard (Simple и Advanced Mode) — после бюджета.
7. Если `scope` выбран и ни один модуль не подходит → `remainingContaminants` не изменится → `recommendationConfidence` = low, в reasons: "No modules available for selected installation type".
8. Добавить i18n-ключи для `TreatmentScope` значений.

## Критерии приёмки

- [ ] `TreatmentScope` тип существует в `src/types/index.ts`
- [ ] `WaterInput.scope` опциональное, не ломает существующие вызовы
- [ ] `modules.json` содержит `scopeTags` для всех модулей
- [ ] При `scope = 'portable'` RO исключается из кандидатов
- [ ] При `scope = 'under_sink'` boiling исключается из кандидатов
- [ ] Шаг выбора scope присутствует в wizard
- [ ] Если scope не указан — поведение идентично текущему

## Ограничения

- `scope` независим от `budget` — не заменяет и не снижает бюджетные тиры
- Модули без `scopeTags` применимы ко всем scope (не создавать blocklist по умолчанию)
- Не добавлять новые модули — только аннотировать существующие

## Связи

- Зависит от: REQ-22
- Блокирует: REQ-31
