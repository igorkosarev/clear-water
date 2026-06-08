# Requirement: Заменить emoji-иконки на Lucide-иконки в секциях Contaminants и Methods

## What

Заменить большие декоративные emoji-иконки в секциях страниц `/learn/contaminants` и `/learn/methods` на Lucide React иконки — по образцу Home-страницы (size=220, тонкий strokeWidth, цвет секции, opacity ~0.38). Из Modal-карточек предпросмотра иконку убрать полностью.

## Why

Emoji выглядят несерьёзно и плохо вписываются в тёмный минималистичный дизайн сайта. На Home-странице Lucide-иконки создают нужный визуальный эффект — крупный, полупрозрачный, стильный декоративный элемент. Contaminants и Methods должны выглядеть согласованно.

## Acceptance criteria

- [ ] Каждой секции Contaminants сопоставлена Lucide-иконка через `Record<string, LucideIcon>` по `contaminant.id`
- [ ] Каждой секции Methods сопоставлена Lucide-иконка через `Record<string, LucideIcon>` по `method.id`
- [ ] Параметры иконки в секции совпадают с Home: `size={220}`, `strokeWidth={0.7}`, цвет = `color` секции, `opacity ≈ 0.38` (через `whileInView` вход как на Home)
- [ ] Иконка рендерится только на md+ (`hidden md:block`) — как сейчас
- [ ] Если для какого-либо id нет маппинга — секция рендерится без иконки (fallback = null), без ошибки
- [ ] В Modal-карточке методов (на странице Contaminants) иконка-emoji удалена; header перестраивается без иконки
- [ ] В Modal-карточке загрязнителей (на странице Methods) иконка-emoji удалена; header перестраивается без иконки
- [ ] Поле `icon` в JSON-файлах (`contaminants.json`, `treatment-methods.json`) не трогать — оно может использоваться в будущем
- [ ] `npm run build` без ошибок TypeScript

## Маппинг иконок (предложение разработчику)

### Contaminants

| id | Предлагаемая иконка | Обоснование |
|---|---|---|
| `bacteria` | `Bug` | Микроорганизм |
| `viruses` | `Zap` | Вирусная активность |
| `protozoa` | `Shell` | Простейшие |
| `turbidity` | `Droplets` | Мутность / взвесь |
| `heavy_metals` | `FlaskConical` | Химический анализ |
| `chlorine` | `Beaker` / `TestTube` | Химический элемент |
| `nitrates` | `Leaf` | Сельскохозяйственный источник |
| `fluoride` | `Gem` | Минерал |

### Methods

| id | Предлагаемая иконка | Обоснование |
|---|---|---|
| `boiling` | `Flame` | Кипячение |
| `biosand` | `Layers` | Слои песка |
| `ceramic_filtration` | `Circle` / `Disc` | Керамический диск |
| `activated_carbon` | `Hexagon` | Структура угля |
| `uv_disinfection` | `Sun` | Ультрафиолет |
| `reverse_osmosis` | `Waves` | Мембрана / поток |
| `chlorination` | `Pipette` | Химическое дозирование |

Финальный выбор иконок — на усмотрение разработчика исходя из доступных в Lucide React.

## Out of scope

- Изменение поля `icon` в JSON-данных
- Изменение emoji в других местах (если они есть)
- Изменение маленьких иконок в InfoRow (Zap, AlertTriangle, MapPin и т.д.) — они остаются
- Изменение страниц кроме Contaminants и Methods

## Affected files / components

| Файл | Изменение |
|---|---|
| `src/pages/Learn/Contaminants.tsx` | Добавить `CONTAMINANT_ICONS` record, заменить emoji-рендер в `ContaminantSection`, убрать иконку из Modal |
| `src/pages/Learn/Methods.tsx` | Добавить `METHOD_ICONS` record, заменить emoji-рендер в `MethodSection`, убрать иконку из Modal |

## Open questions

- Нет. Маппинг на усмотрение разработчика, fallback задан.
