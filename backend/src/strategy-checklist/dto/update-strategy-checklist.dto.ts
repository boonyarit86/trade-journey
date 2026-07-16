import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class UpdateStrategyChecklistDto {
    @IsString()
    @IsNotEmpty()
    strategyId: string;

    @IsString()
    @IsNotEmpty()
    checklistId: string;

    @IsBoolean()
    isActive: boolean;

    @IsBoolean()
    isRequired: boolean;
}

export class UpdateStrategyChecklistActiveStatusDto {
    @IsString()
    @IsNotEmpty()
    strategyId: string;

    @IsString()
    @IsNotEmpty()
    checklistId: string;

    @IsBoolean()
    isActive: boolean;
}
