import { GaiaTraceClass } from '@apollo/tracer';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { getManager, Repository } from 'typeorm';

import { IGisLayerSettings } from '../../../commons/interfaces/gis-settings';
import { LayerMetadataEntity } from '../../layer-metadata/model/layer-metadata.entity';
import { LayerMetadataRepositoryService } from '../../layer-metadata/repository/layer-metadata-repository.service';
import { LayerDataUpsertPrepService } from '../../services/layer-data-upsert-prep.service';
import { LayerSettingEntity } from '../model/layer-setting.entity';

@Injectable()
@GaiaTraceClass
export class LayerSettingRepositoryService {
  private layerSettingEntityRepository: Repository<LayerSettingEntity>;
  constructor(
    private readonly layerUpsertPrepService: LayerDataUpsertPrepService,
    private readonly layerMetadataRepositoryService: LayerMetadataRepositoryService,
    @Inject(REQUEST) private readonly request
  ) {
    const finalHost = request.headers.requesturl || request.host;
    this.layerSettingEntityRepository = getManager(finalHost).getRepository(LayerSettingEntity);
  }

  public getAll(): Promise<LayerSettingEntity[]> {
    return this.layerSettingEntityRepository
      .createQueryBuilder('setting')
      .leftJoinAndSelect(LayerMetadataEntity, 'metadata', 'metadata.name = setting.fkey')
      .select(['setting.*', 'metadata.status AS status'])
      .where('setting.fkey IS NOT NULL')
      .getRawMany();
  }

  public async upsertLayerSetting(request: { setting: IGisLayerSettings; userId: string }): Promise<LayerSettingEntity> {
    const entity = await this.layerUpsertPrepService.prepare(this.layerSettingEntityRepository, request, new LayerSettingEntity());

    // Confirm value to be used to retrieve the metaData associated.
    entity.fkey = await this.layerMetadataRepositoryService.getLayer(request.setting.id);

    if (!entity.fkey) {
      throw new HttpException(
        { errors: [`Please validate that the id ${request.setting.id} matches the metadata layer name to be associated with`] },
        HttpStatus.BAD_REQUEST
      );
    }

    return this.layerSettingEntityRepository.save({
      ...entity,
      setting: request.setting
    });
  }
}
