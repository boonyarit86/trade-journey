import { Module } from '@nestjs/common';
import { PgModule } from 'src/database/pg.module';
import { MigrationService } from './migration.service';

@Module({
    imports: [PgModule],
    providers: [MigrationService],
    exports: [MigrationService],
})
export class MigrationModule {}
