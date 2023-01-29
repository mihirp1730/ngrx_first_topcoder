import { GaiaTraceClass } from '@apollo/tracer';
import * as grpc from '@grpc/grpc-js';
import { loadSync, Options, PackageDefinition } from '@grpc/proto-loader';
import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { existsSync } from 'fs';
import { has } from 'lodash';

import {
  IGetPublicOpportunityResponse,
  IOpportunityDetails,
  IOpportunityRequest,
  IOpportunitySubscription,
  OpportunityStatus
} from '../../interfaces/interface';
import { ProtoGrpcType } from '../../proto/opportunity-resource';
import { OpportunityServiceClient } from './../../proto/com/slb/xchange/resource/OpportunityService';
import { BaseDataSource } from './base.data-source';

@GaiaTraceClass
export class GrpcDataSource extends BaseDataSource {
  public client: OpportunityServiceClient | null = null;
  private resource: ProtoGrpcType;

  constructor(
    public readonly grpcHost: string,
    public readonly grpcPort: string,
    public readonly protoPath: string,
    public readonly existsSyncFactory: () => typeof existsSync,
    public readonly loadSyncFactory: () => typeof loadSync,
    public readonly loadPackageDefinitionFactory: () => (packageDefition: PackageDefinition) => ProtoGrpcType | unknown,
    public readonly httpService: HttpService,
    public readonly grpcOptions?: Options
  ) {
    super();
  }

  public async init(): Promise<BaseDataSource> {
    const existsSyncRef = this.existsSyncFactory();
    const loadSyncRef = this.loadSyncFactory();
    const loadPackageDefinitionRef = this.loadPackageDefinitionFactory();
    // Require the configured proto file to exist, if it doesn't then error out:
    if (!existsSyncRef(this.protoPath)) {
      const missingProtoMessage = `The proto file was not found: ${this.protoPath}`;
      throw new Error(missingProtoMessage);
    }
    // Load the specified proto file:
    const packageDefinition = loadSyncRef(
      this.protoPath,
      this.grpcOptions || {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
      }
    );
    // If the loaded profile does not match our expectations, reject it:
    const resource = loadPackageDefinitionRef(packageDefinition) as ProtoGrpcType;
    if (!has(resource, 'com.slb.xchange.resource.OpportunityService')) {
      throw new Error(`The com.slb.xchange.resource.OpportunityService service does not exist...`);
    }
    const { OpportunityService } = resource.com.slb.xchange.resource;
    // With the proto file loaded, create a gRPC client:
    const address = `${this.grpcHost}:${this.grpcPort}`;
    this.client = new OpportunityService(address, grpc.credentials.createInsecure());
    return this;
  }

  public async getOpportunityDetails(
    authorization: string,
    userId: string,
    opportunityId: string,
    request: Request
  ): Promise<IOpportunityDetails> {
    const metadata = new grpc.Metadata();
    metadata.set('authorization', authorization);
    metadata.set('userId', userId);
    metadata.set('requestUrl', request.host);

    const res = await this.getPublicOpportunity(opportunityId, metadata);

    const opportunityRequest = await this.getOpportunityRequests(authorization, request);
    const subscriptions = await this.getOpportunitySubscriptions(authorization, request);

    return this.generateResponse(res, opportunityRequest, subscriptions);
  }

  public async getOpportunityRequests(token: string, req: Request): Promise<IOpportunityRequest[]> {
    try {
      const headers = { headers: { authorization: `Bearer ${token}` } };
      const url = `https://${req.host}/attendee/opportunity-subscription-requests`;
      const res = await this.httpService.get(url, headers).toPromise();
      return res?.data.items;
    } catch (err) {
      console.error('GRPC Data getOpportunityRequests failed: ', JSON.stringify(err));
      throw new HttpException('An error ocurred', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async getOpportunitySubscriptions(token: string, req: Request): Promise<IOpportunitySubscription[]> {
    try {
      const headers = { headers: { authorization: `Bearer ${token}` } };
      const url = `https://${req.host}/attendee/opportunity-subscriptions`;
      const subscriptions = await this.httpService.get(url, headers).toPromise();
      return subscriptions?.data.items;
    } catch (err) {
      console.error('GRPC Data getOpportunitySubscriptions failed: ', JSON.stringify(err));
      throw new HttpException('An error ocurred', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async getPublicOpportunity(opportunityId: string, metadata: grpc.Metadata): Promise<IGetPublicOpportunityResponse> {
    return new Promise((resolve, reject) => {
      if (!this.client) {
        return reject('The OpportunityServiceClient is not defined.');
      }
      const argument = { opportunity_id: opportunityId };
      this.client.getPublicOpportunity(argument, metadata, (error, response) => {
        if (error) {
          console.log('GRPC Data Error: ' + JSON.stringify(error));
          return reject(error);
        }
        if (response?.opportunity && response.opportunity.opportunity_status?.toUpperCase() === OpportunityStatus.Published) {
          console.log('GRPC Data Response: ' + JSON.stringify(response));
          resolve(<any>response.opportunity);
        } else {
          console.error('GRPC Data No opportunity were retrieved !' + JSON.stringify(response));
          reject(response);
        }
      });
    });
  }

  public generateResponse(
    res: IGetPublicOpportunityResponse,
    requests: IOpportunityRequest[],
    subscriptions: IOpportunitySubscription[]
  ): IOpportunityDetails {
    const profileMedia = res.opportunity_profile?.media?.map((item) => {
      return {
        fileId: item.file_id,
        fileName: item.file_name,
        fileType: item.fileType,
        caption: item.caption
      };
    });
    const profileDocuments = res.opportunity_profile?.documents?.map((item) => {
      return {
        fileId: item.file_id,
        fileName: item.file_name,
        fileType: item.fileType,
        caption: item.caption
      };
    });
    const confMedia = res.confidential_opportunity_profile?.media?.map((item) => {
      return {
        fileId: item.file_id,
        fileName: item.file_name,
        fileType: item.fileType,
        caption: item.caption
      };
    });
    const confDocuments = res.confidential_opportunity_profile?.documents?.map((item) => {
      return {
        fileId: item.file_id,
        fileName: item.file_name,
        fileType: item.fileType,
        caption: item.caption
      };
    });
    return {
      opportunityId: res.opportunity_id,
      opportunityName: res.opportunity_name,
      opportunityType: res.opportunity_type,
      dataVendorId: res.data_vendor_id,
      opportunityProfile: {
        overview: res.opportunity_profile?.overview || null,
        media: profileMedia || null,
        documents: profileDocuments || null
      },
      confidentialOpportunityProfile: {
        overview: res.confidential_opportunity_profile?.overview || null,
        media: confMedia || null,
        documents: confDocuments || null,
        hasAccess: res.confidential_opportunity_profile?.hasAccess
      },
      opportunityVDR: {
        opportunityVDRId: res.opportunity_VDR?.opportunity_VDR_id || null,
        accountName: res.opportunity_VDR?.account_name || null,
        departmentName: res.opportunity_VDR?.department_name || null,
        vdrLink: res.opportunity_VDR?.vdr_link || null,
        hasAccess: res.opportunity_VDR?.hasAccess || null
      },
      ccusAttributes: {
        certifier: res.ccus_attributes?.certifier,
        expectedSequestration: res.ccus_attributes?.expected_sequestration,
        costOfCarbonAbated: res.ccus_attributes?.cost_of_carbon_abated,
        lastValidatedOrVerified: res.ccus_attributes?.last_validated_or_verified
      },
      opportunityStatus: res.opportunity_status,
      countries: res.countries,
      assetType: res.asset_type,
      deliveryType: res.delivery_type,
      offerType: res.offer_type,
      contractType: res.contract_type,
      phase: res.phase,
      requests: requests,
      subscriptions: subscriptions
    };
  }
}
