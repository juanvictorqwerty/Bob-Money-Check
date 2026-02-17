CREATE TABLE "student" (
	"matricule" varchar(25) PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	CONSTRAINT "matricule_unique" UNIQUE("matricule")
);
--> statement-breakpoint
ALTER TABLE "student" ADD CONSTRAINT "Student_matricule" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE cascade;