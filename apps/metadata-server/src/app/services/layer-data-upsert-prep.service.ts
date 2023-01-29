import { ICategory } from '@apollo/api/interfaces';
import { GaiaTraceClass } from '@apollo/tracer';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { StatusEnum } from '../../commons/enums/meta-data.enum';
import { IGisLayerSettings } from '../../commons/interfaces/gis-settings';

export interface UpsertRequest {
  layer?: ICategory;
  setting?: IGisLayerSettings;
  userId: string;
}

export interface UpsertEntity {
  last_modified_by: string;
  name: string;
  created_by: string;
  status?: string;
}

@Injectable()
@GaiaTraceClass
export class LayerDataUpsertPrepService {
  public async prepare<Entity extends UpsertEntity>(
    repository: Repository<Entity>,
    request: UpsertRequest,
    upsertEntity: Entity
  ): Promise<Entity> {
    if (request.layer?.id !== request.layer?.name) {
      throw new HttpException({ errors: ['layer name and layer id should match'] }, HttpStatus.BAD_REQUEST);
    }

    const layerId = request.layer?.id || request.setting?.id;

    // custom query to ensure case insensitive behavior
    const entity = await this.findEntity(repository, layerId);
    if (entity) {
      if (!request.setting && entity.status !== StatusEnum.EXPERIMENTAL) {
        const errorMsg = `A layer with name "${layerId}" already exists with status ${StatusEnum.PREDEFINE} or ${StatusEnum.FINAL}`;
        throw new HttpException({ errors: [errorMsg.replace(/\\"/g, '"')] }, HttpStatus.BAD_REQUEST);
      }
      upsertEntity = entity;
      upsertEntity.last_modified_by = request.userId;
    } else {
      upsertEntity.name = layerId;
      upsertEntity.created_by = request.userId;
    }

    return upsertEntity;
  }

  public async findEntity<Entity extends UpsertEntity>(repository: Repository<Entity>, layerName: string) {
    return repository.createQueryBuilder().where('lower(name) = LOWER(:layerName)', { layerName }).getOne();
  }

  public deleteEntity<Entity extends UpsertEntity>(repository: Repository<Entity>, layerName: string) {
    const metaDataIdentifier = 'LayerMetadataEntity';
    const queryBuilder = repository.createQueryBuilder().where('lower(name) = LOWER(:layerName)', { layerName });

    if (repository.metadata.name === metaDataIdentifier) {
      queryBuilder.andWhere('lower(status) = LOWER(:status)', { status: StatusEnum.EXPERIMENTAL });
    }

    return queryBuilder.delete().execute();
  }
}
