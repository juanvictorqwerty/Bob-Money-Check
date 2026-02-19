ALTER TABLE "student" ADD COLUMN "due_sum" integer DEFAULT 365000 NOT NULL;--> statement-breakpoint
ALTER TABLE "student" ADD COLUMN "excess_fees" integer DEFAULT 0 NOT NULL;