CREATE TABLE "invite_tokens" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"course_id" varchar(36) NOT NULL,
	"creator_id" varchar(36) NOT NULL,
	"token" varchar(64) NOT NULL,
	"expires_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "invite_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "enrollments" DROP CONSTRAINT "enrollments_payment_id_payments_id_fk";
--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN "external_ref" varchar(255);--> statement-breakpoint
ALTER TABLE "invite_tokens" ADD CONSTRAINT "invite_tokens_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invite_tokens" ADD CONSTRAINT "invite_tokens_creator_id_creators_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creators"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" DROP COLUMN "payment_id";