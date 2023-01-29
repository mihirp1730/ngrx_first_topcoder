import { Component, OnInit } from '@angular/core';
import { formatDate } from '@angular/common';
import { DataSubscriptionService } from '@apollo/app/services/data-subscription';
import { map } from 'rxjs/operators';

import { NotificationService } from '@apollo/app/ui/notification';
import { GoogleAnalyticsService } from 'ngx-google-analytics';

@Component({
  selector: 'apollo-request-dashboard',
  templateUrl: './request-dashboard.component.html',
  styleUrls: ['./request-dashboard.component.scss']
})
export class RequestDashboardComponent implements OnInit {
  public requests = [];
  public columnDefinition = [
    {
      headerName: 'Package Name',
      field: 'dataPackageName',
      filter: 'agTextColumnFilter',
      suppressMenu: true,
      width: 150,
      tooltipField: 'dataPackageName'
    },
    {
      headerName: 'Requester',
      field: 'requesterName',
      filter: 'agTextColumnFilter',
      suppressMenu: true
    },
    {
      headerName: 'Company Name',
      field: 'companyName',
      filter: 'agTextColumnFilter',
      suppressMenu: true
    },
    {
      headerName: 'Requested On',
      field: 'requestedOn',
      filter: 'agTextColumnFilter',
      suppressMenu: true
    },
    {
      headerName: 'Request ID',
      field: 'subscriptionRequestId',
      filter: 'agTextColumnFilter',
      suppressMenu: true,
      width: 100
    },
    {
      headerName: 'Status',
      field: 'requestStatus',
      filter: 'agTextColumnFilter',
      suppressMenu: true
    },
    {
      headerName: 'Actions',
      field: 'requestStatus',
      filter: false,
      cellRendererSelector: (params) => {
        if (params.data.requestStatus === 'Approved') {
          return {
            component: 'approvedCellRenderer'
          };
        }

        if (params.data.requestStatus === 'Rejected') {
          return {
            component: 'rejectedCellRenderer'
          };
        }

        return {
          component: 'pendingCellRenderer'
        };
      }
    }
  ];
  public showLoader = false;

  constructor(
    private readonly dataSubscriptionService: DataSubscriptionService,
    private readonly notificationService: NotificationService,
    private googleAnalyticsService: GoogleAnalyticsService
  ) { }

  ngOnInit(): void {
    this.showLoader = true;
    this.googleAnalyticsService.pageView('/requests', 'requests_view');
    this.dataSubscriptionService
      .getRequests()
      .pipe(
        map((response) =>
          response.map((item) => ({
            ...item,
            requestedOn: formatDate(item.requestedOn, 'YYYY-MM-dd HH:mm', 'en-US')
          }))
        )
      )
      .subscribe((response) => {
        this.requests = response;
        this.showLoader = false;
      }, () => {
        this.requests = [];
        this.notificationService.send({
          severity: 'Error',
          title: 'Error',
          message: 'Something went wrong, please try again later.'
        });
        this.showLoader = false;
      });
  }
}
