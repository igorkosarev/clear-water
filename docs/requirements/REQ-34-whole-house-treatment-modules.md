# REQ-34: Whole-House Treatment Modules — умягчитель, железо, сероводород

**Статус:** Approved  
**Приоритет:** P1  
**Компонент:** data | simulation  

## Описание

В текущей базе модулей отсутствуют целые классы whole-house решений, реально используемых в домашнем водоснабжении. Это приводит к тому, что типичные сценарии — жёсткая вода из скважины, железо, запах сероводорода — возвращают пустую рекомендацию при `scope: whole_house` или `whole_house` use-type.

Нужно добавить три модуля в `src/data/modules.json`:

### 1. Water Softener / Ion Exchange — умягчитель (жёсткость)

- **Тип:** `ion_exchange`
- **Убирает:** `hardness`, `iron` (частично), `manganese` (частично)
- **Стоимость:** ~$400 USD
- **Минимальное давление:** 0.3 bar
- **Scope:** `whole_house`
- **DIY:** medium (требует настройки регенерации)
- **Ключ имени:** `modules.water_softener.name`

### 2. Iron & Manganese Filter — обезжелезивание

- **Тип:** `iron_manganese_filter`
- **Убирает:** `iron`, `manganese`, `hydrogen_sulfide` (частично, до ~1 мг/л)
- **Стоимость:** ~$300 USD
- **Минимальное давление:** 0.3 bar
- **Scope:** `whole_house`
- **DIY:** medium
- **Ключ имени:** `modules.iron_manganese_filter.name`

### 3. H2S / Oxidation Filter — обезжелезивание + сероводород

- **Тип:** `oxidation_filter`
- **Убирает:** `hydrogen_sulfide`, `iron`, `manganese`
- **Стоимость:** ~$350 USD
- **Минимальное давление:** 0.3 bar
- **Scope:** `whole_house`
- **DIY:** medium
- **Ключ имени:** `modules.oxidation_filter.name`

## Критерии приёмки

- [ ] Water softener добавлен в modules.json с корректными `removes`, `scopeTags`, `costUSD`
- [ ] Iron/manganese filter добавлен в modules.json
- [ ] Oxidation filter добавлен в modules.json
- [ ] `treatment-constraints.json` обновлён для новых типов при необходимости
- [ ] i18n-ключи добавлены в `public/locales/en/translation.json`
- [ ] T7 acceptance test проходит (iron + hardness + whole_house → addressed)
- [ ] T8 acceptance test проходит (H2S + well → addressed)
- [ ] T12 acceptance test проходит (hardness + shower/whole_house → addressed)
- [ ] Существующие 93 проходящих теста не регрессируют

## Ограничения

- Без бэкенда — только данные в JSON-файлах
- `ion_exchange` уже есть в `treatment-constraints.json` с `moduleRequires: ['sediment']` — соблюдать
- Не добавлять типы-дубликаты: если тип уже есть в constraints, использовать существующий
- Стоимости — ориентировочные рыночные значения, не точные

## Связи

- Зависит от: REQ-30 (treatment scope)
- Блокирует: REQ-33 (T7, T8, T12 должны зеленеть после этого REQ)
