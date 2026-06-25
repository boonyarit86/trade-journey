import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { connectPg } from './pg-connection';
import { Pool } from 'pg';

@Injectable()
export class PgService implements OnModuleInit, OnModuleDestroy {
    constructor() {}
    private pool: Pool;

    async onModuleInit() {
        this.pool = await connectPg();
    }

    async onModuleDestroy() {
        await this.pool.end();
    }

    getPool(): Pool {
        return this.pool;
    }
}