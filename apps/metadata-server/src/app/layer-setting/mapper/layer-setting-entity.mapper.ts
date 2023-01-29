import { GaiaTraceClass } from '@apollo/tracer';

import { LayerSetting } from '../model/layer-setting';
import { LayerSettingEntity } from "../model/layer-setting.entity";

@GaiaTraceClass
export class LayerSettingEntityMapper {

    public static fromEntity(entity: LayerSettingEntity): LayerSetting {
        return this.from(entity);
    }
    
    public static fromEntityList(entityList: LayerSettingEntity[]): LayerSetting[] {
        return entityList.map(entity => this.from(entity));
    }
    
    private static from(entity: LayerSettingEntity): LayerSetting {
        const layerSetting = new LayerSetting();
        layerSetting.name = entity.name;
        layerSetting.setting = entity.setting;
        layerSetting.createdBy = entity.created_by;
        layerSetting.createDateTime = entity.created_date;
        layerSetting.lastChangedBy = entity.last_modified_by;
        layerSetting.lastChangedDateTime = entity.last_modified_date;
        layerSetting.status = entity['status'];
        return layerSetting;
    }

    public static toEntity(layerSetting: LayerSetting): LayerSettingEntity {
        const entity = new LayerSettingEntity();
        entity.name = layerSetting.name;
        entity.setting = layerSetting.setting;
        entity.created_by = layerSetting.createdBy;
        entity.created_date = layerSetting.createDateTime;
        entity.last_modified_by = layerSetting.lastChangedBy;
        entity.last_modified_date = layerSetting.lastChangedDateTime;
        return entity;
    }

}