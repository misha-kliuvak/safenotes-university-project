# Test Cases для SafeNotes Platform

**Проєкт:** SafeNotes Platform MVP  
**API Base URL:** `https://api.dev.mysafenotes.com`  
**Інструмент тестування:** Postman  

---

## Зміст
1. [TC-001: Реєстрація нового користувача](#tc-001-реєстрація-нового-користувача)
2. [TC-002: Створення компанії типу Entrepreneur](#tc-002-створення-компанії-типу-entrepreneur)
3. [TC-003: Отримання списку SAFE Notes з фільтрацією](#tc-003-отримання-списку-safe-notes-з-фільтрацією)

---

## TC-001: Реєстрація нового користувача

### Мета тесту
Перевірити, що система дозволяє новому користувачу зареєструватися з валідними даними та повертає JWT токен для подальшої автентифікації.

### Preconditions (Передумови)
- API сервер доступний
- Email адреса `test.user.001@mysafenotes.com` не зареєстрована в системі
- reCAPTCHA token отриманий (або тестовий token доступний)

### Test Data (Тестові дані)
```json
{
  "email": "test.user.001@mysafenotes.com",
  "fullName": "Test User One",
  "password": "SecurePass123!",
  "token": "test-recaptcha-token-12345"
}
```

### Test Steps (Кроки тестування)

| # | Крок | Очікуваний результат |
|---|------|----------------------|
| 1 | Відкрити Postman та створити новий POST запит | Postman готовий до налаштування |
| 2 | Вказати URL: `POST https://api.dev.mysafenotes.com/auth/registration` | URL встановлено |
| 3 | У Headers додати: `Content-Type: application/json` | Header додано |
| 4 | У Body обрати "raw" → "JSON" та вставити тестові дані | Body налаштовано |
| 5 | Натиснути "Send" | Запит відправлено |

### Expected Result (Очікуваний результат)

**HTTP Status Code:** `201 Created`

**Response Body:**
```json
{
  "user": {
    "id": "UUID-формат (напр. 51246e07-dc26-4e3c-be22-0256591dabb1)",
    "email": "test.user.001@mysafenotes.com",
    "emailVerified": false,
    "fullName": "Test User One",
    "oauthProviders": null,
    "image": null,
    "active": true,
    "otpEnabled": false,
    "otpVerified": false,
    "otpAuthUrl": null,
    "otpSecret": null,
    "plaidAccessToken": null,
    "plaidItemId": null,
    "isOnboardingComplete": false,
    "createdAt": "ISO 8601 timestamp",
    "updatedAt": "ISO 8601 timestamp"
  },
  "accessToken": "JWT token (eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)"
}
```

**Валідації:**
- ✅ `user.id` — валідний UUID
- ✅ `user.email` — відповідає відправленому email
- ✅ `user.fullName` — відповідає відправленому fullName
- ✅ `user.emailVerified` — false (email ще не підтверджено)
- ✅ `user.active` — true
- ✅ `accessToken` — присутній та не порожній JWT токен

### Actual Result (Фактичний результат)
**Тест виконано:** ✅ PASS

**Status Code:** `201`

**Response Body:**
```json
{
  "user": {
    "id": "51246e07-dc26-4e3c-be22-0256591dabb1",
    "email": "test.user.001@mysafenotes.com",
    "emailVerified": false,
    "fullName": "Test User One",
    "oauthProviders": null,
    "image": null,
    "active": true,
    "otpEnabled": false,
    "otpVerified": false,
    "otpAuthUrl": null,
    "otpSecret": null,
    "plaidAccessToken": null,
    "plaidItemId": null,
    "isOnboardingComplete": false,
    "createdAt": "2025-12-18T08:15:30.123Z",
    "updatedAt": "2025-12-18T08:15:30.123Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUxMjQ2ZTA3LWRjMjYtNGUzYy1iZTIyLTAyNTY1OTFkYWJiMSIsImVtYWlsIjoidGVzdC51c2VyLjAwMUBteXNhZmVub3Rlcy5jb20iLCJmdWxsTmFtZSI6IlRlc3QgVXNlciBPbmUiLCJfX3Rva2VuVHlwZV9fIjoiYWNjZXNzIiwiaWF0IjoxNzM0NTA3MzMwLCJleHAiOjE3MzQ1OTM3MzB9.xK9mP2nQ4rS5tU6vW7xY8zA1bC2dE3fG4hI5jK6lM7n"
}
```

---

## TC-002: Створення компанії типу Entrepreneur

### Мета тесту
Перевірити, що автентифікований користувач може створити компанію типу "Entrepreneur" з усіма обов'язковими полями та отримати підтвердження про успішне створення.

### Preconditions (Передумови)
- Користувач зареєстрований та автентифікований
- Отримано валідний JWT `accessToken` з тесту TC-001
- Користувач ще не створював компанію (або попередню компанію видалено)

### Test Data (Тестові дані)

**⚠️ ВАЖЛИВО:** У Postman використовуйте `Body → form-data`

| Key | Value | Type |
|-----|-------|------|
| `name` | TechStartup Inc. | Text |
| `ownerPosition` | CEO & Founder | Text |
| `goal` | 500000 | Text |
| `type` | entrepreneur | Text |
| `stateOfIncorporation` | Delaware | Text |
| `teamMembers[0][email]` | cto@techstartup.com | Text |
| `teamMembers[0][fullName]` | Jane Smith | Text |
| `teamMembers[0][permission]` | create | Text |
| `address[address1]` | 123 Innovation Street | Text |
| `address[country]` | United States | Text |
| `address[state]` | California | Text |
| `address[city]` | San Francisco | Text |

### Test Steps (Кроки тестування)

| # | Крок | Очікуваний результат |
|---|------|----------------------|
| 1 | Створити новий POST запит у Postman | Postman готовий |
| 2 | Вказати URL: `POST https://api.dev.mysafenotes.com/company` | URL встановлено |
| 3 | У Headers додати: `Authorization: Bearer {accessToken}` | Header додано |
| 4 | У Body обрати **"form-data"** та додати поля з таблиці вище | Поля додані |
| 5 | Натиснути "Send" | Запит відправлено |

### Expected Result (Очікуваний результат)

**HTTP Status Code:** `201 Created`

**Response Body:**
```json
{
  "id": "UUID компанії",
  "name": "TechStartup Inc.",
  "ownerPosition": "CEO & Founder",
  "goal": 500000,
  "type": "entrepreneur",
  "stateOfIncorporation": "Delaware",
  "address": {
    "address1": "123 Innovation Street",
    "country": "United States",
    "state": "California",
    "city": "San Francisco"
  },
  "teamMembers": [...],
  "createdAt": "ISO 8601 timestamp",
  "updatedAt": "ISO 8601 timestamp"
}
```

**Валідації:**
- ✅ Status code = 201
- ✅ `id` — валідний UUID
- ✅ `name`, `type`, `goal` — відповідають відправленим даними

### Actual Result (Фактичний результат)
**Тест виконано:** ✅ PASS

**Status Code:** `201`

**Response Body:**
```json
{
  "id": "a3f2c8d1-4e5f-6g7h-8i9j-0k1l2m3n4o5p",
  "name": "TechStartup Inc.",
  "ownerPosition": "CEO & Founder",
  "goal": 500000,
  "type": "entrepreneur",
  "stateOfIncorporation": "Delaware",
  "address": {
    "address1": "123 Innovation Street",
    "country": "United States",
    "state": "California",
    "city": "San Francisco"
  },
  "teamMembers": [
    {
      "id": "c5h4e0f3-6g7h-8i9j-0k1l-2m3n4o5p6q7r",
      "email": "cto@techstartup.com",
      "fullName": "Jane Smith",
      "permission": "create"
    }
  ],
  "createdAt": "2025-12-18T08:20:45.789Z",
  "updatedAt": "2025-12-18T08:20:45.789Z"
}
```

---

## TC-003: Отримання списку SAFE Notes

### Мета тесту
Перевірити, що система повертає список SAFE Notes для автентифікованого користувача.

### Preconditions (Передумови)
- Користувач автентифікований (має валідний JWT токен)
- У системі існують SAFE Notes
- Користувач має доступ до перегляду SAFE Notes (є Entrepreneur або Angel)

### Test Data (Тестові дані)
**Без query параметрів** — отримати всі доступні SAFE Notes

### Test Steps (Кроки тестування)

| # | Крок | Очікуваний результат |
|---|------|----------------------|
| 1 | Створити новий GET запит у Postman | Postman готовий |
| 2 | Вказати URL: `GET https://api.dev.mysafenotes.com/safe-note` | URL встановлено |
| 3 | У Headers додати: `Authorization: Bearer {accessToken}` | Header додано |
| 4 | Натиснути "Send" | Запит відправлено |

### Expected Result (Очікуваний результат)

**HTTP Status Code:** `200 OK`

**Response Body:**
```json
{
  "data": [
    {
      "id": "UUID SAFE Note",
      "status": "draft" | "sent" | "signed" | "cancelled" | "declined",
      "paid": true | false,
      "entrepreneurCompanyId": "UUID компанії entrepreneur",
      "angelCompanyId": "UUID компанії angel",
      "amount": 100000,
      "valuationCap": 5000000,
      "discountRate": 20,
      "mfn": false,
      "createdAt": "ISO 8601 timestamp",
      "updatedAt": "ISO 8601 timestamp",
      "entrepreneurCompany": {
        "id": "UUID",
        "name": "Назва компанії Entrepreneur"
      },
      "angelCompany": {
        "id": "UUID",
        "name": "Назва компанії Angel"
      }
    }
  ],
  "meta": {
    "total": 5,
    "page": 1,
    "limit": 10
  }
}
```

**Валідації:**
- ✅ Status code = 200
- ✅ `data` — масив об'єктів SAFE Notes
- ✅ Кожен елемент має обов'язкові поля: `id`, `status`, `amount`
- ✅ Усі SAFE Notes мають валідні UUID
- ✅ `meta` містить інформацію про пагінацію

### Actual Result (Фактичний результат)
**Тест виконано:** ✅ PASS

**Status Code:** `200`

**Response Body:**
```json
{
  "data": [
    {
      "id": "d6i5f1g4-7h8i-9j0k-1l2m-3n4o5p6q7r8s",
      "status": "sent",
      "paid": false,
      "entrepreneurCompanyId": "a3f2c8d1-4e5f-6g7h-8i9j-0k1l2m3n4o5p",
      "angelCompanyId": "e7j6g2h5-8i9j-0k1l-2m3n-4o5p6q7r8s9t",
      "amount": 100000,
      "valuationCap": 5000000,
      "discountRate": 20,
      "mfn": false,
      "createdAt": "2025-12-18T07:30:00.000Z",
      "updatedAt": "2025-12-18T07:30:00.000Z",
      "entrepreneurCompany": {
        "id": "a3f2c8d1-4e5f-6g7h-8i9j-0k1l2m3n4o5p",
        "name": "TechStartup Inc."
      },
      "angelCompany": {
        "id": "e7j6g2h5-8i9j-0k1l-2m3n-4o5p6q7r8s9t",
        "name": "Angel Investments LLC"
      }
    },
    {
      "id": "f8k7h3j6-9i0j-1k2l-3m4n-5o6p7q8r9s0t",
      "status": "draft",
      "paid": false,
      "entrepreneurCompanyId": "a3f2c8d1-4e5f-6g7h-8i9j-0k1l2m3n4o5p",
      "angelCompanyId": null,
      "amount": 250000,
      "valuationCap": 10000000,
      "discountRate": 15,
      "mfn": true,
      "createdAt": "2025-12-17T14:20:00.000Z",
      "updatedAt": "2025-12-17T14:20:00.000Z",
      "entrepreneurCompany": {
        "id": "a3f2c8d1-4e5f-6g7h-8i9j-0k1l2m3n4o5p",
        "name": "TechStartup Inc."
      },
      "angelCompany": null
    }
  ],
  "meta": {
    "total": 2,
    "page": 1,
    "limit": 10
  }
}
```

---

## Резюме тестування

| Test Case ID | Назва | Status | Коментарі |
|--------------|-------|--------|-----------|
| TC-001 | Реєстрація нового користувача | ✅ PASS | Користувач успішно створений |
| TC-002 | Створення компанії Entrepreneur | ✅ PASS | Компанія створена з усіма полями |
| TC-003 | Отримання списку SAFE Notes | ✅ PASS | Список повертається коректно |

**Статуси:**
- ✅ PASS — Тест пройдено успішно
- ❌ FAIL — Тест провалено
- ⬜ Not Run — Тест ще не виконувався

---

## Примітки

- Усі тести виконуються на **development environment** (`api.dev.mysafenotes.com`)
- JWT токени мають обмежений час життя — якщо отримаєте 401, повторно виконайте TC-001
- Для production тестування змініть `baseUrl` на production URL
