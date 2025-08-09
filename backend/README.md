# Trellin Backend

AI-Powered Customer Success Platform Backend API

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm
- PostgreSQL database (Supabase recommended)

### Installation

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Environment Setup:**
   Create a `.env` file in the backend directory with:
   ```env
   # Database Configuration
   DATABASE_URL=postgresql://username:password@localhost:5432/trellin_db
   
   # Server Configuration
   PORT=3001
   NODE_ENV=development
   
   # Frontend URL (for CORS)
   FRONTEND_URL=http://localhost:5173
   
   # Azure OpenAI Configuration (for Phase 3)
   AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
   AZURE_OPENAI_API_KEY=your-azure-openai-api-key
   AZURE_OPENAI_DEPLOYMENT_NAME=your-deployment-name
   
   # Google OAuth Configuration (for Phase 2)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback
   ```

3. **Database Setup:**
   ```bash
   # Generate migrations
   pnpm db:generate
   
   # Run migrations
   pnpm db:migrate
   
   # Open Drizzle Studio (optional)
   pnpm db:studio
   ```

4. **Start Development Server:**
   ```bash
   pnpm dev
   ```

## 📊 Database Schema

The backend uses Drizzle ORM with the following main tables:

- **users** - Platform users (CEOs/account owners)
- **customers** - Client companies with satisfaction tracking
- **employees** - Team members with performance metrics
- **tasks** - Action items and follow-ups
- **projects** - High-level work grouping
- **emailLogs** - Email communication tracking
- **emailInsights** - AI-analyzed email data
- **customerUpdates** - Customer satisfaction updates
- **dailySummaries** - Daily performance reports

## 🔧 Available Scripts

- `pnpm dev` - Start development server with nodemon
- `pnpm start` - Start production server
- `pnpm db:generate` - Generate database migrations
- `pnpm db:migrate` - Run database migrations
- `pnpm db:studio` - Open Drizzle Studio for database management

## 🛣️ API Endpoints

### Health Checks
- `GET /health` - Server health check
- `GET /health/db` - Database connection check

### Users API
- `GET /api/v1/users` - Get all users
- `GET /api/v1/users/:id` - Get user by ID
- `POST /api/v1/users` - Create new user
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (React)       │◄──►│   (Express)     │◄──►│   (Supabase)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   AI Analysis   │
                       │ (Azure OpenAI)  │
                       └─────────────────┘
```

## 🔄 Development Phases

### Phase 0: ✅ Foundation Setup
- [x] Express server setup
- [x] Drizzle ORM configuration
- [x] Database schema
- [x] Basic API routes

### Phase 1: 📊 Data Population
- [ ] Add dummy data to database
- [ ] Test all CRUD operations

### Phase 2: 🔐 Authentication
- [ ] Google OAuth 2.0 integration
- [ ] User authentication flow

### Phase 3: 🤖 AI Integration
- [ ] Azure OpenAI SDK setup
- [ ] Email analysis and sentiment detection

### Phase 4: 🚀 Full Implementation
- [ ] Complete API according to architecture
- [ ] Email sync functionality
- [ ] AI analysis pipeline

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL (Supabase)
- **ORM:** Drizzle ORM
- **Package Manager:** pnpm
- **AI:** Azure OpenAI SDK (Phase 3)
- **Auth:** Google OAuth 2.0 (Phase 2)
