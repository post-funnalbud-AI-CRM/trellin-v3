ALTER TABLE "customers" ADD COLUMN "last_email_date" timestamp;--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "role" text DEFAULT 'Customer Success Manager';--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "pending_tasks" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "overdue_tasks" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "avg_reply_time" real DEFAULT 0;