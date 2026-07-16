import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateStrategyChecklistDto {
    @IsString()
    @IsNotEmpty()
    strategyId: string;

    @IsString()
    @IsNotEmpty()
    checklistId: string;

    @IsBoolean()
    @IsOptional()
    isRequired?: boolean;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
