import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AssetService } from './asset.service';
import { CreateAssetTypeDto } from './dto/create-asset.dto';

@Controller('asset')
export class AssetController {
    constructor(private readonly assetService: AssetService) {}

    @Get("/type")
    getAllAssetType() {
        return this.assetService.getAllAssetTypes();
    }

    @Get("/type/:id")
    getProjectById(@Param('id') id: string) {
        return this.assetService.getAssetTypeById(id);
    }

    @Post("/type")
    createProject(@Body() data: CreateAssetTypeDto) {
        return this.assetService.createAssetType(data);
    }
}
