# REQ-26: Water Testing Status — статус лабораторного анализа

**Статус:** Done  
**Приоритет:** P1  
**Компонент:** configurator | simulation | i18n  

## Описание

Добавить новое поле `testingStatus` в `WaterInput`. Оно отражает, насколько пользователь знает о составе воды из официальных источников, и является сильнейшим сигналом для `dataConfidence`.

Лабораторно подтверждённые данные = высокая уверенность в рекомендации. Отсутствие анализа = рекомендация основана на предположениях.

**Значения:**

| Значение | Описание |
|---|---|
| `none` | Анализ не проводился |
| `home_kit` | Домашний тест-набор |
| `laboratory` | Лабораторный анализ |
| `unknown` | Неизвестно |

**Влияние на `dataConfidence`:**

| Статус | Δ score |
|---|---|
| `laboratory` | +2 |
| `home_kit` | +1 |
| `unknown` | 0 |
| `none` | −1 |

## Что нужно сделать

1. Добавить `type TestingStatus = 'none' | 'home_kit' | 'laboratory' | 'unknown'` в `src/types/index.ts`.
2. Добавить `testingStatus: TestingStatus` в `WaterInput` (с дефолтом `'unknown'` для обратной совместимости).
3. В `computeConfidence` применять Δ score по таблице выше.
4. Добавить шаг «Проводился ли анализ воды?» в wizard — после выбора источника.
5. Добавить i18n-ключи для `testingStatus` значений и описаний.
6. При `testingStatus = 'laboratory'` `dataReasons` включает: "Laboratory analysis provided — high data reliability".
7. При `testingStatus = 'none'` `dataReasons` включает: "No water testing performed — recommendations based on source profile only".

## Критерии приёмки

- [ ] `WaterInput.testingStatus` существует и имеет дефолт `'unknown'`
- [ ] Все существующие точки вызова `runSimulation` не ломаются (testingStatus опциональный или имеет дефолт)
- [ ] `computeConfidence` учитывает `testingStatus` через Δ score
- [ ] Шаг wizard для testing status присутствует между source и contaminants
- [ ] `laboratory` + confirmed contaminants → `dataConfidence` = high
- [ ] `none` + источник с risk factors → `dataConfidence` = low

## Ограничения

- Не требовать `testingStatus` ретроактивно — значение `'unknown'` сохраняет текущее поведение
- Не запрашивать конкретные числовые значения из лаборатории — только статус
- Поле не влияет на выбор модулей, только на уверенность

## Связи

- Зависит от: REQ-23
- Блокирует: REQ-27, REQ-31
