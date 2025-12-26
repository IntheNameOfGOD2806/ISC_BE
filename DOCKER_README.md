# Docker Setup Guide

This guide will help you run the ISC Backend application using Docker.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+

## Quick Start

### 1. Environment Configuration

Copy the example environment file and configure it:

```bash
cp .env.docker .env
```

Edit `.env` and update the following required variables:
- `JWT_SECRET` - Your JWT secret key
- `JWT_REFRESH_SECRET` - Your JWT refresh secret key
- `FRONTEND_URL` - Your frontend application URL

Optional variables (for specific features):
- Email configuration (for email notifications)
- Gemini API key (for AI features)
- PayOS credentials (for payment processing)
- Stripe credentials (for payment processing)

### 2. Build and Start Services

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
```

### 3. Access the Application

- **Backend API**: http://localhost:8888
- **API Documentation**: http://localhost:8888/api-docs
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

### 4. Default Admin Credentials

After the first startup, an admin user is created:
- **Email**: admin@example.com
- **Password**: Admin@123

## Docker Services

### Backend (Node.js)
- Port: 8888
- Depends on: PostgreSQL, Redis
- Auto-restarts on failure
- Health checks enabled

### PostgreSQL
- Port: 5432
- Database: isc_db
- User: postgres
- Password: postgres (change in production)
- Data persisted in Docker volume

### Redis
- Port: 6379
- No password (add in production)
- Data persisted in Docker volume

## Common Commands

### Start Services
```bash
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

### Stop and Remove Volumes (⚠️ Deletes all data)
```bash
docker-compose down -v
```

### Rebuild Services
```bash
docker-compose up -d --build
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f postgres
docker-compose logs -f redis
```

### Execute Commands in Container
```bash
# Access backend shell
docker-compose exec backend sh

# Run database migrations
docker-compose exec backend npm run db:migrate

# Run database seeds
docker-compose exec backend npm run db:seed
```

### Check Service Status
```bash
docker-compose ps
```

### Restart a Service
```bash
docker-compose restart backend
```

## Database Management

### Run Migrations
```bash
docker-compose exec backend npm run db:migrate
```

### Seed Database
```bash
docker-compose exec backend npm run db:seed
```

### Reset Database (⚠️ Deletes all data)
```bash
docker-compose exec backend npm run db:reset
```

### Access PostgreSQL CLI
```bash
docker-compose exec postgres psql -U postgres -d isc_db
```

### Backup Database
```bash
docker-compose exec postgres pg_dump -U postgres isc_db > backup.sql
```

### Restore Database
```bash
cat backup.sql | docker-compose exec -T postgres psql -U postgres -d isc_db
```

## Redis Management

### Access Redis CLI
```bash
docker-compose exec redis redis-cli
```

### Clear Redis Cache
```bash
docker-compose exec redis redis-cli FLUSHALL
```

## Troubleshooting

### Services Won't Start
```bash
# Check logs for errors
docker-compose logs

# Check service status
docker-compose ps

# Restart services
docker-compose restart
```

### Database Connection Issues
```bash
# Check if PostgreSQL is healthy
docker-compose ps postgres

# View PostgreSQL logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres
```

### Port Already in Use
If ports 8888, 5432, or 6379 are already in use, you can change them in `docker-compose.yml`:

```yaml
services:
  backend:
    ports:
      - "9000:8888"  # Change 9000 to your preferred port
```

### Clean Rebuild
```bash
# Stop all services
docker-compose down

# Remove all containers, networks, and volumes
docker-compose down -v

# Remove images
docker-compose down --rmi all

# Rebuild and start
docker-compose up -d --build
```

## Production Considerations

### Security
1. Change default PostgreSQL password
2. Set strong JWT secrets
3. Enable Redis password authentication
4. Use environment-specific `.env` files
5. Don't commit `.env` files to version control

### Performance
1. Adjust PostgreSQL memory settings
2. Configure Redis maxmemory policy
3. Use production-grade reverse proxy (nginx)
4. Enable SSL/TLS certificates

### Monitoring
1. Set up container health monitoring
2. Configure log aggregation
3. Monitor resource usage
4. Set up alerts for service failures

## Development Mode

For development with hot-reload:

```bash
# Use nodemon for auto-restart
docker-compose exec backend npm run dev
```

Or modify `docker-compose.yml` to mount source code:

```yaml
services:
  backend:
    volumes:
      - ./be:/app
      - /app/node_modules
    command: npm run dev
```

## Network Architecture

All services run on the `isc_network` bridge network:
- Services can communicate using service names as hostnames
- Backend connects to `postgres:5432` and `redis:6379`
- External access via mapped ports

## Volume Management

### List Volumes
```bash
docker volume ls
```

### Inspect Volume
```bash
docker volume inspect isc_be_postgres_data
docker volume inspect isc_be_redis_data
```

### Backup Volumes
```bash
docker run --rm -v isc_be_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz -C /data .
```

## Support

For issues or questions:
1. Check logs: `docker-compose logs -f`
2. Verify service health: `docker-compose ps`
3. Review environment variables in `.env`
4. Check Docker and Docker Compose versions
