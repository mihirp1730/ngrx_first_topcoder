import { HttpException, HttpStatus } from '@nestjs/common';
import {
  IOpportunityHostRequestConfig,
  IOpportunityRequest,
  IOpportunityRequestHeader,
  IOpportunityRequests,
  IOpportunitySubscription
} from '../interfaces/interface';

import { GaiaAdviseClass } from '@apollo/server/aspect-logger';
import { GaiaTraceClass } from '@apollo/tracer';
import { HttpService } from '@nestjs/axios';
import { BaseDataSource } from './base.data-source';

@GaiaAdviseClass()
@GaiaTraceClass
export class HttpBaseDataSource extends BaseDataSource {
  constructor(public readonly config: IOpportunityHostRequestConfig, public readonly httpService: HttpService) {
    super();
  }

  public async init(): Promise<BaseDataSource> {
    return this;
  }

  public async getOpportunityRequestDetails(token: string, vendorid: string, host: string): Promise<IOpportunityRequests> {
    const res = await this.getOpportunityRequests(token, vendorid, host);
    const opportunitySubscription = await this.getOpportunitySubscription(token, vendorid, host);

    return { response: this.generateResponse(res.requestData, opportunitySubscription), header: res.correlationId };
  }

  public async getOpportunityRequests(token: string, vendorid: string, host: string): Promise<IOpportunityRequestHeader> {
    try {
      const headers = { headers: { authorization: `Bearer ${token}`, vendorid } };
      const url = `https://${host}/host/opportunity-subscription-request`;
      const res = await this.httpService.get(url, headers).toPromise();
      return { requestData: res?.data.items, correlationId: res.headers['correlation-id'] };
    } catch (err) {
      throw new HttpException('An error ocurred', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async getOpportunitySubscription(token: string, vendorid: string, host: string): Promise<IOpportunitySubscription[]> {
    try {
      const headers = { headers: { authorization: `Bearer ${token}`, vendorid } };
      const url = `https://${host}/host/opportunity-subscriptions`;
      const res = await this.httpService.get(url, headers).toPromise();
      return res?.data.items;
    } catch (err) {
      throw new HttpException('An error ocurred', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  filterSubscription(request: IOpportunityRequest, subscriptions: IOpportunitySubscription[]): IOpportunitySubscription[] {
    return subscriptions.filter(
      (subscription) =>
        request.subscriptionRequestId === subscription.subscriptionRequestId ||
        (request.opportunityId === subscription.opportunityId && request.requestedBy === subscription.attendeeId)
    );
  }

  generateResponse(requests: IOpportunityRequest[], subscriptions: IOpportunitySubscription[]): IOpportunityRequest[] {
    return requests?.map((request) => {
      const accessesDeatils = [];
      const filteredSubscription = this.filterSubscription(request, subscriptions);
      request.opportunitySubscriptionId = filteredSubscription?.[0]?.opportunitySubscriptionId ?? '';
      request.accessLevels.forEach((access) => {
        filteredSubscription?.[0]?.accessDetails.filter((accessDetail) => {
          if (accessDetail.accessLevel === access) {
            accessesDeatils.push(accessDetail);
          }
        });
      });
      request.accessDetails = accessesDeatils;
      return request;
    });
  }
}
