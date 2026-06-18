# REQ-11: Physical Compatibility and Ordering Constraints for Filter Chain

**Статус:** Approved  
**Приоритет:** P1  
**Компонент:** data, simulation, configurator  

## Описание

Жадный движок сейчас выбирает фильтры только по `removes[]`, не учитывая физическую совместимость по размеру частиц и обязательный порядок установки. RO-мембрана без предварительной механической очистки разрушится в течение нескольких недель. Нужно добавить два поля в модель данных и научить движок проверять и соблюдать физические ограничения.

---

## Изменения модели данных

### 1. `micronRating` в `FilterTypeConfig`

```ts
interface FilterTypeConfig {
  // ...existing fields...
  micronRating: number | null  // null = не механический (UV, chlorination, pump)
}
```

Значения:

| FilterType        | micronRating |
|-------------------|-------------|
| `sediment`        | 5           |
| `sediment_filtration` | 5       |
| `activated_carbon` | 1          |
| `biosand`         | 1           |
| `ceramic`         | 0.2         |
| `slow_sand`       | 0.1         |
| `ro`              | 0.0001      |
| `hollow_fiber`    | 0.01        |
| `ion_exchange`    | null        |
| `water_softening` | null        |
| `uv`              | null        |
| `chlorination`    | null        |
| `boiling`         | null        |
| `distillation`    | null        |
| `booster_pump`    | null        |

### 2. `sizeRange` в `Contaminant`

```ts
interface Contaminant {
  // ...existing fields...
  sizeRange?: { min: number; max: number }  // µm
}
```

Значения (ориентировочные, в µm):

| Contaminant  | min     | max    |
|-------------|---------|--------|
| bacteria     | 0.5     | 10     |
| viruses      | 0.02    | 0.3    |
| protozoa     | 1       | 100    |
| turbidity    | 0.001   | 100    |
| sediment     | 1       | 1000   |
| microplastics| 1       | 5000   |
| lead         | 0.001   | 0.01   |
| arsenic      | 0.001   | 0.001  |
| nitrates     | 0.001   | 0.001  |
| (растворённые химикаты) | 0.001 | 0.001 |

### 3. `prerequisites` в `FilterTypeConfig`

```ts
interface FilterTypeConfig {
  // ...existing fields...
  prerequisites: {
    required: FilterType[]    // без этих фильтров данный нельзя ставить
    recommended: FilterType[] // рекомендуется иметь перед ним
  }
}
```

Примеры:

```ts
ro: {
  prerequisites: {
    required: ['sediment'],
    recommended: ['sediment', 'activated_carbon'],
  }
}

hollow_fiber: {
  prerequisites: {
    required: ['sediment'],
    recommended: ['sediment'],
  }
}

uv: {
  prerequisites: {
    required: [],
    recommended: ['sediment', 'activated_carbon'],
  }
}

// Все остальные фильтры: required: [], recommended: []
```

---

## Логика движка (`src/engine/simulation.ts`)

### Порядок построения цепочки

После жадной выборки и до сортировки:

1. **Проверить `required`**: для каждого выбранного модуля взять `FilterTypeConfig[module.type].prerequisites.required`. Если хотя бы один из required-типов отсутствует в текущей цепочке — добавить самый дешёвый модуль этого типа из `modules.json`.
   - Добавление не проверяет бюджет (аналогично насосу — техническая необходимость).
   - Рекурсивно: добавленный модуль тоже проверяется на свои `required`.

2. **Сортировка по `micronRating`**:
   - Фильтры с `micronRating !== null` сортируются по убыванию (крупное → мелкое).
   - Фильтры с `micronRating === null` ставятся после механических, в порядке FLOW_ORDER (UV, chlorination и т.д.).
   - Боoster pump всегда первым.

3. **Собрать флаги `missingRecommended`**: список FilterType из `recommended`, которых нет в итоговой цепочке.

### Изменения `TierResult`

```ts
interface TierResult {
  // ...existing fields...
  missingRecommended: FilterType[]  // для предупреждений в UI
}
```

---

## UI (`ResultPanel`, `BOMTable` или отдельный компонент)

- Если `missingRecommended.length > 0` — показать мягкое предупреждение (иконка Info, amber/slate цвет): «Рекомендуется добавить [X] перед [Y] для защиты мембраны / улучшения результата.»
- Не блокировать результат, не скрывать рекомендацию.
- Предупреждение показывается только в primary tier, не в AltCard (там слишком мало места).

---

## Критерии приёмки

- [ ] `FilterTypeConfig` содержит `micronRating` и `prerequisites` для всех FilterType
- [ ] `Contaminant` содержит опциональное поле `sizeRange` в JSON-данных и TypeScript-типе
- [ ] Движок автоматически добавляет `required`-фильтры независимо от бюджета
- [ ] Рекурсивная проверка: добавленный `required`-фильтр тоже проверяется
- [ ] Цепочка сортируется по убыванию `micronRating`, pump всегда первый
- [ ] `TierResult` содержит `missingRecommended: FilterType[]`
- [ ] UI показывает мягкое предупреждение если `missingRecommended` непустой
- [ ] Система из RO без sediment автоматически получает sediment перед RO
- [ ] TypeScript strict: нет `any`
- [ ] i18n: строки предупреждения через `t()`

## Ограничения

- Не добавлять `required`-фильтры в процессе жадного выбора (только пост-обработка)
- Не использовать `sizeRange` для фильтрации в движке MVP — поле только для данных и возможного будущего использования
- Tailwind only, без кастомных CSS

## Связи

- Зависит от: `src/engine/simulation.ts` (текущий жадный движок — REQ в работе)
- Зависит от: `src/components/filter/FilterTypes.ts` (FilterTypeConfig)
- Блокирует: точность рекомендаций конфигуратора
