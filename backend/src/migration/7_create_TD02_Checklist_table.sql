CREATE TABLE "trading_setup"."TD02_Checklist" (
  "TD02_Id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "TD02_Name" varchar(100) NOT NULL UNIQUE,
  "TD02_IsRequired" boolean DEFAULT false NOT NULL,
  "TD02_IsActive" boolean DEFAULT true NOT NULL,
  "TD02_CreatedBy" varchar(30) NOT NULL,
  "TD02_CreatedAt" timestamp NOT NULL DEFAULT NOW(),
  "TD02_ModifiedBy" varchar(30) NOT NULL,
  "TD02_ModifiedAt" timestamp NOT NULL DEFAULT NOW()
);
