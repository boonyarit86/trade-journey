import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';
import { CreatePortfolioDto } from './create-portfolio.dto';

export class UpdatePortfolioDto extends CreatePortfolioDto {
    @IsString()
    @IsNotEmpty()
    id: string;

    @IsBoolean()
    isActive: boolean;
}

export class UpdatePortfolioActiveStatusDto {
    @IsString()
    @IsNotEmpty()
    id: string;

    @IsBoolean()
    isActive: boolean;
}
