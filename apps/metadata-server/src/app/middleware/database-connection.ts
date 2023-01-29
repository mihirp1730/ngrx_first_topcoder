import { JwtTokenMiddleware } from '@apollo/server/jwt-token-middleware';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConnectionOptions, createConnection, getConnection } from 'typeorm';

import { decode } from 'jsonwebtoken';

import { BaseConfig } from '../config/base.config';
import { LayerMetadataEntity } from '../layer-metadata/model/layer-metadata.entity';
import { LayerSettingEntity } from '../layer-setting/model/layer-setting.entity';
import { SettingsService } from '../services/settings.service';

@Injectable()
export class DatabaseMiddleware implements NestMiddleware {
  constructor(private settingsService: SettingsService, private baseConfig: BaseConfig) {}

  async use(request: any, res: any, next: () => void) {
    const databaseName = request.headers.requesturl || request.host;
    const sAuthToken = JwtTokenMiddleware.getToken(request);
    const { payload }: any = decode(sAuthToken, { complete: true });

    const { username, schema, password } = this.settingsService.getDatabaseConfiguration(databaseName, payload.email);
    const { port, database } = await this.baseConfig.getTypeORMConfig();

    const connection: ConnectionOptions = {
      type: 'postgres',
      host: 'localhost',
      port,
      username,
      password,
      database,
      name: databaseName,
      schema,
      entities: [LayerSettingEntity, LayerMetadataEntity]
    };

    try {
      getConnection(connection.name);
    } catch (error) {
      await createConnection(connection);
    }

    next();
  }
}
