import { IsBoolean, IsNotEmpty, IsString } from "class-validator";
import { CreateProjectDto } from "./create-project.dto";

export class UpdateProjectDto extends CreateProjectDto {
    @IsString()
    @IsNotEmpty()
    id: string;
    @IsBoolean()
    isActive: boolean;
}

export class UpdateProjectActiveStatusDto {
    @IsString()
    @IsNotEmpty()
    id: string;
    @IsBoolean()
    isActive: boolean;
}