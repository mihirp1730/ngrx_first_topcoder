import { Component, OnInit } from '@angular/core';
import { formatDate } from '@angular/common';
import { DataSubscriptionService } from '@apollo/app/services/data-subscription';
import { map } from 'rxjs/operators';

import { NotificationService } from '@apollo/app/ui/notification';
import { GoogleAnalyticsService } from 'ngx-google-analytics';

@Component({
  selector: 'apollo-manage-subscription',
  templateUrl: './manage-subscription.component.html',
  styleUrls: ['./manage-subscription.component.scss']
})
export class ManageSubscriptionComponent implements OnInit {
  public manageSubscriptions = [];
  public columnDefinition = [
    {
      headerName: 'Package Name',
      field: 'dataPackageName',
      tooltipField: 'dataPackageName',
      filter: 'agTextColumnFilter',
      suppressMenu: true,
      cellRendererSelector: () => {
        return {
          component: 'linkCellRenderer'
        };
      }
    },
    {
      headerName: 'Subscriber',
      field: 'customerDetail.customerName',
      tooltipField: 'customerDetail.customerName',
      filter: 'agTextColumnFilter',
      suppressMenu: true
    },
    {
      headerName: 'Company Name',
      field: 'customerDetail.companyName',
      tooltipField: 'customerDetail.companyName',
      filter: 'agTextColumnFilter',
      suppressMenu: true
    },
    {
      headerName: 'Start Date',
      field: 'startDate',
      tooltipField: 'startDate',
      filter: 'agTextColumnFilter',
      suppressMenu: true
    },
    {
      headerName: 'Expiration Date',
      field: 'endDate',
      tooltipField: 'endDate',
      filter: 'agTextColumnFilter',
      suppressMenu: true
    },
    {
      headerName: 'Subscription ID',
      field: 'dataSubscriptionId',
      tooltipField: 'dataSubscriptionId',
      filter: 'agTextColumnFilter',
      suppressMenu: true,
      width: 100
    },
    {
      headerName: 'Transaction ID',
      field: 'transactionDetail.transactionId',
      tooltipField: 'transactionDetail.transactionId',
      filter: 'agTextColumnFilter',
      suppressMenu: true
    },
    {
      headerName: 'Status',
      field: 'dataSubscriptionStatus',
      filter: 'agTextColumnFilter',
      suppressMenu: true,
      cellStyle: (params) => {
        switch (params.value) {
          case 'Active': return { color: '#47B280' };
          case 'Expiring soon': return { color: '#FFC107' };
          case 'Expired': return { color: '#FF5A5A' };
          case 'Approved': return { color: '#00A4A6' };
          default: return { color: '#FFFFFF' };
        }
      }
    }
  ];
  public showLoader = false;

  constructor(
      private readonly dataSubscriptionService: DataSubscriptionService,
      private readonly notificationService: NotificationService,
      private googleAnalyticsService: GoogleAnalyticsService
  ) {}

  ngOnInit(): void {
    this.showLoader = true;
    this.googleAnalyticsService.pageView('/package/subscription/manage', 'manage_subscription_view');
    this.dataSubscriptionService
      .getManageSubscription({ limit: 0, after: 0, before: 0 })
      .pipe(
        map((response) =>
          response.map((item) => ({
            ...item,
            startDate: formatDate(item.startDate, 'YYYY-MM-dd HH:mm', 'en-US'),
            endDate: formatDate(item.endDate, 'YYYY-MM-dd HH:mm', 'en-US')
          }))
        )
      )
      .subscribe((response) => {
        this.manageSubscriptions = response;
        this.showLoader = false;
      }, () => {
        this.manageSubscriptions = [];
        this.notificationService.send({
          severity: 'Error',
          title: 'Error',
          message: 'Something went wrong, please try again later.'
        });
        this.showLoader = false;
      });
  }
}
