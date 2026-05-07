# ПРОМПТ ДЛЯ QWEN 3 CODER PLUS — Impression

Твоя задача — реализовать MVP веб-интерфейса бюро переводов **«Impression»** на **Vue 3 + TypeScript + Vite + PrimeVue + Pinia + Vue Router**.

## ВАЖНЫЕ ОГРАНИЧЕНИЯ И ОЖИДАНИЯ

1. Пиши **production-like код**, аккуратный, модульный, типизированный.
2. Не делай «заглушечную архитектуру». Сразу строй понятную структуру проекта.
3. Используй **Composition API** и `<script setup lang="ts">`.
4. Все данные получать через реальные API-слои:
   - Qdrant через `/api/qdrant/...`
   - n8n через `/api/n8n/webhook/...`
   - OpenRouter API для бюджета
5. Реализуй:
   - авторизацию,
   - guards,
   - layout с хедером и сайдбаром,
   - страницы `/login`, `/knowledge`, `/knowledge/:collectionName`, `/translate`, `/clients`, `/budget`,
   - работу с loading/error/empty states,
   - toast-уведомления,
   - confirm-dialog для удалений и опасных действий.
6. Интерфейс должен быть на русском языке.
7. Никакого лишнего функционала сверх MVP, кроме того, что нужно для качественного UX.
8. Если серверные ответы неоднородны — делай безопасные адаптеры/normalizers на фронте.
9. Все формы должны иметь валидацию и понятные сообщения об ошибках.
10. Все списки должны иметь:
    - loading state,
    - empty state,
    - error state,
    - повторную загрузку при ошибке, где уместно.
11. Используй PrimeVue-компоненты, перечисленные в ТЗ, и дополняй только если это реально улучшает UX.
12. После реализации проверь, чтобы приложение можно было нормально использовать без «мертвых» кнопок и неработающих сценариев.

---

# 1. ОБЩАЯ ЦЕЛЬ ПРОЕКТА

Нужно реализовать веб-интерфейс для бюро переводов **Impression**, который покрывает следующие сценарии MVP:

1. Вход пользователя по логину и паролю.
2. Управление клиентами.
3. Перевод текста через n8n webhook.
4. Работа с коллекциями Qdrant:
   - список коллекций,
   - просмотр записей,
   - создание/редактирование/удаление записей.
5. Просмотр бюджета и расходов через OpenRouter API.
6. Просмотр истории переводов.

---

# 2. СТЕК И БАЗОВЫЕ ПРИНЦИПЫ

## Используемый стек
- Vue 3
- TypeScript
- Vite
- PrimeVue
- Pinia
- Vue Router (`createWebHistory`)

## Основные архитектурные принципы
- Разделить проект на: router, layouts, pages/views, components, stores, services/api, types, utils, composables, constants.
- Вынести сетевые вызовы в отдельные сервисы.
- Вынести типы в отдельные файлы.
- Pinia использовать для: auth, clients, knowledge, translations, budget.
- Локальный UI-state уровня конкретного диалога допустимо хранить внутри страницы/компонента, но данные и операции CRUD — в store.

---

# 3. СТРУКТУРА ФАЙЛОВ И ПАПОК

Используй примерно такую структуру. Если текущий проект уже частично существует — аккуратно встрои это в существующую структуру.

## Корень `src/`
- `src/main.ts`
- `src/App.vue`

## App / config
- `src/router/index.ts`
- `src/router/guards.ts`
- `src/constants/routes.ts`
- `src/constants/app.ts`

## Layouts
- `src/layouts/AuthLayout.vue`
- `src/layouts/AppLayout.vue`

## Pages / Views
- `src/views/LoginView.vue`
- `src/views/knowledge/KnowledgeListView.vue`
- `src/views/knowledge/KnowledgeCollectionView.vue`
- `src/views/TranslateView.vue`
- `src/views/ClientsView.vue`
- `src/views/BudgetView.vue`

## Shared UI components
- `src/components/layout/AppHeader.vue`
- `src/components/layout/AppSidebar.vue`
- `src/components/common/PageContainer.vue`
- `src/components/common/PageTitle.vue`
- `src/components/common/EmptyState.vue`
- `src/components/common/ErrorState.vue`
- `src/components/common/LoadingBlock.vue`
- `src/components/common/AppDataTableToolbar.vue`

## Auth components
- `src/components/auth/LoginForm.vue`

## Knowledge components
- `src/components/knowledge/CollectionTypeTag.vue`
- `src/components/knowledge/KnowledgeCollectionsTable.vue`
- `src/components/knowledge/CollectionPointsTable.vue`
- `src/components/knowledge/KnowledgePointDialog.vue`
- `src/components/knowledge/PayloadFieldList.vue`

## Translate components
- `src/components/translate/TranslateForm.vue`
- `src/components/translate/TranslationResultCard.vue`
- `src/components/translate/TranslationsHistoryTable.vue`
- `src/components/translate/ActiveCollectionHint.vue`

## Clients components
- `src/components/clients/ClientsTable.vue`
- `src/components/clients/ClientDialog.vue`
- `src/components/clients/ClientStatusTag.vue`

## Budget components
- `src/components/budget/BudgetSummaryCards.vue`
- `src/components/budget/BudgetExpensesTable.vue`

## Stores
- `src/stores/auth.ts`
- `src/stores/clients.ts`
- `src/stores/knowledge.ts`
- `src/stores/translations.ts`
- `src/stores/budget.ts`

## API services
- `src/services/api/http.ts`
- `src/services/api/auth.service.ts`
- `src/services/api/clients.service.ts`
- `src/services/api/qdrant.service.ts`
- `src/services/api/translate.service.ts`
- `src/services/api/budget.service.ts`

## Types
- `src/types/auth.ts`
- `src/types/client.ts`
- `src/types/qdrant.ts`
- `src/types/translation.ts`
- `src/types/budget.ts`
- `src/types/api.ts`
- `src/types/common.ts`

## Utils / helpers
- `src/utils/storage.ts`
- `src/utils/error.ts`
- `src/utils/formatters.ts`
- `src/utils/validators.ts`
- `src/utils/qdrant.ts`

Если в проекте уже есть aliases, используй единообразно, например `@/`.

---

# 4. ТИПЫ TYPESCRIPT

## 4.1. Общие типы (`src/types/common.ts`)
- `Nullable<T>`, типы для dropdown/selectbutton, `RequestStatus: 'idle' | 'loading' | 'success' | 'error'`

## 4.2. Типы API (`src/types/api.ts`)
- Базовая структура API-ошибки, `ApiResult<T>`, `ApiListResult<T>`

## 4.3. Auth (`src/types/auth.ts`)
- `User: { id, username, role, created_at? }`
- `LoginRequest: { username, password }`
- `LoginResponse: { token, user }`
- `AuthState: { token, user, loginLoading, meLoading, isInitialized }`

## 4.4. Clients (`src/types/client.ts`)
- `ClientStatus = 'active' | 'archived'`
- `Client: { id, name, inn, legal_address, email, phone, contact_info, notes, status, collection_id, created_at, updated_at }`
- `CreateClientRequest`, `UpdateClientRequest`, `ClientFormModel`, `ClientsFilter: { search, status }`

## 4.5. Qdrant (`src/types/qdrant.ts`)
- `CollectionType = 'glossary' | 'kb' | 'client' | 'unknown'`
- `QdrantCollection: { name, pointsCount, type }`
- `KnowledgePointPayload: { source_term?, target_term?, context?, note?, tags?, source_lang?, target_lang? + доп.поля }`
- `KnowledgePoint: { id, payload }`
- `UpsertKnowledgePointRequest`, `DeleteKnowledgePointRequest`, `KnowledgePointFormModel`
- Важно: id точки может быть строкой или числом

## 4.6. Translation (`src/types/translation.ts`)
- `LanguageCode = 'ru' | 'en'`
- `TranslationDirection: 'ru-en' | 'en-ru'`
- `TranslateRequest: { client_id, client_name, source_text, source_lang, target_lang }`
- `TranslateResponse: { translated_text, status, model, cost, tokens, processing_time }`
- `TranslationHistoryItem: { id?, date, client_id, client_name, source_lang, target_lang, source_text, translated_text, status, model, cost, tokens, processing_time }`

## 4.7. Budget (`src/types/budget.ts`)
- `BudgetBalance`, `BudgetExpenseItem`, `BudgetSummary: { totalSpent, monthSpent, transactionsCount }`, `BudgetState`

---

# 5. КОНСТАНТЫ И ВСПОМОГАТЕЛЬНАЯ ЛОГИКА

## `src/constants/routes.ts`
Route names и paths: login, knowledge, knowledgeCollection, translate, clients, budget

## `src/constants/app.ts`
- Название: Impression
- Ключ localStorage для JWT
- Список направлений: RU→EN, EN→RU
- Статусы клиентов

## `src/utils/storage.ts`
Геттер/сеттер/удаление для JWT токена

## `src/utils/error.ts`
Единый helper для извлечения текста ошибки из fetch/axios/Error/API

## `src/utils/formatters.ts`
- Дата/время
- Стоимость/валюта
- Количество токенов
- Направление перевода
- Сокращение длинного текста

## `src/utils/validators.ts`
- Обязательное поле
- Email
- Проверка непустоты текста перевода
- Проверка логина/пароля

## `src/utils/qdrant.ts`
- Определение CollectionType по имени (impression_glossary → glossary, impression_kb → kb, client_{id} → client, иначе unknown)
- Нормализация списка коллекций и точек scroll-ответа

---

# 6. HTTP-СЛОЙ И API СЕРВИСЫ

## 6.1. `src/services/api/http.ts`
- GET/POST/PUT helpers
- Автоматический Bearer token
- Единая обработка ошибок
- При 401 — logout

## 6.2. `auth.service.ts`
- POST /api/n8n/webhook/auth/login → { username, password } → { token, user }

## 6.3. `clients.service.ts`
- GET /api/n8n/webhook/clients → список Client[]
- POST /api/n8n/webhook/clients → создать
- PUT /api/n8n/webhook/clients/{id} → обновить

## 6.4. `qdrant.service.ts`
- GET /api/qdrant/collections → список
- GET /api/qdrant/collections/{name}/points/scroll → точки
- PUT /api/qdrant/collections/{name}/points → upsert
- POST /api/qdrant/collections/{name}/points/delete → удалить
- Все ответы нормализовать к KnowledgePoint[]

## 6.5. `translate.service.ts`
- POST /api/n8n/webhook/translate → { client_id, client_name, source_text, source_lang, target_lang } → TranslateResponse
- GET /api/n8n/webhook/translations → история

## 6.6. `budget.service.ts`
- GET https://openrouter.ai/api/v1/auth/key → баланс
- GET https://openrouter.ai/api/v1/activity → история

---

# 7. PINIA STORES

## 7.1. `auth.ts`
**State:** token, user, isLoading, isInitialized
**Getters:** isAuthenticated, username, userRole
**Actions:** login(credentials), logout(), initializeFromStorage()

## 7.2. `clients.ts`
**State:** items[], activeItems[], isLoading, error, filter
**Getters:** filteredItems (по поиску и статусу), activeClients (только active)
**Actions:** fetchAll(), create(client), update(id, data), archive(id), activate(id)

## 7.3. `knowledge.ts`
**State:** collections[], selectedCollection, points[], isLoading, error
**Getters:** formattedCollections (с типом)
**Actions:** fetchCollections(), fetchPoints(collectionName), createPoint(collectionName, payload), updatePoint(collectionName, id, payload), deletePoint(collectionName, id)

## 7.4. `translations.ts`
**State:** currentResult, history[], isLoading, error
**Getters:** filteredHistory (по client_id)
**Actions:** translate(request), fetchHistory(clientId?)

## 7.5. `budget.ts`
**State:** balance, expenses[], isLoading, error
**Getters:** summary (totalSpent, monthSpent, transactionsCount)
**Actions:** fetchBalance(), fetchExpenses()

---

# 8. МАРШРУТИЗАЦИЯ И GUARDS

## `src/router/index.ts`
Определи маршруты с children layout:
- login → AuthLayout (без sidebar)
- knowledge → AppLayout
- knowledge/:collectionName → AppLayout
- translate → AppLayout
- clients → AppLayout
- budget → AppLayout
- по дефолту → редирект на /knowledge

## `src/router/guards.ts`
- Если нет токена → пускать только на /login, остальные → /login
- Если токен есть → все маршруты доступны
- Корректная обработка неопределённых страниц (404)

---

# 9. LAYOUTS

## `AuthLayout.vue`
- Минимальный layout без sidebar (чистая страница логина)
- Центрирование по вертикали и горизонтали

## `AppLayout.vue`
- Три зоны: header (AppHeader), sidebar (AppSidebar), router-view
- PrimeVue: Toolbar + TabMenu/PanelMenu + стилизация

## `AppHeader.vue`
- Слева: название Impression
- Справа: username + кнопка «Выйти» (Button severity=secondary или text)
- PrimeVue: Toolbar, Button, Avatar (опционально)

## `AppSidebar.vue`
- Пункты: База знаний, Сделать перевод, Клиенты, Бюджет, Выйти
- Активный пункт выделен
- PrimeIcons для иконок
- PrimeVue: PanelMenu или кастомный nav на router-link с Button

---

# 10. СТРАНИЦЫ И КОМПОНЕНТЫ — ДЕТАЛЬНО

## 10.1. LoginView.vue + LoginForm.vue
- PrimeVue: Card, InputText, Password (или InputText type=password), Button, Message
- Валидация: оба поля обязательны
- Loading state на кнопке
- Toast при ошибке
- После успеха → редирект на /knowledge

## 10.2. KnowledgeListView.vue + KnowledgeCollectionsTable.vue + CollectionTypeTag.vue
- PrimeVue: DataTable, Column, InputText (поиск), IconField, ProgressSpinner, Tag
- CollectionTypeTag: цветной Tag в зависимости от типа (glossary=blue, kb=green, client=orange, unknown=grey)
- Поиск фильтрует по названию на клиенте
- Клик по строке → router.push(/knowledge/${name})

## 10.3. KnowledgeCollectionView.vue + CollectionPointsTable.vue + KnowledgePointDialog.vue + PayloadFieldList.vue
- PrimeVue: DataTable, Column, Dialog, InputText, Textarea, Button, Toolbar, Chip/InputChip (для tags), ConfirmDialog, Toast, Tag, Accordion
- Кнопка «Назад» → /knowledge
- Поиск фильтрует точки по source_term / target_term / context
- Создание: Dialog с полями (source_term, target_term, context, note, tags, source_lang, target_lang)
- Редактирование: тот же Dialog с предзаполненными данными
- Удаление: ConfirmDialog
- PayloadFieldList: спискок дополнительных полей payload с add/remove

## 10.4. TranslateView.vue + TranslateForm.vue + TranslationResultCard.vue + TranslationsHistoryTable.vue + ActiveCollectionHint.vue
- PrimeVue: Dropdown, SelectButton, Textarea, Button, Card, DataTable, Column, Tag, Message, Divider, ProgressSpinner
- Dropdown клиентов — список активных из clients store
- SelectButton для направления
- Кнопка «Перевести» disabled, пока не выбран клиент и не введён текст
- Результат: Card с переводом, метаданными, статусом
- ActiveCollectionHint: показывает активную коллекцию выбранного клиента
- История: DataTable с фильтром

## 10.5. ClientsView.vue + ClientsTable.vue + ClientDialog.vue + ClientStatusTag.vue
- PrimeVue: DataTable, Column, Dialog, InputText, Textarea, Dropdown, Toolbar, Button, Tag, Toast
- Поиск по названию, фильтр по статусу (все/активные/архив)
- Создание: Dialog со всеми полями
- Редактирование: тот же Dialog
- Валидация: название обязательно, email — формат
- ClientStatusTag: цветной Tag (зелёный=активен, серый=архив)
- Кнопка архивировать/разархивировать в строке

## 10.6. BudgetView.vue + BudgetSummaryCards.vue + BudgetExpensesTable.vue
- PrimeVue: Card, DataTable, Column, Tag, ProgressSpinner
- SummaryCards: три Card (всего потрачено, за месяц, кол-во транзакций)
- DataTable: дата, модель, токены, стоимость, описание
- Loading на загрузку данных

---

# 11. ГЛОБАЛЬНЫЕ НАСТРОЙКИ PRIMEVUE

В main.ts:
- Импорт всех используемых PrimeVue компонентов
- Настройка стилей (если нужна кастомная тема — используй Aura или Material)
- Настройка ToastService (используй PrimeVue Toast + ConfirmationService где нужно)

---

# 12. ОБРАБОТКА ОШИБОК, TOASTS И CONFIRM

- Toast: используй useToast() во всех view/компонентах
- ConfirmDialog: используй useConfirm() для удаления
- В store: error выставляется при ошибке; view отображает через Toast
- Глобально: можно добавить глобальную обработку 401/ошибок сети

---

# 13. КРИТЕРИИ ГОТОВНОСТИ

1. `npm run dev` запускается без ошибок
2. Страница логина работает (ввод → JWT → редирект)
3. Без токена — редирект на /login
4. При выходе — очистка и редирект
5. Список коллекций Qdrant отображается, поиск работает
6. CRUD записей в коллекции: создать, просмотреть, редактировать, удалить
7. Выбор клиента, текста, отправка на перевод, отображение результата
8. История переводов отображается
9. Таблица клиентов показывает данные, создание/редактирование работает
10. Бюджет отображает данные из OpenRouter
11. Все loading/error/empty states присутствуют
12. Toast-уведомления на все действия
13. PrimeVue выглядит аккуратно, современно
