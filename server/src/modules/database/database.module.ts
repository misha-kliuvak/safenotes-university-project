import { Global, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';

import { ConfigService } from '@/config';
import { databaseEntities } from '@/modules/database/database.entities';
import { repositoryProviders } from '@/modules/database/database.provider';
import { TxService } from '@/modules/database/tx.service';
import { Logger } from '@/modules/logger/logger';

@Global()
@Module({
  imports: [
    SequelizeModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const logger = new Logger(DatabaseModule.name);
        const { host, port, username, database, password, logs } =
          configService.getDatabaseConfig();

        return {
          dialect: 'postgres',
          host,
          port,
          username,
          password,
          database,
          models: databaseEntities,
          logging: (query: string, options?: any) => {
            if (logs) {
              logger.log(query);
            }
          },
          synchronize: true,
          migrationStorageTableName: 'sequelize_meta',
          migrationStorageTableSchema: 'sequelize_schema',
          seederStorageTableName: 'sequelize_data',
          dialectOptions: {
            ssl: {
              require: true,
              rejectUnauthorized: false,
            },
          },
        };
      },
    }),
  ],
  providers: [...repositoryProviders, TxService],
  exports: [...repositoryProviders, TxService],
})
export class DatabaseModule {
  private readonly logger = new Logger(DatabaseModule.name);

  constructor(private sequelize: Sequelize) {}

  async onModuleInit() {
    try {
      await this.sequelize.authenticate();
      this.logger.log('Database connection has been established successfully.');
    } catch (error) {
      this.logger.error(`Unable to connect to the database:`, error);
    }
  }
}
