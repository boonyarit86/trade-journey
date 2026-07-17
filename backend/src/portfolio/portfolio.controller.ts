import { Body, Controller, Delete, Get, Param, Post, Put, UsePipes, ValidationPipe } from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioActiveStatusDto, UpdatePortfolioDto } from './dto/update-portfolio.dto';

@Controller('portfolio')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class PortfolioController {
    constructor(private readonly portfolioService: PortfolioService) {}

    @Get('/')
    getAllPortfolios() {
        return this.portfolioService.getAllPortfolios();
    }

    @Get('/:id')
    getPortfolioById(@Param('id') id: string) {
        return this.portfolioService.getPortfolioById(id);
    }

    @Post('/')
    createPortfolio(@Body() data: CreatePortfolioDto) {
        return this.portfolioService.createPortfolio(data);
    }

    @Put('/')
    updatePortfolioById(@Body() data: UpdatePortfolioDto) {
        return this.portfolioService.updatePortfolioById(data);
    }

    @Put('/activeStatus')
    updatePortfolioActiveStatusById(@Body() data: UpdatePortfolioActiveStatusDto) {
        return this.portfolioService.updatePortfolioActiveStatusById(data);
    }

    @Delete('/:id')
    deletePortfolioById(@Param('id') id: string) {
        return this.portfolioService.deletePortfolioById(id);
    }
}
