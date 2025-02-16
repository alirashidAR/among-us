# **Slot Booking System Documentation**  

## **Overview**  
The Slot Booking System is designed to efficiently manage slot reservations using **CockroachDB**, **Express**, and **Node.js**. The system incorporates **Google authentication via Firebase** and ensures secure access control with **JWT tokens**.

## **Technology Stack**  
- **Database:** CockroachDB  
- **Backend:** Node.js, Express.js  
- **Authentication:** Google Firebase Auth  
- **Authorization:** JWT Tokens  

---

## **Database Schema**  
The system is designed with **four primary tables**:

### **1. Users Table (`users`)**  
Stores user details.

| Column     | Type      | Description |
|------------|----------|-------------|
| id         | UUID     | Unique user identifier |
| email      | STRING   | User email (primary key) |
| name       | STRING   | User's name (optional) |
| google_uid | STRING   | Unique Google authentication ID |
| created_at | TIMESTAMP | Timestamp of account creation |

---

### **2. User Slots Table (`user_slots`)**  
Tracks the **assigned day** for each user.

| Column   | Type    | Description |
|----------|--------|-------------|
| id       | UUID   | Unique identifier |
| email    | STRING | Reference to `users.email` |
| day      | STRING | Assigned day (`Day 1` or `Day 2`) |

**Constraints:**  
- Unique index on `email`  
- `day` must be either **'Day 1'** or **'Day 2'**  

---

### **3. Slots Table (`slots`)**  
Represents the available **slots** for booking.

| Column    | Type    | Description |
|-----------|--------|-------------|
| id        | UUID   | Unique slot identifier |
| slot_id   | STRING | Shortened unique ID (first 6 chars of UUID) |
| day       | STRING | Slot day (`Day 1` or `Day 2`) |
| timing    | VARCHAR | Slot timing |
| vacancies | INT8   | Number of available vacancies (default **20**) |

**Constraints:**  
- `day` must be either **'Day 1'** or **'Day 2'**  
- `vacancies` cannot be negative  
- `slot_id` is **unique**  

---

### **4. Bookings Table (`bookings`)**  
Tracks **which user booked which slot**.

| Column   | Type    | Description |
|----------|--------|-------------|
| id       | UUID   | Unique booking identifier |
| user_id  | UUID   | Reference to `users.id` (nullable) |
| slot_id  | UUID   | Reference to `slots.id` (nullable) |
| created_at | TIMESTAMP | Timestamp of booking (nullable, defaults to now) |

**Constraints:**  
- Foreign key linking `user_id` to `users.id` (**ON DELETE CASCADE**)  
- Foreign key linking `slot_id` to `slots.id` (**ON DELETE CASCADE**)  

---

## **Authentication & Authorization**  

1. Users authenticate via **Google Firebase**.  
2. The system verifies the **Firebase token** and retrieves user details.  
3. The system checks **`user_slots`** to confirm **booking permissions**.  
4. A **JWT token** is generated with user details and assigned slot day.  
5. Users can only log in if they have a **valid booking**.  
6. **JWT token** is required for all protected routes.  

---

## **API Routes**  

### **Authentication**
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

---

### **Slots**
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
    "slot_id": "a3f9b2",
    "day": "Day 1",
    "timing": "10:00 AM - 11:00 AM",
    "vacancies": 18
  }
]
```

---

### **Bookings**
- `POST /bookings` - Books a slot for the user.

**Request Headers:**
```json
{
  "Authorization": "Bearer JWT_TOKEN"
}
```

**Request Body:**
```json
{
  "slot_id": "a3f9b2"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Slot booked successfully",
  "booking": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "slot_id": "a3f9b2d4-e29b-41d4-a716-446655440000",
    "booked_at": "2025-02-16T12:00:00Z"
  }
}
```

- **If the slot is full:** Returns `{ "success": false, "message": "No vacancies available" }`
- **If the user already booked a slot:** Returns `{ "success": false, "message": "User already booked a slot" }`

---

### **Test**
- `GET /` - Health check endpoint to verify server status.

**Response:**
```json
{
  "message": "Server is up and running"
}
```

