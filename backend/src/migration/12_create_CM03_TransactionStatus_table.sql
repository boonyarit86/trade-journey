CREATE TABLE "common"."CM03_TransactionStatus" (
  "CM03_Id"         uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  "CM03_Text"       varchar(20)  NOT NULL,
  "CM03_Value"      varchar(3)   NOT NULL,
  "CM03_ColorCode"  varchar(30)  NOT NULL,
  "CM03_IsActive"   boolean      NOT NULL DEFAULT true,
  "CM03_CreatedBy"  varchar(30)  NOT NULL,
  "CM03_CreatedAt"  timestamp    NOT NULL DEFAULT NOW(),
  "CM03_ModifiedBy" varchar(30)  NOT NULL,
  "CM03_ModifiedAt" timestamp    NOT NULL DEFAULT NOW()
);
