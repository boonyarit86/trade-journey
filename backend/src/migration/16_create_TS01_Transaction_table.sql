CREATE TABLE "transaction"."TS01_Transaction" (
  "TS01_Id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "TD05_Id" uuid NOT NULL,
  "TS01_Amount" integer NOT NULL,
  "TS01_Fees" integer NOT NULL DEFAULT 0,
  "CM03_Value" varchar(3) NOT NULL,
  "TS01_CreatedBy" varchar(30) NOT NULL,
  "TS01_CreatedAt" timestamp NOT NULL DEFAULT NOW(),
  "TS01_ModifiedBy" varchar(30) NOT NULL,
  "TS01_ModifiedAt" timestamp NOT NULL DEFAULT NOW()
);
