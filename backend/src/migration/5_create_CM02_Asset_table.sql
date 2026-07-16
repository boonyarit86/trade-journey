CREATE TABLE "common"."CM02_Asset" (
  "CM02_Id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "CM01_Id" uuid NOT NULL,
  "CM02_Name" varchar(20) NOT NULL UNIQUE,
  "CM02_IsActive" boolean DEFAULT true NOT NULL,
  "CM02_CreatedBy" varchar(30) NOT NULL,
  "CM02_CreatedAt" timestamp NOT NULL DEFAULT NOW(),
  "CM02_ModifiedBy" varchar(30) NOT NULL,
  "CM02_ModifiedAt" timestamp NOT NULL DEFAULT NOW()
);
