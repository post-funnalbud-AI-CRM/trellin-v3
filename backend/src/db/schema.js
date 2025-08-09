import { pgTable, uuid, text, timestamp, boolean, integer, date, real, json } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table - Platform users (CEO / account owners)
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  companyName: text('company_name'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Employees table
export const employees = pgTable('employees', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  role: text('role').default('Customer Success Manager'),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  lastActive: timestamp('last_active'),
  totalTasks: integer('total_tasks').default(0),
  completedTasks: integer('completed_tasks').default(0),
  pendingTasks: integer('pending_tasks').default(0),
  overdueTasks: integer('overdue_tasks').default(0),
  responsivenessScore: real('responsiveness_score').default(0), // % replied within X hrs
  avgReplyTime: real('avg_reply_time').default(0), // in minutes
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Customers table
export const customers = pgTable('customers', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  primaryDomain: text('primary_domain'), // e.g., acme.com
  knownEmails: json('known_emails'), // JSON array of specific addresses
  overallSentiment: text('overall_sentiment').default('neutral'), // happy / neutral / unhappy
  flaggedIssues: boolean('flagged_issues').default(false),
  currentProjects: json('current_projects'),
  waitingOn: json('waiting_on'),
  lastEmailDate: timestamp('last_email_date'), // Last email contact date
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Projects table
export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  customerId: uuid('customer_id').references(() => customers.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  status: text('status').default('active'), // active / completed / paused
  startDate: date('start_date'),
  endDate: date('end_date'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Tasks table
export const tasks = pgTable('tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  customerId: uuid('customer_id').references(() => customers.id, { onDelete: 'cascade' }),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'set null' }),
  assignedTo: uuid('assigned_to').references(() => employees.id, { onDelete: 'set null' }),
  description: text('description').notNull(),
  status: text('status').default('open'), // open / in-progress / completed
  dueDate: date('due_date'),
  completedAt: timestamp('completed_at'),
  isLate: boolean('is_late').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// EmailLogs table
export const emailLogs = pgTable('email_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  employeeId: uuid('employee_id').references(() => employees.id, { onDelete: 'set null' }),
  customerId: uuid('customer_id').references(() => customers.id, { onDelete: 'set null' }),
  fromEmail: text('from_email').notNull(),
  toEmail: text('to_email').notNull(),
  subject: text('subject'),
  body: text('body'),
  timestamp: timestamp('timestamp').notNull(),
  sentiment: text('sentiment'), // happy / neutral / unhappy
  summary: text('summary'),
  actionNeeded: boolean('action_needed').default(false),
  replied: boolean('replied').default(false),
  replyTimeMinutes: integer('reply_time_minutes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// EmailInsights table
export const emailInsights = pgTable('email_insights', {
  id: uuid('id').primaryKey().defaultRandom(),
  emailId: uuid('email_id').references(() => emailLogs.id, { onDelete: 'cascade' }),
  sentiment: text('sentiment'), // happy / neutral / unhappy
  summary: text('summary'),
  waitingFor: text('waiting_for'),
  recommendedAction: text('recommended_action'),
  isFlagged: boolean('is_flagged').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// CustomerUpdates table
export const customerUpdates = pgTable('customer_updates', {
  id: uuid('id').primaryKey().defaultRandom(),
  customerId: uuid('customer_id').references(() => customers.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // happy / unhappy
  summary: text('summary'),
  date: date('date').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// DailySummaries table
export const dailySummaries = pgTable('daily_summaries', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  date: date('date').notNull(),
  totalCustomers: integer('total_customers').default(0),
  happyCustomers: integer('happy_customers').default(0),
  unhappyCustomers: integer('unhappy_customers').default(0),
  flaggedCustomers: json('flagged_customers'),
  totalTasks: integer('total_tasks').default(0),
  openTasks: integer('open_tasks').default(0),
  overdueTasks: integer('overdue_tasks').default(0),
  topIssues: json('top_issues'), // recurring complaints
  createdAt: timestamp('created_at').defaultNow(),
});

// Customer Topics table - AI-analyzed topics from customer emails
export const customerTopics = pgTable('customer_topics', {
  id: uuid('id').primaryKey().defaultRandom(),
  customerId: uuid('customer_id').references(() => customers.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(), // AI-generated topic title
  snapshot: text('snapshot').notNull(), // 1-2 line summary of the topic
  status: text('status').default('open'), // open / ongoing / closed
  priority: text('priority').default('medium'), // low / medium / high
  category: text('category'), // AI-determined category
  relatedEmails: json('related_emails'), // Array of email IDs related to this topic
  firstMentioned: timestamp('first_mentioned'), // When topic was first identified
  lastUpdated: timestamp('last_updated').defaultNow(),
  closedAt: timestamp('closed_at'),
  finalVerdict: text('final_verdict'), // AI suggestions when topic is closed
  aiConfidence: real('ai_confidence').default(0), // 0-1 confidence score
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  employees: many(employees),
  customers: many(customers),
  emailLogs: many(emailLogs),
  dailySummaries: many(dailySummaries),
  customerTopics: many(customerTopics),
}));

export const employeesRelations = relations(employees, ({ one, many }) => ({
  user: one(users, {
    fields: [employees.userId],
    references: [users.id],
  }),
  tasks: many(tasks),
  emailLogs: many(emailLogs),
}));

export const customersRelations = relations(customers, ({ one, many }) => ({
  user: one(users, {
    fields: [customers.userId],
    references: [users.id],
  }),
  projects: many(projects),
  tasks: many(tasks),
  emailLogs: many(emailLogs),
  customerUpdates: many(customerUpdates),
  customerTopics: many(customerTopics),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  customer: one(customers, {
    fields: [projects.customerId],
    references: [customers.id],
  }),
  tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  customer: one(customers, {
    fields: [tasks.customerId],
    references: [customers.id],
  }),
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id],
  }),
  assignedTo: one(employees, {
    fields: [tasks.assignedTo],
    references: [employees.id],
  }),
}));

export const emailLogsRelations = relations(emailLogs, ({ one, many }) => ({
  user: one(users, {
    fields: [emailLogs.userId],
    references: [users.id],
  }),
  employee: one(employees, {
    fields: [emailLogs.employeeId],
    references: [employees.id],
  }),
  customer: one(customers, {
    fields: [emailLogs.customerId],
    references: [customers.id],
  }),
  insights: many(emailInsights),
}));

export const emailInsightsRelations = relations(emailInsights, ({ one }) => ({
  email: one(emailLogs, {
    fields: [emailInsights.emailId],
    references: [emailLogs.id],
  }),
}));

export const customerUpdatesRelations = relations(customerUpdates, ({ one }) => ({
  customer: one(customers, {
    fields: [customerUpdates.customerId],
    references: [customers.id],
  }),
}));

export const dailySummariesRelations = relations(dailySummaries, ({ one }) => ({
  user: one(users, {
    fields: [dailySummaries.userId],
    references: [users.id],
  }),
}));

export const customerTopicsRelations = relations(customerTopics, ({ one }) => ({
  customer: one(customers, {
    fields: [customerTopics.customerId],
    references: [customers.id],
  }),
  user: one(users, {
    fields: [customerTopics.userId],
    references: [users.id],
  }),
}));
