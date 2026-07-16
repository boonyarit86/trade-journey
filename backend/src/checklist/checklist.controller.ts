import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ChecklistService } from './checklist.service';
import { CreateChecklistDto } from './dto/create-checklist.dto';
import { UpdateChecklistDto, UpdateChecklistActiveStatusDto } from './dto/update-checklist.dto';

@Controller('checklist')
export class ChecklistController {
    constructor(private readonly checklistService: ChecklistService) {}

    @Get("/")
    getAllChecklists() {
        return this.checklistService.getAllChecklists();
    }

    @Get("/:id")
    getChecklistById(@Param('id') id: string) {
        return this.checklistService.getChecklistById(id);
    }

    @Post("/")
    createChecklist(@Body() data: CreateChecklistDto) {
        return this.checklistService.createChecklist(data);
    }

    @Put("/")
    updateChecklistById(@Body() data: UpdateChecklistDto) {
        return this.checklistService.updateChecklistById(data);
    }

    @Put("/activeStatus")
    updateChecklistActiveStatusById(@Body() data: UpdateChecklistActiveStatusDto) {
        return this.checklistService.updateChecklistActiveStatusById(data);
    }

    @Delete('/:id')
    deleteChecklistById(@Param('id') id: string) {
        return this.checklistService.deleteChecklistById(id);
    }
}
