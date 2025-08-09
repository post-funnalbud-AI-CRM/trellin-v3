# Docker Setup for Trellin v3

This guide explains how to set up and run the Trellin v3 application using Docker and Docker Compose.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- Git

## Quick Start

1. **Clone the repository and navigate to the project root:**
   ```bash
   cd /path/to/trellin-v3
   ```

2. **Create environment files:**
   
   **Follow the detailed setup in ENVIRONMENT_SETUP.md or use these quick commands:**
   
   ```bash
   # Create backend environment file
   cat > backend/.env << 'EOF'
   DATABASE_URL=postgresql://postgres:your_secure_db_password@postgres:5432/trellin
   PORT=3001
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   JWT_SECRET=your_super_secure_jwt_secret_here_minimum_32_characters_long
   AZURE_OPENAI_API_KEY=your_azure_openai_api_key_here
   AZURE_OPENAI_ENDPOINT=https://submaiteopenai.openai.azure.com/
   AZURE_OPENAI_DEPLOYMENT=gpt-4o
   AZURE_OPENAI_API_VERSION=2024-04-01-preview
   AZURE_OPENAI_MODEL=gpt-4o
   AZURE_OPENAI_MAX_TOKENS=16000
   AZURE_OPENAI_TEMPERATURE=0.3
   EOF
   
   # Create frontend environment file
   cat > frontend/.env << 'EOF'
   VITE_API_URL=http://localhost:3001/api/v1
   VITE_APP_NAME=Trellin
   VITE_APP_VERSION=3.0.0
   NODE_ENV=development
   EOF
   
   # Create root environment file for Docker Compose
   cat > .env << 'EOF'
   POSTGRES_DB=trellin
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=your_secure_db_password
   JWT_SECRET=your_super_secure_jwt_secret_here_minimum_32_characters_long
   AZURE_OPENAI_API_KEY=your_azure_openai_api_key_here
   AZURE_OPENAI_ENDPOINT=https://submaiteopenai.openai.azure.com/
   AZURE_OPENAI_DEPLOYMENT=gpt-4o
   EOF
   ```
   
   **⚠️ Important:** Replace placeholder values with your actual credentials!

3. **Start all services:**
   ```bash
   docker-compose up -d
   ```

4. **Access the applications:**
   - Frontend: http://localhost:5173 (Vite dev server)
   - Backend API: http://localhost:3001
   - Database: localhost:5432
   - pgAdmin (optional): http://localhost:8080

## Environment Configuration

### Backend (.env)

Create `backend/.env` with these values (change as needed):

```env
# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_NAME=trellin
DB_USER=postgres
DB_PASSWORD=your_secure_db_password

# Authentication & Security
JWT_SECRET=your_super_secure_jwt_secret_here_min_32_chars
SESSION_SECRET=your_super_secure_session_secret_here_min_32_chars

# Azure OpenAI Configuration
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=your_azure_openai_api_key
AZURE_OPENAI_DEPLOYMENT_NAME=your_deployment_name

# Server Configuration
PORT=3000
NODE_ENV=production

# CORS Configuration
CORS_ORIGIN=http://localhost:5173,http://localhost:3001,https://your-domain.com
```

### Frontend (.env)

Create `frontend/.env` with these values (change as needed):

```env
# API Configuration
VITE_API_URL=http://localhost:3000/api

# For production, change to your actual domain:
# VITE_API_URL=https://your-api-domain.com/api

# Application Configuration
VITE_APP_NAME=Trellin
VITE_APP_VERSION=3.0.0
NODE_ENV=production
```

## Docker Compose Services

### Core Services

- **backend**: Node.js 22 API server running on port 3000
- **frontend**: React application running on port 3001
- **postgres**: PostgreSQL 15 database running on port 5432

### Optional Services

- **pgadmin**: Database management tool (use `--profile tools` to include)

## Common Commands

### Start all services
```bash
docker-compose up -d
```

### Start with pgAdmin
```bash
docker-compose --profile tools up -d
```

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Stop all services
```bash
docker-compose down
```

### Rebuild and restart
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Access container shell
```bash
# Backend
docker-compose exec backend sh

# Frontend
docker-compose exec frontend sh

# Database
docker-compose exec postgres psql -U postgres -d trellin
```

## Development vs Production

### Development Mode

For development, you can modify the Dockerfiles to use development commands:

1. In `backend/Dockerfile`, change the last line to:
   ```dockerfile
   CMD ["pnpm", "dev"]
   ```

2. In `frontend/Dockerfile`, uncomment the development section at the bottom.

### Production Mode

The current setup is optimized for production with:
- Multi-stage builds for frontend
- Non-root users for security
- Health checks
- Optimized image sizes

## Port Configuration

You can change ports in `docker-compose.yml`:

```yaml
services:
  backend:
    ports:
      - "YOUR_BACKEND_PORT:3000"  # Change YOUR_BACKEND_PORT
  
  frontend:
    ports:
      - "YOUR_FRONTEND_PORT:3000"  # Change YOUR_FRONTEND_PORT
  
  postgres:
    ports:
      - "YOUR_DB_PORT:5432"  # Change YOUR_DB_PORT
```

## Domain Configuration

### For Production Deployment

1. **Update backend CORS_ORIGIN in `.env`:**
   ```env
   CORS_ORIGIN=https://your-frontend-domain.com,https://your-api-domain.com
   ```

2. **Update frontend API URL in `.env`:**
   ```env
   VITE_API_URL=https://your-api-domain.com/api
   ```

3. **Update docker-compose.yml environment variables:**
   ```yaml
   backend:
     environment:
       - CORS_ORIGIN=https://your-frontend-domain.com
   
   frontend:
     environment:
       - VITE_API_URL=https://your-api-domain.com/api
   ```

## Database Management

### Run Migrations
```bash
docker-compose exec backend pnpm db:migrate
```

### Seed Data
```bash
docker-compose exec backend pnpm seed:emails
```

### Access Database
```bash
docker-compose exec postgres psql -U postgres -d trellin
```

### Backup Database
```bash
docker-compose exec postgres pg_dump -U postgres trellin > backup.sql
```

### Restore Database
```bash
cat backup.sql | docker-compose exec -T postgres psql -U postgres trellin
```

## Troubleshooting

### Common Issues

1. **Port conflicts:**
   - Change ports in `docker-compose.yml`
   - Make sure no other services are using the same ports

2. **Environment variables not loading:**
   - Check that `.env` files exist and have correct values
   - Restart containers after changing environment files

3. **Database connection issues:**
   - Ensure postgres service is healthy: `docker-compose ps`
   - Check database credentials in backend `.env`

4. **Frontend API connection issues:**
   - Verify `VITE_API_URL` in frontend `.env`
   - Check backend CORS configuration

### View Container Status
```bash
docker-compose ps
```

### Check Container Health
```bash
docker-compose exec backend curl -f http://localhost:3000/health
docker-compose exec frontend curl -f http://localhost:3000
```

### Reset Everything
```bash
docker-compose down -v  # This will delete all data
docker system prune -a  # This will remove all unused images
```

## Security Notes

- Always use strong passwords for database and JWT secrets
- In production, use environment-specific `.env` files
- Consider using Docker secrets for sensitive data in production
- Regularly update base images for security patches

## Performance Optimization

- Use `.dockerignore` files to reduce build context
- Implement multi-stage builds for smaller production images
- Use named volumes for better performance
- Consider using Alpine Linux images for smaller size
