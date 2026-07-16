import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { StrategyChecklistService } from './strategy-checklist.service';
import { CreateStrategyChecklistDto } from './dto/create-strategy-checklist.dto';
import { UpdateStrategyChecklistActiveStatusDto, UpdateStrategyChecklistDto } from './dto/update-strategy-checklist.dto';

@Controller('strategy-checklist')
export class StrategyChecklistController {
    constructor(private readonly strategyChecklistService: StrategyChecklistService) {}

    @Get('/')
    getAllStrategyChecklists() {
        return this.strategyChecklistService.getAllStrategyChecklists();
    }

    @Get('/:strategyId')
    getStrategyChecklistsByStrategyId(@Param('strategyId') strategyId: string) {
        return this.strategyChecklistService.getStrategyChecklistsByStrategyId(strategyId);
    }

    @Post('/')
    createStrategyChecklist(@Body() data: CreateStrategyChecklistDto) {
        return this.strategyChecklistService.createStrategyChecklist(data);
    }

    @Put('/')
    updateStrategyChecklist(@Body() data: UpdateStrategyChecklistDto) {
        return this.strategyChecklistService.updateStrategyChecklist(data);
    }

    @Put('/activeStatus')
    updateStrategyChecklistActiveStatus(@Body() data: UpdateStrategyChecklistActiveStatusDto) {
        return this.strategyChecklistService.updateStrategyChecklistActiveStatus(data);
    }

    @Delete('/:strategyId/:checklistId')
    deleteStrategyChecklist(
        @Param('strategyId') strategyId: string,
        @Param('checklistId') checklistId: string,
    ) {
        return this.strategyChecklistService.deleteStrategyChecklist(strategyId, checklistId);
    }
}
