import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NODE_PORT } from './constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:5173', // your Vite dev server
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true, // only if you send cookies/auth headers
  });

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
