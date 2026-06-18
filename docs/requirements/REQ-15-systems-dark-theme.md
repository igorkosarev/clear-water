# REQ-15: Привести раздел Systems к стилистике конфигуратора

**Статус:** Approved  
**Приоритет:** P2  
**Компонент:** ui  

## Описание

Страницы `/systems` (список) и `/systems/:id` (детальная) сейчас используют светлую тему (`text-gray-900`, `Card`, `Badge` light). Нужно привести их к тёмной теме конфигуратора: `bg-slate-800/60`, `border-slate-700`, `text-white` / `text-slate-400`, акценты `sky-500`.

Контент обеих страниц не меняется — только стилистика.

## Страница списка (`/systems`)

Текущее:
- `Card` светлый, `Badge variant="info"` с бюджетом
- `text-gray-900` / `text-gray-500`

Нужно:
- Каждая система — тёмная карточка `bg-slate-800/60 border border-slate-700 rounded-xl p-5`
- Hover: `hover:border-slate-500 transition-colors`
- Название: `text-white font-semibold`
- Описание: `text-slate-400 text-sm line-clamp-2`
- Бюджет-бейдж: `text-xs font-medium px-2.5 py-1 rounded-full border` с цветом по тиру:
  - `low` → `text-emerald-400 border-emerald-500/40 bg-emerald-500/10`
  - `medium` → `text-sky-400 border-sky-500/40 bg-sky-500/10`
  - `high` → `text-amber-400 border-amber-500/40 bg-amber-500/10`
- Заголовок страницы: `text-3xl font-bold text-white`
- Подзаголовок: `text-slate-400`

## Страница детали (`/systems/:id`)

Текущее:
- `text-gray-900`, `text-gray-600`, `text-blue-600` ссылка назад

Нужно:
- Ссылка «← Back»: `text-slate-400 hover:text-slate-200`
- Название: `text-white font-bold`
- Бюджет-бейдж: те же цвета, что в списке
- Описание: `text-slate-400`
- `SimulationCanvas` и остальной контент не трогать

## Критерии приёмки

- [ ] Страница списка `/systems` отображается в тёмной теме без светлых элементов
- [ ] Карточки системы hover-эффект соответствует стилю конфигуратора
- [ ] Бюджет-бейдж окрашен по тиру (low/medium/high)
- [ ] Страница детали `/systems/:id` без светлых элементов
- [ ] Ссылка «← Back» в тёмной теме
- [ ] Используются только Tailwind-классы, без изменения компонентов `Card` / `Badge` (или замена inline-стилями)

## Ограничения

- Не менять структуру данных и роутинг
- Не добавлять новый контент (новые поля, блоки) — только рестайлинг
- Не трогать `SimulationCanvas`

## Связи

- Не зависит от других REQ
