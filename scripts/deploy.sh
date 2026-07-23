#!/bin/bash
# deploy.sh
# Simple script to pull latest changes and restart docker-compose

echo "Pulling latest changes from main branch..."
git pull origin main

echo "Rebuilding and restarting Docker containers..."
docker-compose up -d --build

echo "Pruning dangling images..."
docker image prune -f

echo "Deployment complete."
