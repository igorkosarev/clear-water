# REQ-33: Configurator Acceptance Tests — сценарные тесты корректности рекомендаций

**Статус:** Approved  
**Приоритет:** P1  
**Компонент:** simulation | configurator | ui | i18n  

## Описание

Формальный набор из 20 приёмочных сценариев для проверки того, что конфигуратор выдаёт реалистичные, безопасные и объяснимые рекомендации. Тесты проверяют результат, а не детали реализации.

### Общие правила (применяются к каждому тесту)

Каждая рекомендация обязана включать:
- Бюджетный тир
- Список рекомендуемых модулей/стадий
- Покрытые контаминанты/риски
- Непокрытые риски (если есть)
- Data confidence
- Recommendation confidence
- Объяснение

Система не должна выдавать high-confidence рекомендацию при недостаточных данных.

---

## Сценарии

### T1 — Городская вода, запах/вкус хлора
- Source: `tap`, Use: `drinking`, Symptom: `odor`, Testing: `none`, Scope: `countertop`/`under_sink`
- Ожидаемо: активированный уголь в рекомендации; RO опционален; UV не требуется; confidence.data ≤ medium

### T2 — Городская вода, старая сантехника / риск свинца
- Source: `tap`, Use: `drinking`, Symptom: `chemical` (lead), Testing: `none`, Scope: `under_sink`
- Ожидаемо: lead как suspected, не confirmed; рекомендация тестирования; объяснение не утверждает наличие свинца; confidence.data = low/medium

### T3 — Река/озеро/пруд, мутная вода, питьевая
- Source: `river`/`pond`, Use: `drinking`, Symptom: `turbid`, Testing: `none`, Scope: `portable`/`emergency`
- Ожидаемо: turbidity, bacteria, viruses, protozoa в inferred рисках; фильтрация ДО дезинфекции; UV или carbon в одиночку недостаточны; confidence.data = low; пояснение о многостадийности

### T4 — Река/озеро/пруд, вода выглядит чистой
- Source: `river`, Use: `drinking`, Symptom: none, Testing: `none`, Scope: `portable`
- Ожидаемо: биологические риски всё равно инферированы; дезинфекция в рекомендации; объяснение «внешний вид ≠ безопасность»; confidence.data = low

### T5 — Частная скважина, нет анализа
- Source: `well`, Use: `drinking`, Testing: `none`, Scope: `whole_house`/`under_sink`
- Ожидаемо: no high confidence; рекомендация лаб. анализа; nitrates/arsenic/iron/bacteria как suspected; confidence.data = low; объяснение различает suspected vs confirmed

### T6 — Скважина, лаб. подтверждены мышьяк и нитраты
- Source: `well`, Mode: Advanced, Testing: `laboratory`, Entries: arsenic(confirmed)+nitrates(confirmed), Scope: `under_sink`
- Ожидаемо: RO в рекомендации; carbon alone недостаточен; UV alone недостаточен; confidence.data = high

### T7 — Скважина, железо и жёсткость, весь дом
- Source: `well`, Mode: Advanced, Testing: `laboratory`, Entries: iron(confirmed)+hardness(confirmed), Use: `whole_house`, Scope: `whole_house`
- Ожидаемо: whole_house лечение; смягчитель воды рассматривается; RO-only for drinking не является первичной рекомендацией; confidence.data = high

### T8 — Запах тухлых яиц (H2S)
- Source: `well`, Use: `whole_house`, Symptom: `odor` (→ hydrogen_sulfide), Testing: `none`, Scope: `whole_house`
- Ожидаемо: H2S как suspected; whole_house лечение; рекомендация диагностики/тестирования; confidence.data = low/medium; recommendation.confidence = medium

### T9 — Дождевая вода, питьевая
- Source: `rain`, Use: `drinking`, Testing: `none`, Scope: `under_sink`/`whole_house`
- Ожидаемо: инферированы bacteria, sediment; упомянуто загрязнение кровли/хранилища; фильтрация + дезинфекция; confidence.data = low

### T10 — Аварийное выживание
- Source: `river` или unknown, Use: `emergency_survival`, Testing: `none`, Scope: `emergency`
- Ожидаемо: portable multi-barrier; biological safety приоритет; carbon-only недостаточен; confidence.data = low; recommendation.confidence ≤ medium

### T11 — Полив/огород
- Source: `well`/`tap`, Use: `irrigation`, Testing: `none`
- Ожидаемо: drinking-grade лечение не навязывается; biological risky с меньшим весом; salinity может быть релевантна; рекомендация проще или с объяснением

### T12 — Душ/купание, накипь
- Source: `tap`/`well`, Use: `shower_bathing`, Symptom: `hardness`, Testing: `none`, Scope: `whole_house`
- Ожидаемо: hardness инферирован/выбран; whole_house смягчение рассматривается; RO не является первичной рекомендацией для душа; confidence.data = medium

### T13 — Advanced Mode, подтверждены PFAS
- Source: any, Mode: Advanced, Testing: `laboratory`, Entries: pfas(confirmed), Scope: `under_sink`
- Ожидаемо: certified carbon и/или RO; generic carbon без сертификации не гарантируется; confidence.data = high; объяснение с сертификационными оговорками

### T14 — Advanced Mode, фармацевтика и гормоны
- Source: `tap`, Mode: Advanced, Testing: `laboratory`, Entries: pharmaceuticals(confirmed)+hormones(confirmed), Scope: `under_sink`
- Ожидаемо: хлорирование НЕ рекомендуется; ion exchange не является типовым домашним решением; RO и/или certified carbon; confidence.data = high; объяснение содержит ограничения

### T15 — Бюджетное правило безопасности
- Любой high-risk drinking сценарий; Budget: low
- Ожидаемо: если низкий бюджет не покрывает риски — система говорит об этом; unresolved risks явно перечислены; уверенность снижена; не навязывается небезопасная дешёвая рекомендация

### T16 — Порядок стадий
- Сценарий с turbidity + bacteria (river + drinking)
- Ожидаемо: sediment/turbidity стадия ДО UV/дезинфекции; UV не стоит перед механической фильтрацией; объяснение о необходимости предобработки

### T17 — Явное указание непокрытых рисков
- Сценарий, где scope/budget не позволяет покрыть все риски (portable + arsenic+nitrates+bacteria)
- Ожидаемо: unresolved risks явно перечислены; нет утверждения «вода полностью безопасна»; recommendation.confidence снижен; объяснение предлагает следующий шаг

### T18 — Приоритет confirmed vs suspected
- Input A: iron из симптомов (suspected), no test
- Input B: iron из lab (confirmed), same source/use
- Ожидаемо: Input B → confidence.data выше; Input B → более конкретная рекомендация; Input A → язык с подтверждением; система различает suspected и confirmed

### T19 — Неизвестный источник воды
- Source: `unknown`, Use: `drinking`, Testing: `unknown`, Scope: `under_sink`/`portable`
- Ожидаемо: confidence.data = low; no high-confidence recommendation; тестирование настоятельно рекомендовано; аварийное руководство помечено как краткосрочное

### T20 — Правило запрета overclaiming
- Любой сценарий
- Ожидаемо: система не использует выражения «удаляет всё», «гарантирует безопасную воду», «делает любую воду безопасной»; используются: «снижает», «устраняет», «зависит от сертификации», «требует тестирования», «требует обслуживания»

---

## Критерии приёмки

- [ ] T1: активированный уголь в рекомендации при хлорном запахе из крана
- [ ] T2: lead как suspected, рекомендация тестирования, нет утверждения о наличии
- [ ] T3: biological+turbidity инферированы; multi-stage; UV/carbon alone не в рекомендации solo
- [ ] T4: biological риски при отсутствии симптомов у surface water
- [ ] T5: well + no test → low data confidence + рекомендация лаб. анализа
- [ ] T6: well + lab + arsenic+nitrates → RO рекомендован
- [ ] T7: iron+hardness+whole_house → whole_house решение (не только RO under_sink)
- [ ] T8: odor+well → H2S suspected, whole_house scope, рекомендация диагностики
- [ ] T9: rain → bacteria+sediment инферированы, упомянута кровля
- [ ] T10: emergency → portable multi-barrier, biological priority
- [ ] T11: irrigation → упрощённые рекомендации без drinking-grade давления
- [ ] T12: shower+hardness → whole_house softening рассматривается
- [ ] T13: pfas confirmed → RO или certified carbon, сертификационная оговорка
- [ ] T14: pharmaceuticals+hormones → нет хлорирования в рекомендации
- [ ] T15: low budget + high risk → unresolved risks показаны, нет принудительной unsafe рекомендации
- [ ] T16: sediment перед UV в выходной системе
- [ ] T17: unresolved risks явно перечислены в результате
- [ ] T18: confirmed > suspected в data confidence и специфичности рекомендации
- [ ] T19: unknown source → low confidence, настоятельная рекомендация тестирования
- [ ] T20: нет overclaiming языка в i18n-ключах

## Ограничения

- Без бэкенда и хранения данных — всё на клиенте
- Acceptance тесты должны покрывать end-to-end через Playwright или через прямой вызов `runSimulation()`
- Сертификационный язык (T13, T14) — только информационный, без юридических гарантий

## Связи

- Зависит от: REQ-25, REQ-26, REQ-27, REQ-28, REQ-29, REQ-30, REQ-31, REQ-32
- Блокирует: REQ-34 (модули), REQ-35 (unknown source), REQ-36 (language constraints)
