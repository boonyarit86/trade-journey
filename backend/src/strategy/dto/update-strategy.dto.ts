import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';
import { CreateStrategyDto } from './create-strategy.dto';

export class UpdateStrategyDto extends CreateStrategyDto {
    @IsString()
    @IsNotEmpty()
    id: string;

    @IsBoolean()
    isActive: boolean;
}

export class UpdateStrategyActiveStatusDto {
    @IsString()
    @IsNotEmpty()
    id: string;

    @IsBoolean()
    isActive: boolean;
}
