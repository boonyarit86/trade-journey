CREATE TABLE "trading_setup"."TD04_StrategyChecklist" (
  "TD02_Id" uuid NOT NULL,
  "TD03_Id" uuid NOT NULL,
  "TD04_IsActive" boolean DEFAULT true NOT NULL,
  "TD04_IsRequired" boolean DEFAULT false NOT NULL,
  "TD04_CreatedBy" varchar(30) NOT NULL,
  "TD04_CreatedAt" timestamp NOT NULL DEFAULT NOW(),
  "TD04_ModifiedBy" varchar(30) NOT NULL,
  "TD04_ModifiedAt" timestamp NOT NULL DEFAULT NOW()
);
