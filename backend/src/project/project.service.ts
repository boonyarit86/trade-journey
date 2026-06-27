import { Injectable } from '@nestjs/common';
import { PgService } from 'src/database/pg.service';
import { IProject, IProjectRow } from './project.interface';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectActiveStatusDto, UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectService {
    constructor(private readonly pgService: PgService) {}

    async getAllProjects() {
        const pool = this.pgService.getPool();
        const result = await pool.query(
            'SELECT * from "trading_setup"."TD01_Project" ORDER BY "TD01_CreatedAt"'
        );
        const rows: IProjectRow[] = result.rows;
        const projects: IProject[] = rows.map((r) => ({
            id: r.TD01_Id,
            name: r.TD01_Name,
            isDefault: r.TD01_IsDefault,
            isActive: r.TD01_IsActive,
            createdBy: r.TD01_CreatedBy,
            createdAt: r.TD01_CreatedAt,
            modifiedBy: r.TD01_ModifiedBy,
            modifiedAt: r.TD01_ModifiedAt,
        }))
        return {
            total: result.rowCount,
            data: projects,
        };
    }

    async getProjectById(id: string) {
        const pool = this.pgService.getPool();
        const result = await pool.query(
            'SELECT * from "trading_setup"."TD01_Project" WHERE "TD01_Id" = $1',
            [id],
        );
        const rows: IProjectRow[] = result.rows;
        if (rows.length === 0) throw new Error("Not found any project");

        const projects: IProject[] = rows.map((r) => ({
            id: r.TD01_Id,
            name: r.TD01_Name,
            isDefault: r.TD01_IsDefault,
            isActive: r.TD01_IsActive,
            createdBy: r.TD01_CreatedBy,
            createdAt: r.TD01_CreatedAt,
            modifiedBy: r.TD01_ModifiedBy,
            modifiedAt: r.TD01_ModifiedAt,
        }))
        return {
            data: projects[0],
        };
    }

    async createProject(body: CreateProjectDto) {
        const pool = this.pgService.getPool();
        const authorName = "admin";

        const result = await pool.query(
            `INSERT INTO "trading_setup"."TD01_Project"
            ("TD01_Name", "TD01_CreatedBy", "TD01_ModifiedBy")
            VALUES ($1, $2, $3)
            RETURNING "TD01_Id"
            `
        , [body.name, authorName, authorName]);
        const rowInserted: IProjectRow = result?.rows?.[0] ?? null;

        return {
            data: {
                id: rowInserted?.TD01_Id,
            },
        };
    }

    async updateProject(body: UpdateProjectDto) {
        const pool = this.pgService.getPool();
        const client = await pool.connect();
        await client.query("BEGIN");

        try {
            const result = await client.query(
                `UPDATE "trading_setup"."TD01_Project"
                SET "TD01_Name" = $1,
                    "TD01_IsActive" = $2,
                    "TD01_IsDefault" = $3,
                    "TD01_ModifiedAt" = NOW()
                    WHERE "TD01_Id" = $4
                RETURNING "TD01_Id", "TD01_Name", "TD01_IsActive", "TD01_IsDefault", "TD01_ModifiedAt"`,
                [body.name, body.isActive, false, body.id]
            );

            await client.query("COMMIT");

            const rowUpdated: IProjectRow = result?.rows?.[0] ?? null;
            return {
                data: {
                    id: rowUpdated?.TD01_Id,
                    name: rowUpdated?.TD01_Name,
                    isActive: rowUpdated?.TD01_IsActive,
                    isDefault: rowUpdated?.TD01_IsDefault,
                    modifiedAt: rowUpdated?.TD01_ModifiedAt,
                }
            }
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    }

    async deleteProject(id: string) {
        const pool = this.pgService.getPool();
        await pool.query(
            `DELETE FROM "trading_setup"."TD01_Project"
                WHERE "TD01_Id" = $1`,
            [id]
        )
        return;
    }

    async updateProjectActiveStatus(body: UpdateProjectActiveStatusDto) {
        const pool = this.pgService.getPool();
        await pool.query(
            `UPDATE "trading_setup"."TD01_Project"
                SET "TD01_IsActive" = $1,
                    "TD01_ModifiedAt" = NOW()
                WHERE "TD01_Id" = $2
            `,
            [body.isActive, body.id],
        );
        return;
    }
}
