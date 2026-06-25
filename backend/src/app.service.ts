import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigServiceType } from './types/app-config.type';
import { NODE_ENV, NODE_PORT } from './constants';

@Injectable()
export class AppService {
  constructor(
    private configService: ConfigService<ConfigServiceType>,
  ) {}
  async getConfig() {
    const dbConfig = this.configService.get('database');

    return {
      app: {
        environment: NODE_ENV,
        port: NODE_PORT,
      },
      database: {
        db: dbConfig.database,
      }
    }

  }

  getHello(): string {
    return 'Hello World!';
  }
}
