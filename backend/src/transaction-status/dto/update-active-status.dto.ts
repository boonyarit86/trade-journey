import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class UpdateTransactionStatusActiveStatusDto {
    @IsString()
    @IsNotEmpty()
    id: string;

    @IsBoolean()
    isActive: boolean;
}
