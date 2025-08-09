import { db } from './src/db/index.js';
import { sql } from 'drizzle-orm';

const migrationSQL = `
ALTER TABLE "customers" ADD COLUMN "last_email_date" timestamp;
ALTER TABLE "employees" ADD COLUMN "role" text DEFAULT 'Customer Success Manager';
ALTER TABLE "employees" ADD COLUMN "pending_tasks" integer DEFAULT 0;
ALTER TABLE "employees" ADD COLUMN "overdue_tasks" integer DEFAULT 0;
ALTER TABLE "employees" ADD COLUMN "avg_reply_time" real DEFAULT 0;
`;

async function applyMigration() {
  try {
    console.log('🚀 Applying database migration...');
    
    // Split the migration into individual statements
    const statements = migrationSQL.split('--> statement-breakpoint').map(stmt => stmt.trim()).filter(stmt => stmt);
    
    for (const statement of statements) {
      console.log('Executing:', statement);
      await db.execute(sql.raw(statement));
    }
    
    console.log('✅ Migration applied successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

applyMigration();
