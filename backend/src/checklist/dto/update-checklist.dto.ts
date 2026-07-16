import { IsBoolean, IsNotEmpty, IsString } from "class-validator";
import { CreateChecklistDto } from "./create-checklist.dto";

export class UpdateChecklistDto extends CreateChecklistDto {
    @IsString()
    @IsNotEmpty()
    id: string;
    @IsBoolean()
    isRequired: boolean;
    @IsBoolean()
    isActive: boolean;
}

export class UpdateChecklistActiveStatusDto {
    @IsString()
    @IsNotEmpty()
    id: string;
    @IsBoolean()
    isActive: boolean;
}
