import { Body, Controller, Get, Param, Post, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Controller('transaction')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class TransactionController {
    constructor(private readonly transactionService: TransactionService) {}

    @Get('/')
    getAllTransactions(@Query('portfolioId') portfolioId?: string) {
        return this.transactionService.getAllTransactions(portfolioId);
    }

    @Get('/:id')
    getTransactionById(@Param('id') id: string) {
        return this.transactionService.getTransactionById(id);
    }

    @Post('/')
    createTransaction(@Body() data: CreateTransactionDto) {
        return this.transactionService.createTransaction(data);
    }
}
