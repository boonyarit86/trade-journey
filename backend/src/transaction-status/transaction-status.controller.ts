import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { TransactionStatusService } from './transaction-status.service';
import { CreateTransactionStatusDto } from './dto/create-transaction-status.dto';
import { UpdateTransactionStatusDto } from './dto/update-transaction-status.dto';
import { UpdateTransactionStatusActiveStatusDto } from './dto/update-active-status.dto';

@Controller('transaction-status')
export class TransactionStatusController {
    constructor(private readonly transactionStatusService: TransactionStatusService) {}

    @Get()
    getAllTransactionStatuses() {
        return this.transactionStatusService.getAllTransactionStatuses();
    }

    @Get(':id')
    getTransactionStatusById(@Param('id') id: string) {
        return this.transactionStatusService.getTransactionStatusById(id);
    }

    @Post()
    createTransactionStatus(@Body() data: CreateTransactionStatusDto) {
        return this.transactionStatusService.createTransactionStatus(data);
    }

    @Put()
    updateTransactionStatusById(@Body() data: UpdateTransactionStatusDto) {
        return this.transactionStatusService.updateTransactionStatusById(data);
    }

    @Put('activeStatus')
    updateTransactionStatusActiveStatusById(@Body() data: UpdateTransactionStatusActiveStatusDto) {
        return this.transactionStatusService.updateTransactionStatusActiveStatusById(data);
    }
}
