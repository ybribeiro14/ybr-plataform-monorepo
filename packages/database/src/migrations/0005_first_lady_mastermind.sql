CREATE TABLE "student_profiles" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"phone" varchar(30),
	"cpf" varchar(14),
	"birth_date" date,
	"gender" varchar(20),
	"bio" text,
	"country" varchar(2) DEFAULT 'BR',
	"zip_code" varchar(10),
	"street" varchar(255),
	"street_number" varchar(20),
	"complement" varchar(100),
	"neighborhood" varchar(100),
	"city" varchar(100),
	"state" varchar(50),
	"linkedin_url" varchar(500),
	"instagram_handle" varchar(100),
	"is_profile_complete" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "student_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "creators" ADD COLUMN "courses_limit" integer DEFAULT 10;--> statement-breakpoint
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;