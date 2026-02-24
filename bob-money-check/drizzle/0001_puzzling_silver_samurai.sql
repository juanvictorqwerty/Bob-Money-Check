CREATE TABLE "RecoveryToken" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"recoveryCode" integer NOT NULL,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"isValid" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
ALTER TABLE "RecoveryToken" ADD CONSTRAINT "recovery_token" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE cascade;