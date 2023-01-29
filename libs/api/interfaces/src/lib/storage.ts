export interface IStorageRequest {
    includePartition: boolean;
    items: {[key: string]: string};
}
