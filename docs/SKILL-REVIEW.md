# Проверка текущего сайта по запрошенным навыкам — 2026-11-10

Это работа над текущим сайтом, отдельно от трёх концепций нового дизайна. Новые концепции не реализуются до выбора пользователя.

## Использованные источники инструкций

- WorkFlow/skills/sources/vercel-labs__agent-skills/skills/web-design-guidelines/SKILL.md. Актуальные правила получены из https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md.
- WorkFlow/skills/sources/coreyhaines31__marketingskills/skills/copywriting/SKILL.md и references/ai-tells.md.
- WorkFlow/skills/sources/anthropics__skills/skills/webapp-testing/SKILL.md.
- WorkFlow/skills/sources/microsoft__playwright-cli/skills/playwright-cli/SKILL.md.
- WorkFlow/skills/sources/obra__superpowers/skills/verification-before-completion/SKILL.md.
- WorkFlow/skills/sources/coreyhaines31__marketingskills/skills/seo-audit/SKILL.md.

## Web design guidelines

Подтверждённые находки до исправления:

- styles.css, .field input/select/textarea: outline:0 перекрывал низкоспецифичное :where(...):focus-visible. Добавлен явный фокус для полей.
- script.js, setupBookingForm: отсутствовали связанные с полем текстовые ошибки/aria-invalid. Добавлены invalid/input обработчики и aria-describedby.
- styles.css, placeholders и host-hero .script-word: слишком светлый цвет для малого текста. Усилен контраст, декоративная подпись на светлом фоне использует brick.
- index.html и другие страницы: отсутствовали width/height изображений. Фактические naturalWidth/naturalHeight проверены в браузере; добавлены размеры известных файлов и резервирование динамических изображений.
- styles.css, dialog: добавлено overscroll-behavior:contain; интерактивным элементам — touch-action и scroll-margin-top.
- script.js: статус отправки использует многоточие, кнопка помечается aria-busy на время запроса.

Подтверждённые сильные стороны: semantic links/buttons, видимые подписи формы, skip link, один H1 на страницу, native dialog, reduced-motion, управление меню с Escape и удержанием фокуса.

Краткие ссылки на исправления в текущем снимке:

- styles.css:1604 — явный focus-visible полей.
- styles.css:1612 — контрастное сообщение ошибки.
- styles.css:1638 — читаемая подпись на светлом фоне.
- script.js:22 — резервирование места известных изображений.
- script.js:523 — связанные ошибки полей и aria-invalid.
- server.js:256 — canonical redirects с сохранением query.
- server.js:290 — настоящий404.
- index.html:11 — self canonical; аналогично четырём внутренним страницам.

## Copywriting

Диагноз B: в исходнике уже есть ясный акцент на хозяйке Катерине; сохраняем его и полезные сведения, убираем общие рекламные формулировки. Голос спокойный и разговорный, от редактора сайта, без выдуманного первого лица хозяйки.

Для hero рассмотрены: «В гости к Катерине», «Гостевой дом у Пидана», «Маори Лукьяновка». Сохранено название Маори Лукьяновка: лучше опознаётся и соответствует локальному поиску. Текст под ним уточняет связь с Катериной и то, что можно обсудить до приезда.

Для CTA рассмотрены: «Обсудить поездку», «Написать Катерине», «Узнать свободные даты». В текущем сайте сохранено последнее: ведёт к запросу, а не обещает календарь с подтверждённой доступностью.

Переписаны подзаголовки и описания home, host, rooms, location, booking. Применены проверки конкретности, проверяемости и замены бренда конкурентом. Не добавлялись новые цены, услуги, гарантии, отзывы и биография. Факты взяты из существующего контента. Для более личного рассказа нужны реальная речь и история Катерины, для различий комнат — фотографии и подтверждённые параметры.

## Webapp testing / playwright-cli

- Python playwright отсутствует.
- Отдельный playwright-cli не найден.
- npx --no-install playwright --version не нашёл доступную установку; обращение npm к registry завершилось ENOTFOUND. Локального Chromium Playwright не обнаружено.
- Полноценный автоматический прогон 390/820/1440 в этой среде НЕ выполнен. Подготовлен tests/browser-check.py, его результаты не выдаются за пройденные.
- Доступен подключённый браузер с Playwright-локаторами. На опубликованной базовой версии проверены метаданные и native-валидация пустой формы: фокус переходит на phone, обязательные поля остаются invalid. Настоящая заявка не отправлялась.
- Ранее viewport.set не менял фактические 1280px; это ограничение повторного мобильного осмотра остаётся открытым.

## Verification before completion

Для каждого результата отделяются автоматический тест, браузерная проверка и неподтверждённое предположение. Проверки обработчиков без сети не заменяют браузер на телефоне или реальную доставку Telegram. Финальные команды и состояние публикации записываются в VERIFICATION.md.

## SEO audit

Подробности — SEO-AUDIT.md. Внесены технические исправления и метаданные, но никаких обещаний позиций/индексации нет. Доступа к Search Console и Яндекс Вебмастеру нет.
