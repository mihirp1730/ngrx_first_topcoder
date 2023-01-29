import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Inject, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ResultsResponseResult } from '@apollo/api/data-packages/vendor';
import { DELFI_USER_CONTEXT } from '@apollo/app/delfi-gui-auth-config';
import { DataPackagesService } from '@apollo/app/services/data-packages';
import { NotificationService } from '@apollo/app/ui/notification';
import { ContextModel } from '@delfi-gui/components/lib/model/context.model';
import { Store } from '@ngrx/store';
import { GoogleAnalyticsService } from 'ngx-google-analytics';
import { switchMap, take } from 'rxjs/operators';

import { Labels } from '../../shared/constants/data-package.constants';
import * as dashboardSelectors from '../state/selectors/dashboard.selectors';
import { VendorDashboardModalComponent } from '../vendor-dashboard-modal/vendor-dashboard-modal.component';

@Component({
  selector: 'apollo-vendor-dashboard',
  templateUrl: './vendor-dashboard.component.html',
  styleUrls: ['./vendor-dashboard.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class VendorDashboardComponent implements OnInit {
  @Output() disableButtons: EventEmitter<boolean> = new EventEmitter<boolean>();
  dataPackages: ResultsResponseResult[];
  showLoader = false;
  currentPage = 0;
  cardsPerPage = 20;
  dataPackageCount = 10;
  pageSizeOptions = [
    {
      viewText: '10',
      value: 10
    },
    {
      viewText: '15',
      value: 15
    },
    {
      viewText: '20',
      value: 20
    },
    {
      viewText: '25',
      value: 25
    }
  ];
  readonly labels = Labels;
  isNetworkError = false;
  billingAccountID = '';

  constructor(
    public readonly store: Store,
    public readonly dialog: MatDialog,
    private notificationService: NotificationService,
    private dataPackagesService: DataPackagesService,
    @Inject(DELFI_USER_CONTEXT) private readonly userContext: ContextModel,
    private googleAnalyticsService: GoogleAnalyticsService
  ) {
    this.billingAccountID = this.userContext?.crmAccountId;
  }

  ngOnInit() {
    this.populateDataPackageCards();
  }

  populateDataPackageCards() {
    this.showLoader = true;
    this.store
      .select(dashboardSelectors.selectFilters)
      .pipe(
        take(1),
        switchMap((filter) => {
          const filterRequest = {
            filters: {
              status: {
                value: filter.status
              },
              region: {
                value: filter.regions
              },
              dataType: {
                value: filter.dataType
              }
            }
          };
          return this.dataPackagesService.getDataPackages(filterRequest);
        })
      )
      .subscribe(
        (dataPackages: ResultsResponseResult[]) => {
          this.dataPackages = dataPackages;
          this.dataPackageCount = dataPackages.length;
          this.showLoader = false;
        },
        (err) => {
          this.dataPackages = null;
          this.isNetworkError = true;
          this.showLoader = false;
          this.openModal();
          this.notificationService.send({
            severity: 'Error',
            title: 'Error',
            message: this.labels.somethingWentWrong
          });
          this.disableButtons.emit(true);
        }
      );
  }

  openModal() {
    this.dialog.open(VendorDashboardModalComponent);
  }

  deletePackage(selectedPackage: ResultsResponseResult) {
    this.showLoader = true;
    this.dataPackagesService.deleteDraftPackage(selectedPackage.id).subscribe(
      () => {
        this.notificationService.send({
          severity: 'Success',
          title: 'Success',
          message: `${selectedPackage.name} ${this.labels.packageDeleteSuccessMsg}`
        });
        this.googleAnalyticsService.gtag('event', 'delete_package', {
          billingAccountID: this.billingAccountID,
          dataPackageId: selectedPackage.id
        });
        setTimeout(() => {
          this.populateDataPackageCards();
        }, 1000);
      },
      (error) => this.handleError(error)
    );
  }

  private handleError(errorResponse: HttpErrorResponse) {
    this.showLoader = false;
    let message = this.labels.somethingWentWrong;
    if (errorResponse.error?.error?.code === 'InvalidOperation') {
      message = errorResponse.error?.error?.message || message;
    }
    this.notificationService.send({
      severity: 'Error',
      title: 'Error',
      message: message
    });
  }

  unpublishPackage(selectedPackage: ResultsResponseResult) {
    this.showLoader = true;
    this.dataPackagesService.unpublishPackage(selectedPackage.id).subscribe(
      () => {
        this.googleAnalyticsService.gtag('event', 'unpublish_package', {
          billingAccountID: this.billingAccountID,
          dataPackageId: selectedPackage.id
        });
        setTimeout(() => {
          this.populateDataPackageCards();
        }, 1000);
      },
      (error) => this.handleError(error)
    );
  }
}
