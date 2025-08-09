# Environment Variables Setup for Trellin v3

This guide explains how to set up environment variables for both backend and frontend services.

## Backend Environment Variables

Create a file `backend/.env` with the following variables:

```bash
# Backend Environment Variables for Trellin v3

# Database Configuration
# PostgreSQL connection URL format: postgresql://username:password@host:port/database
DATABASE_URL=postgresql://postgres:your_secure_db_password@postgres:5432/trellin

# Server Configuration  
PORT=3001
NODE_ENV=development

# Frontend URL for CORS (adjust for your domain in production)
FRONTEND_URL=http://localhost:5173

# JWT Configuration
# Generate a secure random string (minimum 32 characters)
JWT_SECRET=your_super_secure_jwt_secret_here_minimum_32_characters_long
JWT_EXPIRES_IN=24h

# Azure OpenAI Configuration (Required)
# Get these values from your Azure OpenAI service
AZURE_OPENAI_API_KEY=your_azure_openai_api_key_here
AZURE_OPENAI_ENDPOINT=https://submaiteopenai.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=gpt-4o
AZURE_OPENAI_API_VERSION=2024-04-01-preview
AZURE_OPENAI_MODEL=gpt-4o
AZURE_OPENAI_MAX_TOKENS=16000
AZURE_OPENAI_TEMPERATURE=0.3

# Google OAuth (Optional - for future use)
# GOOGLE_CLIENT_ID=your_google_client_id
# GOOGLE_CLIENT_SECRET=your_google_client_secret
# GOOGLE_REDIRECT_URI=http://localhost:3001/api/v1/auth/google/callback

# Email Configuration (Optional - for future use)
# SMTP_HOST=your_smtp_host
# SMTP_PORT=587
# SMTP_USER=your_email@domain.com
# SMTP_PASS=your_email_password
```

## Frontend Environment Variables

Create a file `frontend/.env` with the following variables:

```bash
# Frontend Environment Variables for Trellin v3

# API Configuration
# For development (when running with docker-compose)
VITE_API_URL=http://localhost:3001/api/v1

# Application Configuration
VITE_APP_NAME=Trellin
VITE_APP_VERSION=3.0.0

# Environment
NODE_ENV=development

# Optional: Analytics or other third-party service keys
# VITE_GOOGLE_ANALYTICS_ID=your_ga_id
# VITE_SENTRY_DSN=your_sentry_dsn
# VITE_MIXPANEL_TOKEN=your_mixpanel_token
```

## Docker Compose Root Environment Variables

Create a file `.env` in the project root for Docker Compose variables:

```bash
# Docker Compose Environment Variables

# PostgreSQL Database Configuration
POSTGRES_DB=trellin
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_db_password

# Backend Configuration
JWT_SECRET=your_super_secure_jwt_secret_here_minimum_32_characters_long

# Azure OpenAI Configuration
AZURE_OPENAI_API_KEY=your_azure_openai_api_key_here
AZURE_OPENAI_ENDPOINT=https://submaiteopenai.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=gpt-4o
AZURE_OPENAI_API_VERSION=2024-04-01-preview
AZURE_OPENAI_MODEL=gpt-4o
AZURE_OPENAI_MAX_TOKENS=16000
AZURE_OPENAI_TEMPERATURE=0.3
```

## Required Environment Variables

### Critical Variables (Must be set)

1. **DATABASE_URL** - PostgreSQL connection string
2. **AZURE_OPENAI_API_KEY** - Your Azure OpenAI API key
3. **JWT_SECRET** - Secure random string for JWT signing

### Important Variables

1. **POSTGRES_PASSWORD** - Database password
2. **FRONTEND_URL** - Frontend URL for CORS configuration
3. **AZURE_OPENAI_ENDPOINT** - Your Azure OpenAI endpoint

## Production Configuration

For production deployment, update these variables:

### Backend (.env)
```bash
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
DATABASE_URL=postgresql://username:password@your-db-host:5432/trellin
```

### Frontend (.env)
```bash
NODE_ENV=production
VITE_API_URL=https://your-api-domain.com/api/v1
```

### Docker Compose
Update `docker-compose.yml` to use production targets:
```yaml
target: production  # Instead of development
```

## Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use strong passwords** for database and JWT secrets
3. **Rotate API keys** regularly
4. **Use environment-specific configurations** for different stages
5. **Limit CORS origins** to your actual domains in production

## Azure OpenAI Setup

1. Create an Azure OpenAI resource in Azure Portal
2. Deploy a GPT-4 model (recommended: gpt-4o)
3. Get your API key and endpoint from the Azure Portal
4. Update the environment variables accordingly

## Database Setup

The PostgreSQL database will be automatically created by Docker Compose with the credentials you specify in the environment variables.

## Troubleshooting

### Common Issues

1. **Missing Azure OpenAI API Key**: The backend will fail to start without this
2. **Wrong DATABASE_URL format**: Must follow PostgreSQL URL format
3. **CORS issues**: Ensure FRONTEND_URL matches your frontend URL
4. **Port conflicts**: Change ports in docker-compose.yml if needed

### Health Checks

- Backend health: http://localhost:3001/health
- Database health: http://localhost:3001/health/db
- Frontend: http://localhost:5173

## Environment File Templates

To quickly set up your environment files, run:

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
AZURE_OPENAI_API_VERSION=2024-04-01-preview
AZURE_OPENAI_MODEL=gpt-4o
AZURE_OPENAI_MAX_TOKENS=16000
AZURE_OPENAI_TEMPERATURE=0.3
EOF
```

Remember to replace placeholder values with your actual credentials!
