import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectActiveStatusDto, UpdateProjectDto } from './dto/update-project.dto';

@Controller('project')
export class ProjectController {
    constructor(private readonly projectService: ProjectService) {}

    @Get()
    getAllProjects() {
        return this.projectService.getAllProjects();
    }

    @Get(":id")
    getProjectById(@Param('id') id: string) {
        return this.projectService.getProjectById(id);
    }

    @Post()
    createProject(@Body() data: CreateProjectDto) {
        return this.projectService.createProject(data);
    }

    
    @Put()
    updateProject(@Body() data: UpdateProjectDto) {
        return this.projectService.updateProject(data);
    }

    @Put("/activeStatus")
    updateProjectActiveStatus(@Body() data: UpdateProjectActiveStatusDto) {
        return this.projectService.updateProjectActiveStatus(data);
    }

    @Delete(':id')
    deleteProject(@Param('id') id: string) {
        return this.projectService.deleteProject(id);
    }
}
