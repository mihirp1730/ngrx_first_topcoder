import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';

import { IGisLayerSettings } from '../../../commons/interfaces/gis-settings';
import { LayerMetadataEntity } from '../../layer-metadata/model/layer-metadata.entity';

@Entity({ name: 'ms_layer_setting' })
export class LayerSettingEntity {
  @PrimaryColumn({ type: 'varchar', length: 100 })
  name: string;

  @OneToOne(() => LayerMetadataEntity, layerEntity => layerEntity.name)
  @JoinColumn({ name: 'fkeyname' })
  fkey: LayerMetadataEntity;

  @Column({ type: 'jsonb' })
  setting: IGisLayerSettings;

  @Column({ type: 'varchar', length: 256 })
  created_by: string;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_date: Date;

  @Column({ type: 'varchar', length: 256 })
  last_modified_by: string;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  last_modified_date: Date;
}
