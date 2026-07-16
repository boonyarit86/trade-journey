import { IsNotEmpty, IsString } from "class-validator";

export class CreateAssetItemDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    assetTypeId: string;
}
