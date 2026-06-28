CREATE TABLE "common"."CM01_AssetType" (
  "CM01_Id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "CM01_Name" varchar(20) NOT NULL UNIQUE,
  "CM01_IsActive" boolean DEFAULT true NOT NULL,
  "CM01_CreatedBy" varchar(30) NOT NULL,
  "CM01_CreatedAt" timestamp NOT NULL DEFAULT NOW(),
  "CM01_ModifiedBy" varchar(30) NOT NULL,
  "CM01_ModifiedAt" timestamp NOT NULL DEFAULT NOW()
);