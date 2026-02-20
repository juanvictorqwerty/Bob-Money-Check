CREATE TABLE "clearance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"date" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clearances_Index" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"clearance_id" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student" (
	"matricule" varchar(25) PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"due_sum" integer DEFAULT 365000 NOT NULL,
	"excess_fees" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "matricule_unique" UNIQUE("matricule")
);
--> statement-breakpoint
CREATE TABLE "token" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" varchar(255) NOT NULL,
	"date_Created" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"date_ended" timestamp(3)
);
--> statement-breakpoint
CREATE TABLE "used_receipts" (
	"id" uuid NOT NULL,
	"PaymentDate" timestamp(3) NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"clearance_id" uuid NOT NULL,
	CONSTRAINT "used_receipts_pkey" PRIMARY KEY("id","PaymentDate")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"role" varchar(255) NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "clearance" ADD CONSTRAINT "clearance_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "clearances_Index" ADD CONSTRAINT "clearances_Index_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "student" ADD CONSTRAINT "Student_matricule" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "token" ADD CONSTRAINT "token_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "used_receipts" ADD CONSTRAINT "used_receipts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "used_receipts" ADD CONSTRAINT "used_receipts_clearance_id_fkey" FOREIGN KEY ("clearance_id") REFERENCES "public"."clearance"("id") ON DELETE restrict ON UPDATE cascade;