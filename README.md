# Shopen

Real-time shop directory built with **Go, React, PostgreSQL, Redis, and Docker**.

Shopen lets users quickly find nearby shops and check whether they are **open or closed in real-time**.  
The system is built with **modern backend observability and monitoring tools**.

---

# Features

- Real-time shop status
- Search and category filtering
- Admin dashboard
- Redis caching
- PostgreSQL database
- JWT authentication
- Database migrations
- Observability stack

---

# Tech Stack

## Backend
- Go
- PostgreSQL
- Redis
- OpenTelemetry
- Jaeger tracing
- Prometheus metrics

## Frontend
- React
- Vite
- TypeScript
- Axios

## Infrastructure
- Docker
- Docker Compose
- Grafana monitoring

---

# Architecture

```

Frontend (React)
      │
      ▼
Backend API (Go)
      │
┌─────┴──────┐
▼            ▼
Redis      PostgreSQL
(cache)      (data)

```

Monitoring Stack:

```

OpenTelemetry
   │
   ▼
Jaeger (Tracing)

Prometheus (Metrics)

Grafana (Dashboards)

```

---

# Project Structure

```

shopen
│
├── backend
│   ├── cmd/server
│   ├── internal
│   │   ├── cache
│   │   ├── db
│   │   ├── handlers
│   │   ├── middleware
│   │   ├── models
│   │   └── tracing
│   │
│   └── migrations
│
├── frontend
│
├── docker-compose.yml
├── start.sh
└── stop.sh

````

---

# Running the Project

## Requirements

- Docker
- Docker Compose
- Go 1.25+
- Node 20+

---

## Start services

```bash
./start.sh
````

Services will start:

```
Frontend  → http://localhost:5173
Backend   → http://localhost:8080
Prometheus→ http://localhost:9090
Grafana   → http://localhost:3001
Jaeger    → http://localhost:16686
```

---

## Stop services

```
./stop.sh
```

---

# Database Migrations

Shopen uses **golang-migrate** for database migrations.

Migration files:

```
backend/migrations
```

Example:

```
000001_initial_schema.up.sql
000001_initial_schema.down.sql
```

Run migrations:

```
migrate \
-path backend/migrations \
-database "postgres://postgres:postgres@localhost:5432/shopen?sslmode=disable" \
up
```

Rollback:

```
migrate down 1
```

---

# API Endpoints

## Public

```
GET /api/shops
GET /api/shops/:id
GET /api/health
```

---

## Admin

```
POST /api/auth/login

GET /api/admin/shops
POST /api/admin/shops
PUT /api/admin/shops/:id
DELETE /api/admin/shops/:id
PATCH /api/admin/shops/:id/toggle
```

---

# Observability

Shopen includes full production-level observability.

## Metrics

Prometheus endpoint:

```
/metrics
```

Metrics tracked:

* HTTP request count
* Request latency
* Go runtime metrics

---

## Tracing

Tracing is powered by **OpenTelemetry + Jaeger**.

Example trace:

```
HTTP GET /api/shops
   │
   ├ Redis GET shops_cache
   │
   └ PostgreSQL SELECT shops
```

---

# Performance Features

* Redis caching for shop lists
* Connection pooling
* Database indexing
* Observability for debugging

---

# Development

Backend:

```
cd backend
go run cmd/server/main.go
```

Frontend:

```
cd frontend
npm install
npm run dev
```

---

# Admin Login

```
username: admin
password: admin123
```

---

# License

MIT License


