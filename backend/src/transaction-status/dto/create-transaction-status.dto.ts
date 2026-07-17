import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateTransactionStatusDto {
    @IsString()
    @IsNotEmpty()
    text: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(3)
    value: string;

    @IsString()
    @IsNotEmpty()
    colorCode: string;
}
