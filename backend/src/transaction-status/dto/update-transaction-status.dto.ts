import { IsBoolean, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateTransactionStatusDto {
    @IsString()
    @IsNotEmpty()
    id: string;

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

    @IsBoolean()
    isActive: boolean;
}
