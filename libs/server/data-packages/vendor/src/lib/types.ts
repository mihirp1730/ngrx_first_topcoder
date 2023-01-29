import { Options } from '@grpc/proto-loader/build/src/util';

export type DataSourceTypes =
  | DataSourceInMemoryType
  | DataSourceGrpcType

export interface DataSourceInMemoryType {
  type: 'in-memory';
  count: number;
}

export interface DataSourceGrpcType {
  type: 'grpc';
  grpcHost: string;
  grpcPort: string;
  protoPath: string;
  grpcOptions?: Options;
}
