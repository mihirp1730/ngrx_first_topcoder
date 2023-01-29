import { StatusEnum } from "../../../commons/enums/meta-data.enum";
import { Entity, PrimaryColumn, Column, UpdateDateColumn, CreateDateColumn, VersionColumn } from 'typeorm';
import { ICategory } from "@apollo/api/interfaces";

@Entity({ name: 'ms_layer_metadata' })
export class LayerMetadataEntity {
    @PrimaryColumn({ type: 'varchar', length: 100, nullable: false })
    name: string;

    @Column({
        type: 'enum',
        enum: StatusEnum,
        default: StatusEnum.EXPERIMENTAL
    })
    status: string;

    @Column({ type: 'jsonb', nullable: false })
    metadata: ICategory;

    @VersionColumn({ type: 'int', nullable: true })
    version: number

    @Column({ type: 'varchar', length: 256 })
    created_by: string;

    @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_date: Date;
    
    @Column({ type: 'varchar', length: 256 })
    last_modified_by: string;

    @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    last_modified_date: Date;
}
