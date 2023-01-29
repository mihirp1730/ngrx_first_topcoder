import { Injectable } from '@angular/core';
import { DataPackagesService, IGetDataPackageResponse } from '@apollo/app/services/data-packages';
import { ConsumerSubscriptionService, IDataItems } from '@apollo/app/services/consumer-subscription';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { PageRequest, Page } from '../../shared/datasource/page';
import { ISubscriptionRequest, Subscription, SubscriptionQuery } from '../interfaces';

type Sub = Subscription & ISubscriptionRequest;
type SubCollection = Subscription[] & ISubscriptionRequest[];
interface Payload {
  content: SubCollection;
  totalElements: number;
  size: number;
  number: number;
}

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  constructor(private consumerSubscriptionService: ConsumerSubscriptionService, private dataPackagesService: DataPackagesService) {}

  public getSubscription(subscriptionId: string) {
    return of({});
  }

  public getPackage(packageId: string): Observable<IGetDataPackageResponse> {
    return this.dataPackagesService.getPublishedDataPackageById(packageId);
  }

  public getSubscriptions(request: PageRequest<Subscription>, query?: SubscriptionQuery): Observable<Page<Subscription>> {
    return this.consumerSubscriptionService
      .getConsumerSubscriptions({
        after: request.page,
        limit: request.size,
        status: request.status
      })
      .pipe(map(this.SubscriptionMapping(request)));
  }

  public getSubscriptionRequests(
    request: PageRequest<ISubscriptionRequest>,
    query?: SubscriptionQuery
  ): Observable<Page<ISubscriptionRequest>> {
    return this.consumerSubscriptionService
      .getConsumerSubscriptionRequests({
        status: request.status
      })
      .pipe(map(this.SubscriptionMapping(request)));
  }

  private SubscriptionMapping(request: PageRequest<Sub>): (s: SubCollection) => Payload {
    return (s: SubCollection): Payload => ({
      content: s,
      totalElements: s.length,
      size: request.size,
      number: request.page
    });
  }

  public getConsumerSubscription(subscriptionId: string): Observable<Subscription> {
    return this.consumerSubscriptionService.getConsumerSubscription(subscriptionId);
  }

  public getConsumerSubscriptionDataItems(subscriptionId: string): Observable<IDataItems> {
    return this.consumerSubscriptionService.getConsumerSubscriptionDataItems(subscriptionId);
  }
}
