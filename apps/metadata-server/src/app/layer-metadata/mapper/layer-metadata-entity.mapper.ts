import { GaiaTraceClass } from '@apollo/tracer';

import { LayerMetadata } from '../model/layer-metadata';
import { LayerMetadataEntity } from '../model/layer-metadata.entity';

@GaiaTraceClass
export class LayerMetadataEntityMapper {

  public static fromEntity(entity: LayerMetadataEntity): LayerMetadata {
    return this.from(entity);
  }

  public static fromEntityList(entityList: LayerMetadataEntity[]): LayerMetadata[] {
    return entityList.map(entity => this.from(entity));
  }

  private static from(entity: LayerMetadataEntity): LayerMetadata {
    const layerMetadata = new LayerMetadata();
    layerMetadata.name = entity.name;
    layerMetadata.status = entity.status;
    layerMetadata.metadata = entity.metadata;
    layerMetadata.version = entity.version;
    layerMetadata.createdBy = entity.created_by;
    layerMetadata.createDateTime = entity.created_date;
    layerMetadata.lastChangedBy = entity.last_modified_by;
    layerMetadata.lastChangedDateTime = entity.last_modified_date;
    return layerMetadata;
  }

  public static toEntity(layerMetadata: LayerMetadata): LayerMetadataEntity {
    const entity = new LayerMetadataEntity();
    entity.name = layerMetadata.name;
    entity.status = layerMetadata.status;
    entity.metadata = layerMetadata.metadata;
    entity.version = layerMetadata.version;
    entity.created_by = layerMetadata.createdBy;
    entity.created_date = layerMetadata.createDateTime;
    entity.last_modified_by = layerMetadata.lastChangedBy;
    entity.last_modified_date = layerMetadata.lastChangedDateTime;
    return entity;
  }
}
