import { ICategory, IMarketingRepresentation } from '@apollo/api/interfaces';
import { GaiaTraceClass } from '@apollo/tracer';
import { BadRequestException, HttpException, HttpStatus, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { DeleteResult, getManager, Repository } from 'typeorm';

import { StatusEnum } from '../../../commons/enums/meta-data.enum';
import { LayerDataUpsertPrepService } from '../../services/layer-data-upsert-prep.service';
import { LayerMetadataEntity } from '../model/layer-metadata.entity';

@Injectable()
@GaiaTraceClass
export class LayerMetadataRepositoryService {
  private layerMetadataEntityRepository: Repository<LayerMetadataEntity>;
  constructor(private layerUpsertPrepService: LayerDataUpsertPrepService, @Inject(REQUEST) private readonly request) {
    const finalHost = request.headers.requesturl || request.host;
    this.layerMetadataEntityRepository = getManager(finalHost).getRepository(LayerMetadataEntity);
  }

  public getAll(): Promise<LayerMetadataEntity[]> {
    return this.layerMetadataEntityRepository.find();
  }

  public async upsertLayerMetaData(request: { layer: ICategory; userId: string }): Promise<LayerMetadataEntity> {
    const entity = await this.layerUpsertPrepService.prepare(this.layerMetadataEntityRepository, request, new LayerMetadataEntity());

    return this.layerMetadataEntityRepository.save({
      ...entity,
      metadata: request.layer
    });
  }

  public async promoteLayers(request: { layerNames: string[]; userId: string }): Promise<LayerMetadataEntity[]> {
    const layerNames = request.layerNames.map((layerName) => layerName.replace(/ /g, ''));
    const errors: string[] = [];

    const entities = await this.getLayersByName(layerNames);
    const entitiesIds = entities.map((entity) => entity.name.toLowerCase());
    if (entities.length !== layerNames.length) {
      for (const layerName of layerNames) {
        if (!entitiesIds.includes(layerName.toLowerCase())) {
          errors.push(`Layer '${layerName}' does not exist.`);
        }
      }
      throw new NotFoundException({ errors });
    }

    for (const entity of entities) {
      if (entity.status !== StatusEnum.EXPERIMENTAL) {
        errors.push(
          entity.status === StatusEnum.FINAL
            ? `Layer '${entity.name}' has already been promoted to status ${StatusEnum.FINAL}.`
            : `Layer '${entity.name}' status is ${StatusEnum.PREDEFINE} and cannot be promoted.`
        );
      }
    }

    if (errors.length) {
      throw new BadRequestException({ errors });
    }

    entities.forEach((entity) => {
      entity.status = StatusEnum.FINAL;
      entity.last_modified_by = request.userId;
    });

    return this.layerMetadataEntityRepository.save(entities);
  }

  public getLayer(layerName: string): Promise<LayerMetadataEntity> {
    return this.layerUpsertPrepService.findEntity(this.layerMetadataEntityRepository, layerName);
  }

  public getLayersByName(layerNames: string[]): Promise<LayerMetadataEntity[]> {
    const layersLower = layerNames.map((layerName) => layerName.toLowerCase());
    return this.layerMetadataEntityRepository
      .createQueryBuilder()
      .where('lower(name) IN (:...layerNames)', { layerNames: layersLower })
      .getMany();
  }

  public async getMarketingLayers(showExperimentalLayers: boolean) {
    const layers = await this.getAll();
    return layers.reduce((acc: Array<IMarketingRepresentation>, layer: LayerMetadataEntity) => {
      if (layer.metadata.displayInMap && (showExperimentalLayers || layer.status !== StatusEnum.EXPERIMENTAL)) {
        acc.push(this.convertCategoryToMR(layer.metadata));
      }

      return acc;
    }, []);
  }

  public async deleteLayer(layerName: string) {
    const response: DeleteResult = await this.layerUpsertPrepService.deleteEntity(this.layerMetadataEntityRepository, layerName);
    if (!response.affected) {
      throw new HttpException(
        {
          errors: [`No layer with name ${layerName} and status ${StatusEnum.EXPERIMENTAL} found`]
        },
        HttpStatus.NOT_FOUND
      );
    }
  }

  private convertCategoryToMR(category: ICategory): IMarketingRepresentation {
    const tableName = category.mapLargeTable?.split('/')?.[1];
    const shape = category.attributes.filter((attribute) => attribute.name === 'Shape')?.[0]?.type;
    return {
      layerName: category.name,
      displayName: category.displayName,
      maplargeTable: tableName,
      shapeType: shape,
      primaryKey: category.primaryKeyCol,
      icon: category.entityIcon
    };
  }
}
