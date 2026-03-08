#!/bin/bash

echo "Stopping application stack..."
docker compose down

echo "Stopping monitoring stack..."
docker compose -f monitoring/docker-compose.yml down

echo "All services stopped"