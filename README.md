# DriveEasy Car Rental System (SET E)

**Course:** ITUE301 - Advanced Web Development Frameworks  
**Examination:** Open-Book Practical Examination (CSPIT, CHARUSAT)  
**Student ID:** 24IT105 | **Batch:** B  
**Academic Year:** 2026–27  

---

## 📌 Project Overview
DriveEasy is a full-stack self-drive car rental booking platform built with the MERN stack (React.js, Node.js, Express.js, MongoDB + Mongoose). It eliminates double-bookings on vehicles by enforcing schema-level validations, availability checks, token-based authentication guards, and a reactive React frontend with client-side filtering.

---

## 🏗️ Project Architecture & Tech Stack

* **Frontend:** React 19, Vite, React Router v7, Axios
* **Backend:** Node.js v22, Express.js v4, JWT (`jsonwebtoken`), CORS, Dotenv
* **Database:** MongoDB with Mongoose v8 (Auto-seeds vehicle fleet & customer on startup)

```
itue301-exam-24it105-B/
├── backend/
│   ├── middleware/
│   │   ├── authGuard.js       # Validates Bearer JWT; returns 401 on failure
│   │   ├── errorHandler.js    # Centralized JSON error response handler
│   │   └── requestLogger.js   # Global logger: [METHOD] [PATH] [TIMESTAMP]
│   ├── models/
│   │   ├── Booking.js         # Ref Customer & Vehicle, dates, status enum
│   │   ├── Customer.js        # Required name, unique email, unique license
│   │   └── Vehicle.js         # Model, type enum, pricePerDay (min 0), available
│   ├── routes/
│   │   └── api.js             # 5 REST endpoints under /api/v1/
│   ├── .env.example           # Environment template
│   ├── package.json
│   ├── server.js              # Server entry point (starts on port 5000)
│   └── testValidation.js      # Task 5 validation & booking test script
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Client-side router navigation bar
│   │   │   ├── ProtectedRoute.jsx  # Route protection guard redirecting to /
│   │   │   └── VehicleCard.jsx     # Reusable card with availability toggle
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # Global auth state { customer, token }
│   │   ├── pages/
│   │   │   ├── AdminPanel.jsx      # Lazy-loaded component with Suspense
│   │   │   ├── FleetPage.jsx       # Vehicle grid, client filter, booking form
│   │   │   ├── LoginPage.jsx       # Customer authentication page
│   │   │   └── MyBookingsPage.jsx  # Customer reservations view
│   │   ├── App.jsx                 # Routes & API consumption
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── .env.example
├── .gitignore
└── README.md
```

---

## 🚀 Setup & Execution Instructions

### 1. Prerequisites
* **Node.js** v18+ and **npm**
* **MongoDB** (Local instance or MongoDB Atlas connection string)

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   * Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   * Ensure `PORT=5000` and `MONGO_URI=mongodb://127.0.0.1:27017/driveeasy`.
4. Start the backend server:
   ```bash
   npm start
   # or
   node server.js
   ```
   * The server runs on `http://localhost:5000`.
   * On first run, it automatically seeds initial vehicle fleet and customer data.

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   * Open `http://localhost:3000` (or the URL printed in the terminal).

---

## 📡 REST API Specification (`/api/v1/`)

| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/v1/auth/login` | Public | Authenticates customer, returns JWT token & user info |
| **GET** | `/api/v1/vehicles` | Public | Returns all vehicles |
| **POST** | `/api/v1/bookings` | Protected | Creates new booking; verifies `available === true`, sets to `false` |
| **GET** | `/api/v1/bookings/my` | Protected | Returns customer's bookings with populated customer & vehicle |
| **PATCH**| `/api/v1/bookings/:id/status` | Protected | Updates booking status (`reserved`, `ongoing`, `completed`, `cancelled`) |

---

## 🧪 Testing Task 5 Validation & Double-Booking Prevention

Run the automated validation test script directly from the backend directory:
```bash
cd backend
node testValidation.js
```

**Output verifies:**
1. Validates customer login and issues JWT token.
2. Demonstrates booking failure with **HTTP 400** on unavailable vehicle (`"Vehicle is currently not available for booking"`).
3. Demonstrates successful booking with **HTTP 201** and verifies the vehicle's `available` field flips to `false`.
4. Retrieves populated records using `.populate('customerId', 'name email')` and `.populate('vehicleId', 'model type')`.

---

## 🎯 Task Mapping Summary

* **Task 1: React Component Architecture** — Reusable `VehicleCard` props, conditional badge vs button, `LoginPage`, `FleetPage`, `MyBookingsPage`.
* **Task 2: React Routing & State Management** — Client-side React Router, lazy-loaded `/admin` route with `Suspense`, `AuthContext`, `ProtectedRoute`, booking form state.
* **Task 3: Express REST API + Middleware** — 5 REST endpoints, custom `requestLogger` (`[METHOD] [PATH] [TIMESTAMP]`), custom `authGuard` (Bearer token 401), and global JSON error handler.
* **Task 4: REST API Consumption in React** — `useEffect` data fetching for `GET /api/v1/vehicles`, 3 states (`vehicles`, `loading`, `error`), and client-side filter (`All`, `Hatchback`, `Sedan`, `SUV`) without re-fetching.
* **Task 5: MongoDB + Mongoose Schemas & Validation** — Strict schema validations, unique constraints, double-booking prevention, population, and `.env` config.
