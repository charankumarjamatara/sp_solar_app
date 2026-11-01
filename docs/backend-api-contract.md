# SP Solar Solutions - Backend API Contract (Proposed)

> **Document Status**: Proposed Specification for Backend & Database Team  
> **Target Consumer**: SP Solar Solutions Customer Mobile Application  
> **Notice**: All routes, status codes, request bodies, and envelope schemas documented herein represent proposed frontend contracts awaiting final backend team ratification.

---

## 1. Global Architectural Standards

### 1.1 Base URLs
- **Local Dev**: `http://localhost:3000/api/v1` (or emulator IP `http://10.0.2.2:3000/api/v1` / LAN IP)
- **Staging / Production**: `https://api.spsolar.example.com/api/v1`

### 1.2 Authentication Header
All protected endpoints require a Bearer token in the `Authorization` HTTP header:
```http
Authorization: Bearer <jwt_or_session_token>
```

### 1.3 Standard Response Envelopes
To support both enveloped and direct formats, the client expects the following standard format:

#### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional human-readable description",
  "timestamp": "2026-10-11T12:00:00Z"
}
```

#### Error Response (HTTP 4xx / 5xx)
```json
{
  "success": false,
  "code": "VALIDATION_ERROR",
  "message": "Mobile number must be 10 digits",
  "details": {
    "phoneNumber": ["Mobile number is invalid"]
  }
}
```

---

## 2. Authentication Contract

### 2.1 Request OTP
Initiates an SMS OTP to the customer's registered phone number.
- **Method & Route**: `POST /auth/otp/request`
- **Auth**: None
- **Request Body**:
  ```json
  {
    "phoneNumber": "9876543210"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "message": "OTP sent successfully",
      "retryAfterSeconds": 30
    }
  }
  ```

### 2.2 Verify OTP & Login
Exchanges phone number and OTP for session credentials.
- **Method & Route**: `POST /auth/otp/verify`
- **Auth**: None
- **Request Body**:
  ```json
  {
    "phoneNumber": "9876543210",
    "otp": "123456"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "accessToken": "eyJhbGciOi...",
      "refreshToken": "eyJhbGciOi...",
      "expiresIn": 86400,
      "customer": {
        "id": "cus_991823",
        "name": "Sunita Sharma",
        "phoneNumber": "+91 98765 43210",
        "email": "sunita.sharma@example.com",
        "createdAt": "2026-01-15T10:00:00Z"
      }
    }
  }
  ```

### 2.3 Logout
Invalidates the current session token on the server.
- **Method & Route**: `POST /auth/logout`
- **Auth**: Bearer Token
- **Success Response (200 OK)**:
  ```json
  { "success": true, "message": "Logged out successfully" }
  ```

---

## 3. Customer Profile Contract

### 3.1 Get Profile
- **Method & Route**: `GET /customers/me`
- **Auth**: Bearer Token
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "cus_991823",
      "name": "Sunita Sharma",
      "phoneNumber": "+91 98765 43210",
      "email": "sunita.sharma@example.com",
      "address": {
        "street": "Flat 402, Green Meadows",
        "city": "Bengaluru",
        "state": "Karnataka",
        "postalCode": "560102",
        "country": "India"
      },
      "createdAt": "2026-01-15T10:00:00Z"
    }
  }
  ```

### 3.2 Update Profile
Allows editing name, email, and service address. **Phone number updates are rejected**.
- **Method & Route**: `PATCH /customers/me`
- **Auth**: Bearer Token
- **Request Body**:
  ```json
  {
    "name": "Sunita Sharma",
    "email": "sunita.sharma@newdomain.com",
    "address": {
      "street": "Villa 14, Sun City",
      "city": "Bengaluru",
      "state": "Karnataka",
      "postalCode": "560100"
    }
  }
  ```
- **Success Response (200 OK)**: Returns updated Customer object.

---

## 4. Tickets Contract

### 4.1 Ticket Status Lifecycle
```
RAISED -> ASSIGNED -> IN_PROGRESS -> RESOLVED -> CLOSED
```

### 4.2 List Tickets
- **Method & Route**: `GET /tickets`
- **Auth**: Bearer Token
- **Query Parameters**:
  - `status` (optional): `RAISED | ASSIGNED | IN_PROGRESS | RESOLVED | CLOSED`
  - `page` (optional, default 1)
  - `pageSize` (optional, default 20)
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "items": [
        {
          "id": "tkt_1025",
          "ticketNumber": "SP-1025",
          "category": "INVERTER_FAULT",
          "categoryLabel": "Inverter Fault",
          "description": "Inverter indicates red light",
          "status": "RAISED",
          "createdAt": "2026-10-11T10:00:00Z",
          "updatedAt": "2026-10-11T10:30:00Z"
        }
      ],
      "total": 1,
      "page": 1,
      "pageSize": 20,
      "hasMore": false
    }
  }
  ```

### 4.3 Create Ticket
- **Method & Route**: `POST /tickets`
- **Auth**: Bearer Token
- **Request Body**:
  ```json
  {
    "category": "INVERTER_FAULT",
    "description": "Inverter displaying high temp error code 204",
    "imageUris": ["https://storage.spsolar.example.com/uploads/issue_1.jpg"]
  }
  ```
- **Success Response (201 Created)**: Returns created Ticket object with assigned `id` and formatted `ticketNumber`.

### 4.4 Get Ticket Details
- **Method & Route**: `GET /tickets/:id`
- **Auth**: Bearer Token
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "tkt_1007",
      "ticketNumber": "SP-1007",
      "status": "RESOLVED",
      "category": "OTHER",
      "categoryLabel": "Monitoring issue",
      "description": "Cloud telemetry data logger offline",
      "createdAt": "2026-10-08T09:00:00Z",
      "updatedAt": "2026-10-10T14:00:00Z",
      "assignedAt": "2026-10-08T15:00:00Z",
      "inProgressAt": "2026-10-09T10:00:00Z",
      "resolvedAt": "2026-10-10T14:00:00Z",
      "technician": {
        "id": "tech_2",
        "name": "Ramesh Patel",
        "phoneNumber": "+91 98123 45678",
        "specialization": "IoT & Telemetry Diagnostics"
      },
      "resolution": {
        "resolvedAt": "2026-10-10T14:00:00Z",
        "technicianNotes": "Reconfigured smart logger antenna and firmware.",
        "rootCause": "Local router IP de-sync"
      },
      "images": [
        {
          "id": "img_1",
          "url": "https://storage.spsolar.example.com/repair/before.jpg",
          "stage": "BEFORE_REPAIR",
          "caption": "Logger offline"
        },
        {
          "id": "img_2",
          "url": "https://storage.spsolar.example.com/repair/after.jpg",
          "stage": "AFTER_REPAIR",
          "caption": "Logger connected"
        }
      ]
    }
  }
  ```

---

## 5. Feedback Contract

### 5.1 Submit Feedback
- **Method & Route**: `POST /tickets/:id/feedback`
- **Auth**: Bearer Token
- **Business Rules**:
  - Ticket status must be `RESOLVED` or `CLOSED` (422 Unprocessable if not).
  - One feedback entry per ticket (409 Conflict if already rated).
- **Request Body**:
  ```json
  {
    "ticketId": "tkt_1007",
    "rating": 5,
    "categories": ["Repair quality", "Technician professionalism"],
    "comment": "Prompt service and clean resolution."
  }
  ```
- **Success Response (201 Created)**: Returns TicketFeedback object.

---

## 6. Notifications Contract

### 6.1 List Notifications
- **Method & Route**: `GET /notifications`
- **Auth**: Bearer Token
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "items": [
        {
          "id": "notif_1",
          "type": "TICKET_CREATED",
          "title": "Service Request Registered",
          "body": "Your service request #SP-1025 has been logged.",
          "isRead": false,
          "ticketId": "tkt_1025",
          "ticketNumber": "SP-1025",
          "category": "TICKET",
          "createdAt": "2026-10-11T10:05:00Z"
        }
      ],
      "total": 1,
      "page": 1,
      "pageSize": 20
    }
  }
  ```

### 6.2 Mark As Read
- Single item: `PATCH /notifications/:id/read`
- All items: `POST /notifications/mark-all-read`

---

## 7. Media Upload Contract (Proposed)

### 7.1 Multipart Upload
- **Method & Route**: `POST /media/upload`
- **Content-Type**: `multipart/form-data`
- **Payload**:
  - `file`: binary JPEG/PNG (Max size: 10MB)
  - `context`: `CUSTOMER_ISSUE` | `BEFORE_REPAIR` | `AFTER_REPAIR`
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "mediaId": "med_12345",
      "url": "https://storage.spsolar.example.com/uploads/issue_1.jpg",
      "thumbnailUrl": "https://storage.spsolar.example.com/uploads/issue_1_thumb.jpg"
    }
  }
  ```

---

## 8. Questions for Backend Team Ratification
1. Will authentication sessions use short-lived JWTs (e.g. 15-min) with refresh token rotation, or longer-lived tokens?
2. Does the backend prefer direct multipart image upload (`/media/upload`), or pre-signed S3/GCS upload URLs?
3. Should pagination use page-based (`page`, `pageSize`) or cursor-based (`cursor`, `limit`) pagination?
