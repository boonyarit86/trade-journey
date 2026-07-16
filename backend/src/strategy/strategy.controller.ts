import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { StrategyService } from './strategy.service';
import { CreateStrategyDto } from './dto/create-strategy.dto';
import { UpdateStrategyActiveStatusDto, UpdateStrategyDto } from './dto/update-strategy.dto';

@Controller('strategy')
export class StrategyController {
    constructor(private readonly strategyService: StrategyService) {}

    @Get('/')
    getAllStrategies() {
        return this.strategyService.getAllStrategies();
    }

    @Get('/:id')
    getStrategyById(@Param('id') id: string) {
        return this.strategyService.getStrategyById(id);
    }

    @Post('/')
    createStrategy(@Body() data: CreateStrategyDto) {
        return this.strategyService.createStrategy(data);
    }

    @Put('/')
    updateStrategyById(@Body() data: UpdateStrategyDto) {
        return this.strategyService.updateStrategyById(data);
    }

    @Put('/activeStatus')
    updateStrategyActiveStatusById(@Body() data: UpdateStrategyActiveStatusDto) {
        return this.strategyService.updateStrategyActiveStatusById(data);
    }

    @Delete('/:id')
    deleteStrategyById(@Param('id') id: string) {
        return this.strategyService.deleteStrategyById(id);
    }
}
