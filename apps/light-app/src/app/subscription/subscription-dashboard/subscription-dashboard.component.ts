import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

import {
  IDataType,
  ISubscriptionFilters,
  IRegion,
  ISortFilter,
  IStatus,
  Subscription,
  ISubscriptionRequest,
  SubscriptionQuery
} from '../interfaces';
import { Sort } from '../../shared/datasource/page';
import { SubscriptionService } from '../services/subscription.service';
import { SubscriptionDataSource } from '../../shared/datasource/subscription.datasource';
import { GoogleAnalyticsService } from 'ngx-google-analytics';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'apollo-subscription-dashboard',
  templateUrl: './subscription-dashboard.component.html',
  styleUrls: ['./subscription-dashboard.component.scss']
})
export class SubscriptionDashboardComponent implements OnInit {
  public activeSubs: Subscription[];
  public pendingSubs: ISubscriptionRequest[];
  public expiredSubs: Subscription[];
  public columnDefinition = [
    {
      columnName: 'Package Name'
    },
    {
      columnName: 'Data Type'
    },
    {
      columnName: 'Region'
    },
    {
      columnName: 'Request Date'
    },
    {
      columnName: 'Status'
    },
    {
      columnName: 'Actions'
    }
  ];
  public columnDefinition2 = [
    {
      columnName: 'Package Name'
    },
    {
      columnName: 'Data Type'
    },
    {
      columnName: 'Region'
    },
    {
      columnName: 'Last Download'
    },
    {
      columnName: 'Status'
    },
    {
      columnName: 'Actions'
    }
  ];

  // Filters
  public filters: Array<ISubscriptionFilters> = [
    {
      id: 'dataType',
      label: 'Data Type',
      value: null,
      values: [
        { label: 'All', value: null, count: 0 },
        { label: 'Wells', value: IDataType.Wells, count: 0 },
        { label: 'Seismic', value: IDataType.Seismic, count: 0 },
        { label: 'No Type', value: IDataType.NoType, count: 0 }
      ]
    },
    {
      id: 'region',
      label: 'Region',
      value: null,
      values: [
        { label: 'All', value: null, count: 0 },
        { label: 'Region1', value: IRegion.Region1, count: 0 },
        { label: 'Region2', value: IRegion.Region2, count: 0 },
        { label: 'Region3', value: IRegion.Region3, count: 0 }
      ]
    },
    {
      id: 'status',
      label: 'Status',
      value: null,
      values: [
        { label: 'All', value: null, count: 0 },
        { label: 'Expired', value: IStatus.Expired, count: 0 },
        { label: 'Active', value: IStatus.Active, count: 0 },
        { label: 'Subscribed', value: IStatus.Subscribed, count: 0 }
      ]
    }
  ];

  public sortBy: Array<ISortFilter> = [
    {
      label: 'A to Z',
      field: 'name',
      order: 'asc'
    },
    {
      label: 'Z to A',
      field: 'name',
      order: 'desc'
    }
  ];

  subsInitialSort: Sort<Subscription> = { property: 'dataSubscriptionId', order: 'desc' };
  requestInitialSort: Sort<ISubscriptionRequest> = { property: 'subscriptionRequestId', order: 'desc' };

  initialQuery: SubscriptionQuery = { search: '' };
  requestsDataSource = new SubscriptionDataSource<ISubscriptionRequest, SubscriptionQuery>(
    (request, query) =>
      this.subscriptionService
        .getSubscriptionRequests({ ...request, status: 'PENDING' }, query)
        .pipe(tap((data) => (this.pendingSubs = data.content))),
    this.requestInitialSort,
    this.initialQuery
  );

  activeSubsDataSource = new SubscriptionDataSource<Subscription, SubscriptionQuery>(
    (request, query) => this.subscriptionService.getSubscriptions({ ...request, status: 'ACTIVE' }, query),
    this.subsInitialSort,
    this.initialQuery
  );

  expiredSubsDataSource = new SubscriptionDataSource<Subscription, SubscriptionQuery>(
    (request, query) => this.subscriptionService.getSubscriptions({ ...request, status: 'EXPIRED' }, query),
    this.subsInitialSort,
    this.initialQuery
  );

  constructor(
    private readonly subscriptionService: SubscriptionService,
    private googleAnalyticsService: GoogleAnalyticsService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cd.detectChanges();
    this.googleAnalyticsService.pageView('/subscriptions', 'subscriptions_view');
  }

  public onPackageSearch(term: string): void {
    this.requestsDataSource.queryBy({
      search: term
    });
    this.activeSubsDataSource.queryBy({
      search: term
    });
    this.expiredSubsDataSource.queryBy({
      search: term
    });
  }

  public onFilterChange(filter: any): void {
    this.requestsDataSource.queryBy({
      [filter.type]: filter.value
    });
    this.activeSubsDataSource.queryBy({
      [filter.type]: filter.value
    });
    this.expiredSubsDataSource.queryBy({
      [filter.type]: filter.value
    });
  }

  public onSort(sort: any): void {
    this.requestsDataSource.sortBy({
      property: sort.field,
      order: sort.order
    });
    this.activeSubsDataSource.sortBy({
      property: sort.field,
      order: sort.order
    });
    this.expiredSubsDataSource.sortBy({
      property: sort.field,
      order: sort.order
    });
  }

  trackByPackage(index) {
    return index;
  }
}
