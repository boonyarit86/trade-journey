import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePortfolioDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    projectId: string;

    @IsString()
    @IsNotEmpty()
    assetId: string;

    @IsString()
    @IsOptional()
    strategyId?: string;

    @IsInt()
    @IsNotEmpty()
    initBalance: number;

    @IsString()
    @IsOptional()
    description?: string;
}
