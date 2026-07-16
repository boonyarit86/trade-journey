import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateStrategyDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsInt()
    @IsOptional()
    riskRewardRatio?: number;

    @IsInt()
    @IsOptional()
    riskPerTrade?: number;

    @IsString()
    @IsOptional()
    description?: string;
}
