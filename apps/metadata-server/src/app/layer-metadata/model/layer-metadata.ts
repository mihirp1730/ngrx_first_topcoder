import { ICategory } from "@apollo/api/interfaces";

export class LayerMetadata {
    name: string;
    status: string;
    metadata: ICategory;
    version: number;
    createDateTime: Date;
    createdBy: string;
    lastChangedDateTime: Date;
    lastChangedBy: string;
}
