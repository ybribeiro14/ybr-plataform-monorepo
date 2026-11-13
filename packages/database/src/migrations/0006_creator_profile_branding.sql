-- Migration: Creator profile, address, branding + User preferred locale
-- 2026-05-02

-- Add preferred locale to users
ALTER TABLE "users" ADD COLUMN "preferred_locale" varchar(10) DEFAULT 'pt-BR' NOT NULL;

-- Add personal data fields to creators
ALTER TABLE "creators" ADD COLUMN "phone" varchar(30);
ALTER TABLE "creators" ADD COLUMN "cpf" varchar(14);
ALTER TABLE "creators" ADD COLUMN "birth_date" date;
ALTER TABLE "creators" ADD COLUMN "gender" varchar(20);

-- Add address fields to creators
ALTER TABLE "creators" ADD COLUMN "country" varchar(2) DEFAULT 'BR';
ALTER TABLE "creators" ADD COLUMN "zip_code" varchar(10);
ALTER TABLE "creators" ADD COLUMN "street" varchar(255);
ALTER TABLE "creators" ADD COLUMN "street_number" varchar(20);
ALTER TABLE "creators" ADD COLUMN "complement" varchar(100);
ALTER TABLE "creators" ADD COLUMN "neighborhood" varchar(100);
ALTER TABLE "creators" ADD COLUMN "city" varchar(100);
ALTER TABLE "creators" ADD COLUMN "state" varchar(50);

-- Add brand identity fields to creators
ALTER TABLE "creators" ADD COLUMN "brand_name" varchar(255);
ALTER TABLE "creators" ADD COLUMN "logo_url" text;
ALTER TABLE "creators" ADD COLUMN "primary_color" varchar(7) DEFAULT '#6366f1';
ALTER TABLE "creators" ADD COLUMN "on_primary_color" varchar(7) DEFAULT '#ffffff';
