# SP Solar Solutions - Backend Integration Guide

This guide describes how the SP Solar Solutions customer mobile frontend is configured for backend and database integration, how to switch between **Mock Mode** and **Live API Mode**, and the key architectural integration points.

---

## 1. Environment Configuration

The frontend configuration resides in `config/env.ts` and is driven by environment variables defined in `.env`:

```bash
# Base URL for Backend API
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000/api/v1

# Mode Switch: true = In-memory Mock data | false = Live Backend API calls
EXPO_PUBLIC_USE_MOCK=true

# API Request Timeout (ms)
EXPO_PUBLIC_API_TIMEOUT_MS=15000
```

### Modes of Operation
1. **Mock Mode (`EXPO_PUBLIC_USE_MOCK=true` or URL empty)**:
   - Default mode.
   - All operations (Auth, Profile, Tickets, Feedback, Notifications) use in-memory state models.
   - Ideal for UI development, testing, and offline demos.
2. **API Mode (`EXPO_PUBLIC_USE_MOCK=false` and valid URL provided)**:
   - Uses `apiClient` (`services/api/client.ts`) to execute HTTP requests against the specified `EXPO_PUBLIC_API_BASE_URL`.
   - Attaches `Authorization: Bearer <token>` automatically to all protected endpoints.

---

## 2. API Client Architecture (`services/api/client.ts`)

- **Base URL & Normalization**: Automatically strips trailing slashes and prepends forward slashes.
- **Request Headers**: Configures `Content-Type: application/json` and `Accept: application/json`.
- **Bearer Token Injection**: Automatically fetches the current access token from `secureStorage` (`APP_CONFIG.storageKeys.authToken`).
- **Response Normalization**: Handles both enveloped (`{ success: true, data: ... }`) and direct JSON object responses transparently.
- **Timeout Management**: Default 15,000ms timeout with native `AbortController` cancellation.
- **Error Categorization**: Throws strongly-typed `ApiError` with structured `kind` tags (`NETWORK_UNAVAILABLE`, `TIMEOUT`, `UNAUTHORIZED`, `FORBIDDEN`, `VALIDATION_FAILED`, `SERVER_ERROR`).

---

## 3. How to Connect Each Resource

### 3.1 Authentication (`services/auth/authService.ts`)
- `requestOtp(phoneNumber)`: Triggers OTP dispatch via `POST /auth/otp/request`.
- `login(credentials)`: Verifies OTP via `POST /auth/otp/verify` and stores token and customer profile in `secureStorage`.
- `logout()`: Posts to `POST /auth/logout` and clears auth keys from `secureStorage`.

### 3.2 Customer Profile (`services/auth/authService.ts`)
- `getCurrentCustomer()`: `GET /customers/me`.
- `updateProfile(updates)`: `PATCH /customers/me`.

### 3.3 Service Tickets (`services/tickets/ticketService.ts`)
- `getTickets(filters)`: `GET /tickets` with optional query params (`status`, `page`, `pageSize`).
- `getTicketById(ticketId)`: `GET /tickets/:id`.
- `createTicket(payload)`: `POST /tickets`.

### 3.4 Feedback & Ratings (`services/feedback/feedbackService.ts`)
- `submitFeedback(payload)`: `POST /tickets/:id/feedback`.
- `getFeedbackByTicketId(ticketId)`: `GET /tickets/:id/feedback`.

### 3.5 Notifications (`services/notifications/notificationService.ts`)
- `getNotifications()`: `GET /notifications`.
- `getUnreadCount()`: `GET /notifications/unread-count`.
- `markAsRead(id)`: `PATCH /notifications/:id/read`.
- `markAllAsRead()`: `POST /notifications/mark-all-read`.

---

## 4. Image Upload Strategy (`services/media/imageService.ts`)

1. **Client Selection**:
   - Customer selects up to 5 photos from Camera or Gallery.
   - File size is validated against `APP_CONFIG.uploadLimits.maxFileSizeMb` (10MB).
2. **Proposed Upload Endpoint**:
   - `POST /media/upload` (Multipart/form-data) returning `{ mediaId, url }`.
   - URLs are passed to `ticketService.createTicket({ imageUris: [...] })`.
3. **Alternative Pre-signed URL Strategy**:
   - The backend may choose to supply S3/GCS pre-signed PUT URLs.

---

## 5. Backend Team Handshake Checklist

Before deploying against the real backend, the backend and database teams must confirm:

1. [ ] **Host & Port**: Confirm local development URL (e.g. `http://localhost:3000` or IP address for real device testing).
2. [ ] **CORS**: Enable CORS headers (`Access-Control-Allow-Origin: *`) for the Expo web preview.
3. [ ] **Token Strategy**: Specify token lifespan and whether refresh tokens are rotated.
4. [ ] **Response Envelope**: Confirm if all responses are wrapped in `{ success: boolean, data: T }` or returned directly.
5. [ ] **Error Codes**: Ratify standard error codes (e.g., `VALIDATION_ERROR`, `TICKET_NOT_FOUND`).
6. [ ] **File Storage**: Confirm whether media uploads use direct multipart upload (`/media/upload`) or pre-signed cloud storage URLs.
