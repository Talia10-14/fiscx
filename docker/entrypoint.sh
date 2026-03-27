#!/bin/sh

# Wait for database to be ready
echo "⏳ Waiting for PostgreSQL..."
until pg_isready -h postgres -U fiscx; do
  sleep 1
done
echo "✅ PostgreSQL is ready!"

# Run Prisma migrations
echo "🔄 Running Prisma migrations..."
npx prisma migrate deploy

# Seed database (optional, comment out if not needed)
echo "🌱 Seeding database..."
npm run prisma:seed || echo "⚠️ Seeding failed or skipped"

# Start application
echo "🚀 Starting FiscX backend..."
npm run dev
