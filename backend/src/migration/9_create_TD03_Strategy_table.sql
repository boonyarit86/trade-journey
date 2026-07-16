CREATE TABLE "trading_setup"."TD03_Strategy" (
  "TD03_Id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "TD03_Name" varchar(50) NOT NULL UNIQUE,
  "TD03_RiskRewardRatio" integer,
  "TD03_RiskPerTrade" integer,
  "TD03_Description" varchar(255),
  "TD03_IsActive" boolean DEFAULT true NOT NULL,
  "TD03_CreatedBy" varchar(30) NOT NULL,
  "TD03_CreatedAt" timestamp NOT NULL DEFAULT NOW(),
  "TD03_ModifiedBy" varchar(30) NOT NULL,
  "TD03_ModifiedAt" timestamp NOT NULL DEFAULT NOW()
);
