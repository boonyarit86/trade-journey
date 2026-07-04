import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { AssetService } from './asset.service';
import { CreateAssetTypeDto } from './dto/create-asset.dto';
import { UpdateAssetTypeActiveStatusDto, UpdateAssetTypeDto } from './dto/update-asset.dto';

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
    createAssetType(@Body() data: CreateAssetTypeDto) {
        return this.assetService.createAssetType(data);
    }

    @Put("/type")
    updateAssetTypeById(@Body() data: UpdateAssetTypeDto) {
        return this.assetService.updateAssetTypeById(data);
    }

    @Put("/type/activeStatus")
    updateAssetTypeActiveStatusById(@Body() data: UpdateAssetTypeActiveStatusDto) {
        return this.assetService.updateAssetTypeActiveStatusById(data);
    }

    @Delete('/type/:id')
    deleteAssetTypeById(@Param('id') id: string) {
        return this.assetService.deleteAssetTypeById(id);
    }
}
