# 🏪 Shopen — Full-Stack Shop Directory

**React + TypeScript** frontend · **Go** backend · **PostgreSQL** database

---

## 📁 Project Structure

```
shopen/
├── backend/                  # Go API server
│   ├── cmd/server/main.go    # Entry point + router
│   ├── internal/
│   │   ├── db/db.go          # PostgreSQL queries
│   │   ├── handlers/         # HTTP handlers
│   │   ├── middleware/        # JWT auth middleware
│   │   └── models/           # Shared types
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   ├── go.mod
│   └── .env.example
│
└── frontend/                 # React + TypeScript
    ├── src/
    │   ├── api/client.ts     # Axios API client
    │   ├── components/
    │   │   ├── public/       # Public shop directory
    │   │   ├── admin/        # Admin dashboard + forms
    │   │   └── shared/       # Reusable UI components
    │   ├── hooks/            # Zustand auth store
    │   ├── lib/              # Constants & helpers
    │   ├── styles/           # Global CSS
    │   └── types/            # TypeScript interfaces
    ├── package.json
    └── vite.config.ts
```

---

## 🚀 Quick Start

### 1. PostgreSQL Setup

```bash
# Create the database
psql -U postgres -c "CREATE DATABASE shopen;"

# Run the migration
psql -U postgres -d shopen -f backend/migrations/001_initial_schema.sql
```

### 2. Backend

```bash
cd backend

# Copy and edit environment variables
cp .env.example .env

# Install dependencies
go mod tidy

# Run the server
go run ./cmd/server/main.go
# ✅ Server running at http://localhost:8080
```

### 3. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server (proxies /api to :8080)
npm run dev
# ✅ App running at http://localhost:5173
```

---

## 🔐 Admin Login

| Field    | Value      |
|----------|------------|
| Username | `admin`    |
| Password | `admin123` |

---

## 🌐 API Reference

### Public Endpoints (no auth required)

| Method | Path              | Description              |
|--------|-------------------|--------------------------|
| GET    | `/api/health`     | Health check             |
| GET    | `/api/shops`      | List shops (filterable)  |
| GET    | `/api/shops/:id`  | Get single shop          |

#### Query Parameters for `/api/shops`
- `category` — `Food` | `Medical` | `Café`
- `subcat`   — sub-category string
- `status`   — `open` | `closed`
- `search`   — free-text search (name, address, subcat)

### Auth

| Method | Path               | Body                            |
|--------|--------------------|---------------------------------|
| POST   | `/api/auth/login`  | `{ username, password }`        |

Returns `{ token, username }` — include token as `Authorization: Bearer <token>`.

### Admin Endpoints (JWT required)

| Method | Path                          | Description         |
|--------|-------------------------------|---------------------|
| GET    | `/api/admin/stats`            | Dashboard stats     |
| GET    | `/api/admin/shops`            | All shops           |
| POST   | `/api/admin/shops`            | Create shop         |
| PUT    | `/api/admin/shops/:id`        | Update shop         |
| DELETE | `/api/admin/shops/:id`        | Delete shop         |
| PATCH  | `/api/admin/shops/:id/toggle` | Toggle open/closed  |

---

## 🏗 Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | React 18, TypeScript, Vite, Zustand |
| Backend  | Go 1.22, Chi router                 |
| Database | PostgreSQL 15+                      |
| Auth     | JWT (HS256)                         |
| API      | RESTful JSON                        |

---

## ⚙️ Environment Variables

```env
# Server
PORT=8080
ENV=development

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=shopen
DB_SSLMODE=disable

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRY_HOURS=24
```

---

## 🐳 Docker (Optional)

```dockerfile
# backend/Dockerfile
FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY . .
RUN go mod tidy && go build -o server ./cmd/server

FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/server .
EXPOSE 8080
CMD ["./server"]
```

```yaml
# docker-compose.yml
version: '3.9'
services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: shopen
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: yourpassword
    ports: ["5432:5432"]

  backend:
    build: ./backend
    ports: ["8080:8080"]
    environment:
      DB_HOST: db
      DB_PASSWORD: yourpassword
    depends_on: [db]

  frontend:
    build: ./frontend
    ports: ["5173:5173"]
    depends_on: [backend]
```

---

## ✨ Features

### Public Site
- 🔍 Full-text search across name, address, category
- 🏷 Category filter: Food / Medical / Café
- 🟢🔴 Open/Closed status filter (optional)
- 🍽️ Sub-type pills (Restaurant, Pharmacy, Coffee…)
- 🟢 Animated glow dot when open, static red when closed
- 📋 Shop profile modal: photo, description, Google Maps embed
- 🔁 Auto-refreshes every 10 seconds

### Admin Dashboard
- 🔐 JWT-authenticated login
- 📊 Stats: total, open, closed, open rate
- ➕ Add shop with full profile (name, photo, description, map query)
- ✏️ Edit any shop field
- 🗑 Delete shops with confirmation
- 🔄 One-click status toggle per shop
- 🔴🟢 Live preview in the form modal
