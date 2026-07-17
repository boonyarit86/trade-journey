import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export const ALLOWED_TRANSACTION_RESULTS = ['W', 'L', 'B'] as const;

export class CreateTransactionDto {
    @IsString()
    @IsNotEmpty()
    portfolioId: string;

    @IsInt()
    @Min(0)
    amount: number;

    @IsInt()
    @Min(0)
    @IsOptional()
    fees?: number;

    @IsString()
    @IsNotEmpty()
    @IsIn(ALLOWED_TRANSACTION_RESULTS)
    resultValue: string;
}
