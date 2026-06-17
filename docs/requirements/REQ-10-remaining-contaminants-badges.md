# REQ-10: Remaining Contaminants Badges in Result Screen

**Статус:** Approved  
**Приоритет:** P1  
**Компонент:** configurator  

## Описание

В финальном экране конфигуратора (`ResultPanel`) показывать список загрязнителей, которые **не были убраны** выбранной системой фильтрации. Бейджики располагаются под coverage badge.

Каждый бейджик кликабельный: открывает модальное окно с полной информацией о загрязнителе — той же, что на странице `/learn/contaminants/:id` (описание, источники, риски для здоровья, методы обнаружения).

Бейджики отображаются:
- В **primary** рекомендации (основной tier)
- В каждой **AltCard** (карточки альтернативных вариантов)

Если все загрязнители убраны (`remainingContaminants.length === 0`) — секция не отображается.

## Критерии приёмки

- [ ] Бейджики remaining contaminants появляются под coverage badge в primary tier
- [ ] Бейджики также отображаются в каждой AltCard под coverage строкой
- [ ] Бейджики скрыты, если `remainingContaminants` пуст
- [ ] Клик на бейджик открывает модальное окно (не переход на `/learn/...`)
- [ ] Модальное окно содержит полную encyclopaedia-информацию: name, description, sources, health risks, detection
- [ ] Модальное окно закрывается по клику на крест, по клику на оверлей, по Escape
- [ ] Модальное окно адаптировано для мобильных (scroll внутри, не overflow body)
- [ ] Стиль бейджиков — красный/амберный (danger), отличается от нейтральных тегов
- [ ] i18n: все строки через `t()`
- [ ] TypeScript strict: нет `any`

## Реализация

### Новые компоненты

**`src/components/configurator/Result/ContaminantDetailModal.tsx`**  
Модальное окно. Принимает `contaminant: Contaminant | null` и `onClose: () => void`. Рендерит полный контент загрязнителя. Использует `contaminants.json` как источник данных.

**`src/components/configurator/Result/RemainingBadges.tsx`**  
Список бейджиков. Принимает `remainingContaminants: ContaminantId[]`. Рендерит клик-бейджики, управляет состоянием `selectedContaminant` для открытия модалки.

### Изменения существующих компонентов

**`ResultPanel.tsx`** — вставить `<RemainingBadges>` под coverage badge в основном блоке и в `AltCard`.

### Данные

Загрязнители берутся из `src/data/contaminants.json` по `id`. Если `id` не найден в JSON — бейджик рендерится с fallback-текстом (сам `id`), модалка не открывается.

## Ограничения

- Не использовать `react-router` `navigate` — только модальное окно (оверлей)
- Не дублировать логику отображения контента из `ContaminantCard.tsx` — переиспользовать или вынести в общий компонент
- Tailwind only, без кастомных CSS файлов
- Нет `any`, нет inline styles

## Связи

- Зависит от: данных `contaminants.json`, типа `Contaminant` из `src/types/index.ts`
- Связано с: `docs/requirements/cross-reference-modal.md` (аналогичный паттерн модалки)
- Связано с: `src/components/encyclopedia/ContaminantCard.tsx` (источник UI-паттерна)
