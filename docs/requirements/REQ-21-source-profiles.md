# REQ-21: Source Profiles — автоматический вывод рисков по источнику воды

**Статус:** Done  
**Приоритет:** P1  
**Компонент:** data | simulation  

## Описание

Сейчас тип источника (`source: WaterSourceType`) передаётся в движок, но никак не влияет на логику — он используется только для фильтрации шаблонов. Нужно добавить профили источников: каждый тип воды автоматически привносит ожидаемые загрязнители и сигналы риска.

Это первый шаг reasoning engine: прежде чем пользователь вручную выбрал загрязнители, движок уже знает базовый набор рисков из источника.

**Различие двух уровней:**

- `inferredContaminants` — загрязнители, которые присутствуют практически всегда для этого источника. Добавляются автоматически как подтверждённые, повышают `dataConfidence`.
- `riskFactors` — контаминанты с повышенной вероятностью, но не гарантированные. Отображаются как «рекомендуется проверить», снижают `dataConfidence` если пользователь их не выбрал явно.
- `advisories` — строковые ключи для UI-рекомендаций (например, «рекомендуется лабораторный анализ воды»).

## Профили источников

| Source | inferredContaminants | riskFactors | advisories |
|---|---|---|---|
| `river` | bacteria, viruses, protozoa, turbidity, sediment | cyanobacteria, cyanotoxins, pesticides, herbicides | — |
| `pond` | bacteria, viruses, protozoa, turbidity, sediment | cyanobacteria, cyanotoxins | — |
| `well` | — | nitrates, arsenic, iron, manganese, hardness, bacteria | water_testing |
| `spring` | bacteria, protozoa | turbidity, iron | — |
| `rain` | bacteria | turbidity, pesticides | — |
| `tap` | chlorine | disinfection_byproducts, lead | — |
| `municipal` | chlorine | disinfection_byproducts, lead, pfas | — |

## Что нужно сделать

1. Создать `src/data/source-profiles.json` с профилями для каждого `WaterSourceType`.
2. В `WaterInput` или движке использовать профиль для автодобавления `inferredContaminants` к набору требований.
3. Вернуть в `TierResult` (или новом типе) список `inferredContaminants`, чтобы UI мог их отличить от user-selected.
4. В `dataConfidence` (REQ-23) учитывать наличие `riskFactors`, не выбранных пользователем.

## Критерии приёмки

- [ ] `src/data/source-profiles.json` создан и охватывает все `WaterSourceType`
- [ ] Движок автоматически добавляет `inferredContaminants` из профиля к списку требований
- [ ] `riskFactors` доступны вызывающему коду для расчёта confidence
- [ ] `advisories` доступны для отображения в UI
- [ ] Выбор источника `river` без ручного выбора загрязнителей порождает систему, закрывающую bacteria/viruses/protozoa/turbidity

## Ограничения

- Не менять структуру `WaterInput` ломающим образом — инкрементально расширить
- `inferredContaminants` можно переопределить пользователем (они могут отключить часть вручную)
- Не добавлять новые типы источников — только из существующего `WaterSourceType`

## Связи

- Зависит от: —
- Блокирует: REQ-22, REQ-23, REQ-24
