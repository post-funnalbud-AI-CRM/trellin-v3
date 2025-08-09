CREATE TABLE IF NOT EXISTS "customer_topics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid,
	"user_id" uuid,
	"title" text NOT NULL,
	"snapshot" text NOT NULL,
	"status" text DEFAULT 'open',
	"priority" text DEFAULT 'medium',
	"category" text,
	"related_emails" json,
	"first_mentioned" timestamp,
	"last_updated" timestamp DEFAULT now(),
	"closed_at" timestamp,
	"final_verdict" text,
	"ai_confidence" real DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "customer_topics" ADD CONSTRAINT "customer_topics_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "customer_topics" ADD CONSTRAINT "customer_topics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
