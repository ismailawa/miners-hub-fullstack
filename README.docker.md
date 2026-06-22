# Docker Setup for Miners Hub

This guide explains how to run the Miners Hub application using Docker.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+

## Quick Start

### Production Mode

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Development Mode

```bash
# Build and start all services in development mode
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop all services
docker-compose -f docker-compose.dev.yml down
```

## Services

The Docker setup includes:

1. **Frontend** (Next.js)
   - Port: 3000
   - URL: http://localhost:3000

2. **Backend** (NestJS)
   - Port: 3001
   - API URL: http://localhost:3001/api
   - Health Check: http://localhost:3001/api/health

3. **PostgreSQL Database**
   - Port: 5432
   - User: minershub
   - Password: minershub_password
   - Database: minershub

## Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
GEMINI_API_KEY=your_gemini_api_key_here

# Backend
FRONTEND_URL=http://localhost:3000
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=minershub
DB_PASSWORD=minershub_password
DB_DATABASE=minershub

# Supabase (if using)
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

## Building Individual Services

### Frontend Only

```bash
cd miners-hub-frontend
docker build -t miners-hub-frontend .
docker run -p 3000:3000 miners-hub-frontend
```

### Backend Only

```bash
cd miners-hub-backend
docker build -t miners-hub-backend .
docker run -p 3001:3001 miners-hub-backend
```

## Database Migrations

To run database migrations in the backend container:

```bash
# Production
docker-compose exec backend npm run migration:run

# Development
docker-compose -f docker-compose.dev.yml exec backend npm run migration:run
```

## Troubleshooting

### Port Already in Use

If ports 3000, 3001, or 5432 are already in use, modify the port mappings in `docker-compose.yml`:

```yaml
ports:
  - "3002:3000"  # Change host port
```

### Database Connection Issues

Ensure the PostgreSQL service is running:

```bash
docker-compose ps
```

Check database logs:

```bash
docker-compose logs postgres
```

### Rebuild After Code Changes

```bash
# Rebuild and restart
docker-compose up -d --build

# Or rebuild specific service
docker-compose build frontend
docker-compose up -d frontend
```

### Clear All Data

```bash
# Stop and remove containers, networks, and volumes
docker-compose down -v
```

## Production Deployment

For production deployment:

1. Update environment variables in `docker-compose.yml`
2. Use proper secrets management (Docker secrets, environment files)
3. Configure reverse proxy (nginx, traefik)
4. Set up SSL/TLS certificates
5. Configure database backups
6. Set up monitoring and logging

## Security Notes

- The Dockerfiles use non-root users for security
- Update default database passwords in production
- Use Docker secrets for sensitive data
- Regularly update base images for security patches
