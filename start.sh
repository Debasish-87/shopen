#!/bin/bash

set -e

echo "Starting monitoring stack..."
docker compose -f monitoring/docker-compose.yml up -d

echo "Starting application stack..."
docker compose up -d --build

echo ""
echo "✅ All services started"
echo ""
echo "Frontend  → http://localhost:5173"
echo "Backend   → http://localhost:8080"
echo "Prometheus→ http://localhost:9090"
echo "Grafana   → http://localhost:3001"
echo "Jaeger    → http://localhost:16686"

