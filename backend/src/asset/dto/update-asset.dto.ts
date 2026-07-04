import { IsBoolean, IsNotEmpty, IsString } from "class-validator";
import { CreateAssetTypeDto } from "./create-asset.dto";

export class UpdateAssetTypeDto extends CreateAssetTypeDto {
    @IsString()
    @IsNotEmpty()
    id: string;
    @IsBoolean()
    isActive: boolean;
}

export class UpdateAssetTypeActiveStatusDto {
    @IsString()
    @IsNotEmpty()
    id: string;
    @IsBoolean()
    isActive: boolean;
}