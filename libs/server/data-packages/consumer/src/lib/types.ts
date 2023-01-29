export type DataSourceTypes =
  | DataSourceHttpType
  | DataSourceInMemoryType

export interface DataSourceHttpType {
  type: 'http';
  apiUrl: string;
  apiPort: string;
}

export interface DataSourceInMemoryType {
  type: 'in-memory';
}
