# Requirement: Hero sections — Contaminants & Methods pages

## What

Переделать Hero-блоки на страницах `/learn/contaminants` и `/learn/methods` по образцу Hero на Home: `bg-slate-950`, пульсирующий радиальный цветной glow, плавающие анимированные частицы, центрированный текст, min-height.

## Why

Текущие Hero — плоский `bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900` без частиц и свечения. Они выбиваются из визуального языка сайта, где ключевые секции используют fullbleed с animated-glow и частицами.

## Acceptance criteria

- [ ] Hero на обеих страницах использует `bg-slate-950` вместо gradient-to-br
- [ ] Радиальный glow — центрированный, пульсирует в loop (как на Home)
- [ ] Плавающие частицы покрывают весь Hero-блок (deterministic позиции, no `Math.random()`)
- [ ] Accent-цвет у Contaminants и Methods — разный, чтобы страницы визуально различались
- [ ] Текст (h1 + subtitle) — центрирован, поверх фона (`relative z-10`)
- [ ] Мобильный вид: затемнение для читаемости текста
- [ ] Минимальная высота: `min-h-[380px]` на мобильном, `md:min-h-[440px]` на десктопе
- [ ] Текстовый блок ограничен `max-w-5xl mx-auto`, как на Home
- [ ] Анимация входа текста — как на Home: `initial={{ opacity: 0, y: 32 }}`, stagger между h1 и subtitle
- [ ] `npm run build` без ошибок TypeScript

## Out of scope

- Изменение текстового содержимого (ключи переводов остаются прежними)
- Добавление CTA-кнопок в Hero
- Изменение секций ниже Hero (ContaminantSection / MethodSection)
- Другие страницы

## Affected files / components

| Файл | Изменение |
|---|---|
| `src/pages/Learn/Contaminants.tsx` | Заменить Hero `<div>` на fullbleed `<section>` с glow + частицами |
| `src/pages/Learn/Methods.tsx` | То же самое |

## Open questions

- **Accent color для Contaminants:** на странице Contaminants нет одного цвета — каждый загрязнитель свой. Разработчик выбирает подходящий нейтральный акцент (например, `#ef4444` red — «угроза», или `#38bdf8` cyan — «вода»).
- **Accent color для Methods:** аналогично — разработчик выбирает (например, `#10b981` emerald — «очистка»).
- **Частицы:** использовать те же `HeroParticle[]` что на Home (синие + белые), или специфичные для страницы — на усмотрение разработчика.
