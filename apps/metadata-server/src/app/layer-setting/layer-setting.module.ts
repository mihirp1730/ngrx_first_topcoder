import { ServerFeatureFlagModule } from '@apollo/server/feature-flag';
import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BaseConfig } from '../config/base.config';
import { ConfigModule } from '../config/config.module';
import { MetadataLayerModule } from '../layer-metadata/layer-metadata.module';
import { LayerDataUpsertPrepService } from '../services/layer-data-upsert-prep.service';
import { SettingsService } from '../services/settings.service';
import { SettingsController } from './controllers/settings.controller';
import { LayerSettingEntity } from './model/layer-setting.entity';
import { LayerSettingRepositoryService } from './repository/layer-setting-repository.service';

@Module({
  imports: [
    ConfigModule,
    MetadataLayerModule,
    TypeOrmModule.forFeature([LayerSettingEntity]),
    ServerFeatureFlagModule.forRoot({
      splitioNodejsKey: process.env.SPLITIO_NODEJS_KEY || 'localhost'
    })
  ],
  controllers: [SettingsController],
  providers: [
    {
      provide: SettingsService,
      inject: [BaseConfig],
      useFactory: SettingsServiceFactory
    },
    LayerSettingRepositoryService,
    LayerDataUpsertPrepService,
    Logger
  ],
  exports: [LayerSettingRepositoryService, SettingsService]
})
export class LayerSettingModule {}

export async function SettingsServiceFactory(baseConfig: BaseConfig): Promise<SettingsService> {
  const config = await baseConfig.getEnvironment();
  const settingsService = new SettingsService(config, baseConfig);
  return settingsService;
}
