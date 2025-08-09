# Azure VM Deployment Configuration

## Overview
This document describes the configuration changes made to deploy Trellin v3 on Azure VM with IP address `4.240.103.28`.

## Azure VM Details
- **VM IP Address**: `4.240.103.28`
- **Required Ports**: 
  - `3001` (Backend API)
  - `5173` (Frontend)
- **PostgreSQL**: External (Supabase) - no port needed on VM

## Configuration Changes Made

### 1. Frontend Configuration
**File**: `frontend/src/services/api.ts`
- **Change**: Hardcoded API base URL to Azure VM IP
- **Reason**: Vite environment variables require build-time configuration, not runtime
- **Value**: `http://4.240.103.28:3001/api/v1`

```typescript
// Azure VM Configuration - Hardcoded for Azure deployment
// VM IP: 4.240.103.28
// Backend Port: 3001
// Note: This is hardcoded to avoid Vite environment variable build-time issues
const API_BASE_URL = 'http://4.240.103.28:3001/api/v1';
```

### 2. Backend Configuration
**File**: `backend/.env`
- **FRONTEND_URL**: `http://4.240.103.28:5173`

**File**: `backend/src/utils/config.js`
- **frontendUrl**: Default changed to `http://4.240.103.28:5173`
- **Google OAuth redirectUri**: Updated for VM deployment

**File**: `backend/src/index.js`
- **CORS origins**: Added Azure VM IP to allowed origins
- **Console logs**: Updated to show correct VM URLs

### 3. Docker Configuration
**File**: `docker-compose.yml`
- **Backend ports**: `"0.0.0.0:3001:3001"` (expose on all interfaces)
- **Frontend ports**: `"0.0.0.0:5173:5173"` (expose on all interfaces)
- **VITE_API_URL**: `http://4.240.103.28:3001/api/v1`

**File**: `frontend/.env`
- **VITE_API_URL**: `http://4.240.103.28:3001/api/v1`

## Azure Network Security Group Configuration

### Required Inbound Rules:
```
Port 3001: Backend API
- Source: Any
- Protocol: TCP
- Action: Allow

Port 5173: Frontend
- Source: Any  
- Protocol: TCP
- Action: Allow
```

### Not Required:
- PostgreSQL ports (using external Supabase)
- SSH (port 22) - already configured by default

## Deployment Commands

### 1. Deploy Application
```bash
# Stop existing containers
docker-compose down

# Rebuild with no cache
docker-compose build --no-cache

# Start containers
docker-compose up -d
```

### 2. Verify Deployment
```bash
# Check backend health
curl http://4.240.103.28:3001/health

# Check API endpoints
curl http://4.240.103.28:3001/api/v1

# Check containers
docker ps
```

### 3. View Logs
```bash
# Backend logs
docker logs trellin-backend

# Frontend logs
docker logs trellin-frontend
```

## Access URLs
- **Frontend**: http://4.240.103.28:5173
- **Backend API**: http://4.240.103.28:3001/api/v1
- **Health Check**: http://4.240.103.28:3001/health
- **Database Health**: http://4.240.103.28:3001/health/db

## Troubleshooting

### Common Issues:

1. **CORS Errors**
   - Check `backend/src/index.js` CORS configuration
   - Ensure Azure VM IP is in allowed origins

2. **Frontend shows "localhost:3001" in errors**
   - Clear browser cache completely
   - Try incognito/private browsing mode
   - Rebuild frontend container: `docker-compose build --no-cache frontend`

3. **Cannot access ports**
   - Check Azure Network Security Group rules
   - Verify VM firewall: `sudo ufw status`

4. **Environment Variables Not Working**
   - Vite requires build-time environment variables
   - Current solution uses hardcoded values to avoid this issue

### Security Notes:
- Using HTTP (not HTTPS) - suitable for development/testing
- For production, implement HTTPS with SSL certificates
- Consider restricting source IPs in Network Security Group rules

## Future Improvements:
1. Implement HTTPS with SSL certificates
2. Use proper environment variable management for different environments
3. Add monitoring and logging solutions
4. Implement backup strategies for containerized deployment
