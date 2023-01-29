import { FilterRequest, IDataPackageDetails, IDataPackageProfile, IMedia, PackageStatuses, ResultsResponseResult } from '@apollo/api/data-packages/vendor';
import { GaiaTraceClass } from '@apollo/tracer';
import * as grpc from '@grpc/grpc-js';
import { loadSync, Options, PackageDefinition } from '@grpc/proto-loader';
import { existsSync } from 'fs';
import { has, uniqBy } from 'lodash';

/*
 * If encountering a `Cannot find module` error, please refer to the `../../proto/README.md` file.
 */
import { DataPackageServiceClient } from '../../proto/com/slb/xchange/resource/DataPackageService';
import { ProtoGrpcType } from '../../proto/data-package-resource';
import { BaseDataSource } from './base.data-source';

@GaiaTraceClass
export class GrpcDataSource extends BaseDataSource {
  public client: DataPackageServiceClient | null = null;

  constructor(
    public readonly grpcHost: string,
    public readonly grpcPort: string,
    public readonly protoPath: string,
    public readonly existsSyncFactory: () => typeof existsSync,
    public readonly loadSyncFactory: () => typeof loadSync,
    public readonly loadPackageDefinitionFactory: () => (packageDefition: PackageDefinition) => ProtoGrpcType | unknown,
    public readonly grpcOptions?: Options,
  ) {
    super();
  }

  public async init(): Promise<BaseDataSource> {
    const existsSyncRef = this.existsSyncFactory();
    const loadSyncRef = this.loadSyncFactory();
    const loadPackageDefinitionRef = this.loadPackageDefinitionFactory();
    // Require the configured proto file to exist, if it doesn't then error out:
    if (!existsSyncRef(this.protoPath)) {
      const missingProtoMessage = `The proto file was not found: ${this.protoPath}
        Please confirm that the libs/server/data-packages/vendor/README.md instructions were followed:
        -> "Running with a gRPC data source"`;
      throw new Error(missingProtoMessage);
    }
    // Load the specified proto file:
    const packageDefinition = loadSyncRef(this.protoPath, this.grpcOptions || {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true
    });
    // If the loaded profile does not match our expectations, reject it:
    const resource = loadPackageDefinitionRef(packageDefinition) as ProtoGrpcType;
    if (!has(resource, 'com.slb.xchange.resource.DataPackageService')) {
      throw new Error(`The com.slb.xchange.resource.DataPackageService service does not exist...`);
    }
    const { DataPackageService } = resource.com.slb.xchange.resource;
    // With the proto file loaded, create a gRPC client:
    const address = `${this.grpcHost}:${this.grpcPort}`;
    this.client = new DataPackageService(address, grpc.credentials.createInsecure());
    return this;
  }

  public async queryPackages(
    userId: string,
    billingAccountId: string,
    authorization: string,
    filter: FilterRequest
  ): Promise<ResultsResponseResult[]> {
    const metadata = new grpc.Metadata;
    metadata.set('billingAccountId', billingAccountId);
    metadata.set('userId', userId);
    metadata.set('authorization', authorization);

    const dataPackagesList = await this.getAllPackages(filter, metadata);

    const promises = dataPackagesList.map((dataPackage) => {
      return Promise.all([
        this.getPackageProfile(dataPackage.dataPackageId, metadata),
        this.getDatatypes(dataPackage.dataPackageId, metadata)
        // We can add more call here like getting subscrition details
      ]).then(([dataPackageProfile, dataTypeList]) => {
        const regions = dataPackageProfile.regions;
        const media = dataPackageProfile?.media?.find((item: IMedia) => item.profileImage);
        return {
          id: dataPackage.dataPackageId,
          image: media || null,
          name: dataPackage.name,
          status: dataPackage.status as PackageStatuses,
          dataType: dataTypeList,
          region: regions,
          createdBy: dataPackage.createdBy,
          createdOn: dataPackage.createdDate,
          lastUpdatedBy: dataPackage.lastModifiedBy,
          lastUpdatedOn: dataPackage.lastModifiedDate,
          subscriptionsActive: 0,
          subscriptionsPending: 0
        };
      });
    });

    return Promise.all(promises).then((results) => {
      return results;
    })
    .catch(() => {
      throw new Error('No dataPackages were retrieved.');
    })
  }

  public async getAllPackages(filter: FilterRequest, metadata: grpc.Metadata): Promise<IDataPackageDetails[]> {
    return new Promise((resolve, reject) => {
      if (!this.client) {
        return reject('The DataPackageServiceClient is not defined.');
      }
      this.client.getDataPackages({ filterQuery: JSON.stringify(filter) }, metadata, (error, response) => {
        if (error) {
          return reject(error);
        }
        if (response?.dataPackages) {
          resolve(response.dataPackages);
        } else {
          console.error('No dataPackages were retrieved !');
          reject(response);
        }
      });
    });
  }

  public async getPackageProfile(dataPackageId: string, metadata: grpc.Metadata): Promise<IDataPackageProfile> {
    const argument = { dataPackageId };
    metadata.set('dataPackageId', dataPackageId);
    return new Promise((resolve, reject) => {
      if (!this.client) {
        return reject('The DataPackageServiceClient is not defined.');
      }
      this.client.getDataPackage(argument, metadata, (error, response) => {
        if (error) {
          return reject(error);
        }
        if (response?.dataPackage?.dataPackageProfile) {
          const regions = response.dataPackage.dataPackageProfile.regions;
          response.dataPackage.dataPackageProfile.regions = (regions?.length > 0) ? regions : [];
          resolve(response.dataPackage.dataPackageProfile);
        } else {
          // Will replace the log with logger of @slb-delfi-exploration/dd-infrastructure
          console.error('No dataPackage details were retrieved !');
          const packageProfile = { regions: [] };
          resolve(packageProfile as any);
        }
      });
    });
  }

  public async getDatatypes(dataPackageId: string, metadata: grpc.Metadata): Promise<string[]> {
    const argument = { dataPackageId };
    metadata.set('dataPackageId', dataPackageId);
    return new Promise((resolve, reject) => {
      if (!this.client) {
        return reject('The DataPackageServiceClient is not defined.');
      }
      this.client.getMarketingRepresentations(argument, metadata, (error, response) => {
        if (error) {
          return reject(error);
        }
        if (response?.marketingRepresentations) {
          let dataTypeList = uniqBy(response?.marketingRepresentations, 'dataType').map(item => item.dataType);
          dataTypeList = (dataTypeList.length > 0) ? dataTypeList : [];
          resolve(dataTypeList);
        } else {
          // Will replace the log with logger of @slb-delfi-exploration/dd-infrastructure
          console.error('No datatype were retrieved !');
          resolve([] as any);
        }
      });
    });
  }
}
