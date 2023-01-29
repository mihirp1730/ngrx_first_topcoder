import { AppHealthService } from '@apollo/app/health';
import { ServerFeatureFlagModule } from '@apollo/server/feature-flag';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigModule } from '../config/config.module';
import { LayerDataUpsertPrepService } from '../services/layer-data-upsert-prep.service';
import { MetadataController } from './controllers/metadata.controller';
import { LayerMetadataEntity } from './model/layer-metadata.entity';
import { LayerMetadataRepositoryService } from './repository/layer-metadata-repository.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([LayerMetadataEntity]),
    ServerFeatureFlagModule.forRoot({
      splitioNodejsKey: process.env.SPLITIO_NODEJS_KEY || 'localhost'
    }),
    ConfigModule
  ],
  controllers: [MetadataController],
  providers: [LayerMetadataRepositoryService, LayerDataUpsertPrepService, AppHealthService],
  exports: [LayerMetadataRepositoryService]
})
export class MetadataLayerModule {}
