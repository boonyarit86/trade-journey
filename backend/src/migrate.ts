import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function migrate() {
    const app = await NestFactory.createApplicationContext(AppModule, {
        logger: ['error', 'warn', 'log'],
    });

    await app.close();
}

migrate().catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
});
