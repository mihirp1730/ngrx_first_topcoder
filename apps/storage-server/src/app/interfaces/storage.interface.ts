export interface IStorageService {
    saveItems({ items, dataPartition }: { items: {[key: string]: string}; dataPartition: string; }): Promise<any>;
    
    getItems(keys: Array<string>, dataPartition: string): Promise<{[key: string]: string}>;
    
    upsertItem(key: string, value: string, subId: string, dataPartition: string): Promise<void>;
    
    getSubId(): string;
}