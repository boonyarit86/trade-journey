CREATE TABLE "trading_setup"."TD01_Project" (
  "TD01_Id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "TD01_Name" varchar(50) NOT NULL UNIQUE,
  "TD01_IsDefault" boolean DEFAULT false NOT NULL,
  "TD01_IsActive" boolean DEFAULT true NOT NULL,
  "TD01_CreatedBy" varchar(30) NOT NULL,
  "TD01_CreatedAt" timestamp NOT NULL DEFAULT NOW(),
  "TD01_ModifiedBy" varchar(30) NOT NULL,
  "TD01_ModifiedAt" timestamp NOT NULL DEFAULT NOW()
);