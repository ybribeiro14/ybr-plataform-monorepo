CREATE TABLE "lesson_attachments" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"lesson_id" varchar(36) NOT NULL,
	"title" varchar(500) NOT NULL,
	"file_url" text NOT NULL,
	"file_type" varchar(20) DEFAULT 'pdf' NOT NULL,
	"file_size_bytes" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "certificates" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"course_id" varchar(36) NOT NULL,
	"enrollment_id" varchar(36) NOT NULL,
	"certificate_url" text,
	"verification_code" varchar(36) NOT NULL,
	"issued_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "certificates_verification_code_unique" UNIQUE("verification_code")
);
--> statement-breakpoint
CREATE TABLE "coupons" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"creator_id" varchar(36) NOT NULL,
	"code" varchar(50) NOT NULL,
	"discount_type" varchar(20) NOT NULL,
	"discount_value" integer NOT NULL,
	"max_uses" integer,
	"current_uses" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "coupons_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"creator_id" varchar(36) NOT NULL,
	"title" varchar(500) NOT NULL,
	"slug" varchar(500) NOT NULL,
	"description" text,
	"thumbnail_url" text,
	"price_cents" integer DEFAULT 0 NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"language" varchar(10) DEFAULT 'pt-BR' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "courses_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "creators" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"bio" text,
	"website" varchar(500),
	"stripe_account_id" varchar(255),
	"plan" varchar(20) DEFAULT 'starter' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "creators_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "enrollments" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"course_id" varchar(36) NOT NULL,
	"payment_id" varchar(36),
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"expires_at" timestamp,
	"enrolled_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "lessons" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"module_id" varchar(36) NOT NULL,
	"title" varchar(500) NOT NULL,
	"description" text,
	"bunny_video_id" varchar(255),
	"mux_asset_id" varchar(255),
	"mux_playback_id" varchar(255),
	"duration_seconds" integer,
	"position" integer DEFAULT 0 NOT NULL,
	"is_free_preview" boolean DEFAULT false NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course_modules" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"course_id" varchar(36) NOT NULL,
	"title" varchar(500) NOT NULL,
	"description" text,
	"position" integer DEFAULT 0 NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"course_id" varchar(36) NOT NULL,
	"stripe_payment_intent_id" varchar(255),
	"stripe_charge_id" varchar(255),
	"amount_cents" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"installments" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "payments_stripe_payment_intent_id_unique" UNIQUE("stripe_payment_intent_id")
);
--> statement-breakpoint
CREATE TABLE "lesson_progress" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"lesson_id" varchar(36) NOT NULL,
	"watched_seconds" integer DEFAULT 0 NOT NULL,
	"completed_at" timestamp,
	"last_watched_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text,
	"name" varchar(255) NOT NULL,
	"avatar_url" text,
	"role" varchar(20) DEFAULT 'student' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "lesson_attachments" ADD CONSTRAINT "lesson_attachments_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_enrollment_id_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."enrollments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coupons" ADD CONSTRAINT "coupons_creator_id_creators_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creators"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_creator_id_creators_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creators"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creators" ADD CONSTRAINT "creators_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_module_id_course_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."course_modules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_modules" ADD CONSTRAINT "course_modules_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;