# REQ-18: Модалка загрязнителя при клике на бейдж «Removes» в деталях метода

**Статус:** Done  
**Приоритет:** P2  
**Компонент:** encyclopedia | ui  

## Описание

На странице `/learn/methods/:id` в секции **Removes** бейджи загрязнителей сейчас являются `<Link>` и уводят пользователя на `/learn/contaminants/:id`. Нужно заменить навигацию на открытие `ContaminantDetailModal` — той же модалки, что используется в конфигураторе (REQ-10).

## Текущее состояние

В `src/pages/Learn/MethodDetail.tsx` (строки 341–363):

```tsx
<Link
  to={`/learn/contaminants/${c.id}`}
  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full ..."
>
  {CIcon && <CIcon size={12} strokeWidth={2} />}
  {t(c.nameKey)}
</Link>
```

## Что нужно сделать

1. Заменить `<Link>` на `<button>` с `onClick={() => setActiveContaminant(c.id)}`
2. Добавить state: `const [activeContaminant, setActiveContaminant] = useState<string | null>(null)`
3. Отрендерить `<ContaminantDetailModal>` внизу компонента:
   ```tsx
   <ContaminantDetailModal
     contaminantId={activeContaminant}
     onClose={() => setActiveContaminant(null)}
   />
   ```

## Критерии приёмки

- [ ] Клик по бейджу загрязнителя в секции «Removes» открывает `ContaminantDetailModal`
- [ ] Модалка закрывается кликом на оверлей / кнопку ✕
- [ ] Навигация на `/learn/contaminants/:id` при клике на бейдж — убрана
- [ ] Визуальный стиль бейджей не меняется
- [ ] `ContaminantDetailModal` не дублируется — переиспользуется существующий компонент

## Ограничения

- Не менять `ContaminantDetailModal` так, чтобы сломать конфигуратор
- Не менять структуру данных `treatment-methods.json` и `contaminants.json`

## Связи

- Зависит от: REQ-10 (ContaminantDetailModal)
- Аналог: REQ-16 (то же для страницы /systems)
