drizzle/schema.tsx
import { pgTable, serial, text, varchar } from "drizzle-orm/pg-core";

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  fullName: text('full_name'),
  phone: varchar('phone', { length: 256 }),
});


index.tsx


import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { users } from './schema'

const connectionString = process.env.DATABASE_URL

// Disable prefetch as it is not supported for "Transaction" pool mode
const client = postgres(connectionString, { prepare: false })
const db = drizzle(client);

const allUsers = await db.select().from(users);
        



Users (id, name, email, created_at)

Customers (id, name, user_id, satisfaction_score, notes)

CustomerUpdates (id, customer_id, type [happy/unhappy], summary, date)

Employees (id, name, email, user_id, last_active, responsiveness_score)

Tasks (id, customer_id, description, status, assigned_to_employee_id)

EmailLogs (id, user_id, employee_id, customer_id, subject, date, status [followed-up/missed], sentiment)


🧱 2. DATABASE SCHEMA FOR TRACKING

You’ll use Supabase (PostgreSQL) and create these tables:

Users
Tracks platform users (CEO / account owners).

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    company_name TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);



Employees

Employees (
  id UUID PK,
  name TEXT,
  email TEXT,
  last_active TIMESTAMP,
  total_tasks INT,
  completed_tasks INT,
  responsiveness_score FLOAT,  -- % replied within X hrs
  active BOOLEAN
)

Customers

Customer companies or individuals the agency works with.

CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    primary_domain TEXT, -- e.g., acme.com
    known_emails TEXT[], -- JSON or TEXT array of specific addresses
    overall_sentiment TEXT DEFAULT 'neutral', -- happy / neutral / unhappy
    flagged_issues BOOLEAN DEFAULT FALSE,
    current_projects TEXT[],
    waiting_on TEXT[],
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);


EmailLogs

EmailLogs (
  id UUID,
  from_email TEXT,
  to_email TEXT,
  customer_id UUID FK,
  employee_id UUID FK,
  subject TEXT,
  body TEXT,
  timestamp TIMESTAMP,
  sentiment TEXT,
  summary TEXT,
  action_needed BOOLEAN,
  replied BOOLEAN,
  reply_time_minutes INT
)

Tasks

CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES employees(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'open', -- open / in-progress / completed
    due_date DATE,
    completed_at TIMESTAMP,
    is_late BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);


DailySummaries

DailySummaries (
  id UUID,
  user_id UUID FK,
  date DATE,
  total_customers INT,
  happy_customers INT,
  unhappy_customers INT,
  total_tasks INT,
  open_tasks INT,
  flagged_customers UUID[]
)



Projects

High-level grouping of tasks per customer.

CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active', -- active / completed / paused
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT NOW()
);


CREATE TABLE email_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email_id UUID REFERENCES email_logs(id) ON DELETE CASCADE,
    sentiment TEXT, -- happy / neutral / unhappy
    summary TEXT,
    waiting_for TEXT,
    recommended_action TEXT,
    is_flagged BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

Daily Summaries

One-row-per-day report for each user (CEO), used in dashboards and notifications.
CREATE TABLE daily_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_customers INT,
    happy_customers INT,
    unhappy_customers INT,
    flagged_customers UUID[],
    total_tasks INT,
    open_tasks INT,
    overdue_tasks INT,
    top_issues TEXT[], -- recurring complaints
    created_at TIMESTAMP DEFAULT NOW()
);

