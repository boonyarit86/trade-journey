import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NODE_PORT } from './constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  await app.listen(NODE_PORT, () => {
    console.log(`Server is running on port ${NODE_PORT}`);
  });
}

process.on('SIGINT', async () => {
  // await pool.end();
  console.log('Server is shutting down...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  // await pool.end();
  console.log('Server is shutting down...');
  process.exit(0);
});
bootstrap();
