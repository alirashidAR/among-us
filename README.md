# Slot Booking System Documentation

## Overview
The Slot Booking System is designed to efficiently manage slot reservations using CockroachDB, Express, and Node.js. The system incorporates Google authentication via Firebase and ensures secure access control with JWT tokens.

## Technology Stack
- **Database:** CockroachDB
- **Backend:** Node.js, Express.js
- **Authentication:** Google Firebase Auth
- **Authorization:** JWT Tokens

## Database Schema
The system is designed with three primary tables:

### 1. Users Table (`users`)
Stores user details.

| Column     | Type      | Description |
|------------|----------|-------------|
| id         | UUID     | Unique user identifier |
| email      | STRING   | User email (primary key) |
| name       | STRING   | User's name (optional) |
| google_uid | STRING   | Unique Google authentication ID |
| created_at | TIMESTAMP | Timestamp of account creation |

### 2. User Slots Table (`user_slots`)
Tracks the day assigned to each user.

| Column   | Type    | Description |
|----------|--------|-------------|
| id       | UUID   | Unique identifier |
| email    | STRING | Reference to `users.email` |
| day      | STRING | Assigned day (Day 1 or Day 2) |

**Constraints:**
- Unique index on `email`
- `day` must be either 'Day 1' or 'Day 2'

### 3. Slots Table (`slots`)
Represents available slots.

| Column    | Type    | Description |
|-----------|--------|-------------|
| id        | UUID   | Unique slot identifier |
| day       | STRING | Slot day (Day 1 or Day 2) |
| timing    | VARCHAR | Slot timing |
| vacancies | INT8   | Number of available vacancies (default 20) |

**Constraints:**
- `day` must be either 'Day 1' or 'Day 2'
- `vacancies` cannot be negative

## Authentication & Authorization
1. Users authenticate via Google Firebase.
2. The system verifies the Firebase token and retrieves user details.
3. The system checks `user_slots` to confirm booking permissions.
4. A JWT token is generated with user details and assigned slot day.
5. Users can only log in if they have a booking.
6. JWT token is required for all protected routes.

## API Routes

### Authentication
- `POST /auth` - Authenticates user via Firebase and returns JWT.

**Request Headers:**
```json
{
  "Authorization": "Bearer FIREBASE_ID_TOKEN"
}
```

**Response:**
```json
{
  "success": true,
  "token": "JWT_TOKEN",
  "user": {
    "email": "user@example.com",
    "day": "Day 1"
  }
}
```

### Slots
- `GET /slots` - Retrieves available slots for the user’s booked day.

**Request Headers:**
```json
{
  "Authorization": "Bearer JWT_TOKEN"
}
```

**Response:**
```json
[
  {
    "id": "slot-uuid",
    "day": "Day 1",
    "timing": "10:00 AM - 11:00 AM",
    "vacancies": 18
  }
]
```

### Test
- `GET /` - Health check endpoint to verify server status.

**Response:**
```json
{
  "message": "Server is up and running"
}
```

## Middleware

### `authenticateFirebaseUser`
Middleware to verify Firebase ID token and check booking permission.

1. Extracts and verifies Firebase ID token.
2. Retrieves user details (email, name) from Firebase.
3. Checks `user_slots` table to confirm access.
4. Attaches user details to `req.user` and proceeds to next middleware.

### `verifyJWT`
Middleware to verify JWT token.

1. Extracts and verifies JWT token using `process.env.JWT_SECRET`.
2. Attaches decoded user data to `req.user`.
3. Proceeds to the next middleware or returns 403 if invalid.

## Security Measures
- Firebase authentication secures login.
- JWT tokens protect all API routes.
- Database queries are optimized to minimize unnecessary calls.
- Admin authentication is separate from user authentication.

## Future Enhancements
- Add an admin dashboard for managing slots.
- Implement notifications for slot bookings and cancellations.
- Allow users to reschedule bookings.

