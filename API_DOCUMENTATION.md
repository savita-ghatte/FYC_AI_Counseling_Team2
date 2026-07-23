# API Documentation

## Base URL
`http://localhost:5000/api`

---

## Authentication (`/auth`)

### POST `/auth/register`
Register a new student account.
- **Body**: `{ email, password, fullName }`
- **Response** (201): `{ status, message }`

### POST `/auth/login`
Authenticate a user.
- **Body**: `{ email, password }`
- **Response** (200): `{ status, data: { accessToken, user } }`

### POST `/auth/verify-otp`
Verify email OTP.
- **Body**: `{ email, otp }`
- **Response** (200): `{ status, message }`

### POST `/auth/logout`
Clear user session.
- **Response** (200): `{ status, message }`

---

## Profile (`/profile`) *Protected*

### GET `/profile/me`
Fetch current user profile.
- **Response** (200): `{ status, data: { ...profile } }`

### PUT `/profile/me`
Update user profile.
- **Body**: `{ fullName, category, ... }`
- **Response** (200): `{ status, data: { ...profile } }`

---

## College Discovery (`/colleges`) *Protected*

### GET `/colleges`
Search and filter colleges.
- **Query Params**: `page, limit, state, type, branch, maxFee`
- **Response** (200): `{ status, data: { colleges, total, pages } }`

---

## AI Counsellor (`/ai-counsellor`) *Protected*

### POST `/ai-counsellor/predict`
Predict admission chances.
- **Body**: `{ examName, rank, category, gender, homeState }`
- **Response** (200): `{ status, data: { prediction: "Markdown string" } }`

### POST `/ai-counsellor/chat`
Chat with the AI Assistant.
- **Body**: `{ message, context? }`
- **Response** (200): `{ status, data: { reply: "Markdown string" } }`

---

## Documents (`/documents`) *Protected*

### POST `/documents/upload`
Upload a document. Uses `multipart/form-data`.
- **Form Data**: `file` (File), `templateId` (String)
- **Response** (201): `{ status, data: { document } }`

---

## Notifications (`/notifications`) *Protected*

### GET `/notifications`
Fetch all notifications for the user.
- **Response** (200): `{ status, data: { notifications } }`
