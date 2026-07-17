ALTER TABLE "trading_setup"."TD05_Portfolio"
  ADD COLUMN "TD05_TotalBreakEven"   numeric NOT NULL DEFAULT 0,
  ADD COLUMN "TD05_SumTotalBreakEven" numeric NOT NULL DEFAULT 0,
  ADD COLUMN "CM05_Value"            varchar(3);

COMMENT ON COLUMN "trading_setup"."TD05_Portfolio"."CM05_Value"
  IS 'used to validate the previous transaction result';
