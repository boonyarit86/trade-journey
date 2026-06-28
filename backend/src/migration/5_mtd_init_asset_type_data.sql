DO $$
DECLARE
    actor VARCHAR(30) := 'system';
BEGIN
    INSERT INTO "common"."CM01_AssetType"
        ("CM01_Name", "CM01_CreatedBy", "CM01_ModifiedBy")
    VALUES
        ('Stocks',   actor, actor),
        ('Futures',  actor, actor),
        ('Forex',    actor, actor),
        ('Crypto',   actor, actor),
        ('Indices',  actor, actor),
        ('Metals',   actor, actor),
        ('Energies', actor, actor),
        ('Unknown',  actor, actor);
END $$;