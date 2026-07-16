DO $$
DECLARE
    actor VARCHAR(30) := 'system';
BEGIN
    INSERT INTO "trading_setup"."TD02_Checklist"
        ("TD02_Name", "TD02_CreatedBy", "TD02_ModifiedBy")
    VALUES
        ('Without emotional',   actor, actor),
        ('Trading in specific time',  actor, actor),
        ('Not consecutive loss 2 times',    actor, actor);
END $$;
