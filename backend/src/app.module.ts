import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import databaseConfig from './config/database.config';
import appConfig from './config/app.config';
import { PgModule } from './database/pg.module';
import { MigrationModule } from './migration/migration.module';
import { ProjectModule } from './project/project.module';
import { AssetModule } from './asset/asset.module';
import { ChecklistModule } from './checklist/checklist.module';
import { StrategyModule } from './strategy/strategy.module';
import { StrategyChecklistModule } from './strategy-checklist/strategy-checklist.module';
import { PortfolioModule } from './portfolio/portfolio.module';
import { TransactionStatusModule } from './transaction-status/transaction-status.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, appConfig],
    }),
    PgModule,
    MigrationModule,
    ProjectModule,
    AssetModule,
    ChecklistModule,
    StrategyModule,
    StrategyChecklistModule,
    PortfolioModule,
    TransactionStatusModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
