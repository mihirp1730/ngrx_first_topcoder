import { ISubscription } from '@apollo/app/services/consumer-subscription';
import { GaiaTraceClass } from '@apollo/tracer';
import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
@GaiaTraceClass
export class SubscriptionService {
  static CONSUMER_SUBSCRIPTION_SERVICE_TOKEN = 'CONSUMER_SUBSCRIPTION_SERVICE_TOKEN';

  constructor(
    public readonly httpService: HttpService,
    @Inject(SubscriptionService.CONSUMER_SUBSCRIPTION_SERVICE_TOKEN) public readonly consumerSubscriptionUrl: string
  ) {}

  /**
   * Method to get the details of a subscription with an ID given
   * @param {string} authToken JWT token
   * @param {string} dataSubscriptionId The ID of the subscription to retrieve
   * @returns {ISubscription} Response of the API call with the subscription details
   */
  public async getSubscriptionById(accessToken: string, dataSubscriptionId: string): Promise<ISubscription> {
    const headersConfig = {
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    };
    const subscriptionUrl = `${this.consumerSubscriptionUrl}/consumer/data-subscriptions/${dataSubscriptionId}`;
    const response = await this.httpService.get(subscriptionUrl, headersConfig).toPromise();
    return response?.data;
  }

  /**
   * Method to get the details of a subscription with an ID given
   * @param {string} authToken JWT token
   * @param {string} dataSubscriptionId The ID of the subscription to retrieve
   * @returns {boolean} return if subscription is expired or not
   */
  public async isSubscriptionExpired(accessToken: string, dataSubscriptionId: string): Promise<boolean> {
    let isExpired = false;
    const subscriptionDetail = await this.getSubscriptionById(accessToken, dataSubscriptionId);
    if (subscriptionDetail.dataSubscriptionStatus === 'EXPIRED') {
      isExpired = true;
    }
    return isExpired;
  }
}
