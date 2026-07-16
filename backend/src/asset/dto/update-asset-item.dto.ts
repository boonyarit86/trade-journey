import { IsBoolean, IsNotEmpty, IsString } from "class-validator";
import { CreateAssetItemDto } from "./create-asset-item.dto";

export class UpdateAssetItemDto extends CreateAssetItemDto {
    @IsString()
    @IsNotEmpty()
    id: string;
    @IsBoolean()
    isActive: boolean;
}

export class UpdateAssetItemActiveStatusDto {
    @IsString()
    @IsNotEmpty()
    id: string;
    @IsBoolean()
    isActive: boolean;
}
