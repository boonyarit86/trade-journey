import { Module } from '@nestjs/common';
import { StrategyChecklistController } from './strategy-checklist.controller';
import { StrategyChecklistService } from './strategy-checklist.service';

@Module({
    controllers: [StrategyChecklistController],
    providers: [StrategyChecklistService],
})
export class StrategyChecklistModule {}
