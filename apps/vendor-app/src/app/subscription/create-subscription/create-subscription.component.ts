import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { formatDate } from '@angular/common';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { DELFI_USER_CONTEXT } from '@apollo/app/delfi-gui-auth-config';
import { ContextModel } from '@delfi-gui/components/lib/model/context.model';
import { NotificationService, INotificationOptions, ModalComponent } from '@apollo/app/ui/notification';
import { DataPackagesService, IGetDataPackageResponse } from '@apollo/app/services/data-packages';
import { DataSubscriptionService, ICreateSubscriptionReqBody } from '@apollo/app/services/data-subscription';
import { GoogleAnalyticsService } from 'ngx-google-analytics';
import * as moment_namespace from 'moment';
import { take, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

const moment = moment_namespace;

export const MY_FORMATS = {
  parse: {
    dateInput: 'YYYY-MM-DD',
    dateTimeInput: 'YYYY-MM-DD, HH:mm'
  },
  display: {
    dateInput: 'YYYY-MM-DD',
    dateTimeInput: 'YYYY-MM-DD, HH:mm',
    monthYearLabel: 'YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'YYYY'
  }
};

@Component({
  selector: 'apollo-create-subscription',
  templateUrl: './create-subscription.component.html',
  styleUrls: ['./create-subscription.component.scss'],
  providers: [{ provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }]
})
export class CreateSubscriptionComponent implements OnInit {
  public isFileUploaded: boolean;
  public fileInformation: File;
  public package: IGetDataPackageResponse;
  public requestPackage: any;
  public dateFormat = `YYYY-MM-ddTHH:mm:ss.sZZZZZ`;
  public minDate: Date;
  public startDate: any;
  public endDate: Date;
  public selectedDate: Date;
  public unavailableEndDate: boolean;
  public formGroup: FormGroup = new FormGroup({
    name: new FormControl({ value: '', disabled: true }, [Validators.required]),
    companyName: new FormControl({ value: ''}, [Validators.required]),
    price: new FormControl('', [Validators.required, Validators.minLength(1), Validators.max(9999999999)]),
    durationTerm: new FormControl('', [Validators.required, Validators.minLength(1)]),
    transactionId: new FormControl('', [Validators.required, Validators.minLength(1)])
  });
  public priceInputConfig = {
    align: 'left',
    allowNegative: false,
    decimal: '.',
    precision: 2,
    prefix: '',
    suffix: '',
    thousands: ',',
    typingDirection: 'integerToDecimal'
  };
  public invalidPrice: boolean;
  public showLoader = false;
  billingAccountID = '';

  constructor(
    private router: Router,
    private dataPackagesService: DataPackagesService,
    private dataSubscriptionService: DataSubscriptionService,
    public dialog: MatDialog,
    private notificationService: NotificationService,
    @Inject(DELFI_USER_CONTEXT) private readonly userContext: ContextModel,
    private googleAnalyticsService: GoogleAnalyticsService
  ) {
    this.billingAccountID = this.userContext.crmAccountId;
    this.requestPackage = this.router.getCurrentNavigation().extras.state;
  }

  public ngOnInit(): void {
    this.showLoader = true;
    this.setMinDate();
    this.getPackage(this.requestPackage.dataPackageId);
    this.validateEndDate();
    this.googleAnalyticsService.pageView('/package/subscription/create', 'create_subscription_view');
  }

  public async getPackage(packageId: string): Promise<any> {
    this.dataPackagesService
      .getPublishedDataPackageById(packageId)
      .pipe()
      .subscribe((data) => {
        this.package = data;
        const today = new Date();
        this.setDefaultValues();
        this.setEndDate(today, data.dataPackageProfile?.price?.durationTerm);
        this.showLoader = false;
      });
  }

  public setMinDate() {
    const now = new Date();
    this.minDate = new Date();
    now.setSeconds(now.getSeconds() + 1);
    this.startDate = moment(now, MY_FORMATS.display.dateTimeInput);
  }

  public setEndDate(startDate: any, durationTerm: number) {
    const validateStartDate = this.formatStartDate();
    if (validateStartDate === null) {
      this.unavailableEndDate = true;
      return this.unavailableEndDate;
    }

    startDate = new Date(startDate);
    const newMonth = startDate.getMonth() + +durationTerm;
    const minusOneDay = startDate.getDate() - 1;
    this.endDate = startDate.setMonth(newMonth, minusOneDay);
    this.unavailableEndDate = false;
  }

  public onSelectedStartDate(date: any) {
    this.selectedDate = new Date(date);
    if (this.package) {
      const { price } = this.package.dataPackageProfile;

      if (this.startDate !== this.selectedDate && price?.durationTerm === this.formGroup.value.durationTerm) {
        this.setEndDate(this.selectedDate, price.durationTerm);
      }

      if (this.startDate !== this.selectedDate && price?.durationTerm !== this.formGroup.value.durationTerm) {
        this.startDate = this.selectedDate;
        this.setEndDate(this.selectedDate, this.formGroup.value.durationTerm);
      }
    }
  }

  public setDefaultValues() {
    // eslint-disable-next-line no-unsafe-optional-chaining
    const { price } = this.package?.dataPackageProfile;

    this.formGroup.patchValue({
      name: this.requestPackage.requesterName,
      companyName: this.requestPackage.companyName,
      price: price?.price,
      durationTerm: price?.durationTerm
    });
  }

  public detectChanges() {
    this.validateEndDate();

    if (parseInt(this.formGroup.value.durationTerm) !== 0 && this.formGroup.value.durationTerm !== '') {
      const date = new Date(this.startDate);

      if (this.package.dataPackageProfile.price?.durationTerm !== this.formGroup.value.durationTerm) {
        this.setEndDate(date, this.formGroup.value.durationTerm);
        this.unavailableEndDate = false;
      }
    }

    return this.unavailableEndDate;
  }

  public uploadFile(file: File) {
    this.fileInformation = file;
    this.isFileUploaded = true;
  }

  public deleteFile() {
    this.isFileUploaded = false;
  }

  public validatePrice() {
    this.invalidPrice = this.formGroup.value.price === 0;
  }

  public formatStartDate() {
    const today = moment().format('YYYY-MM-DD');
    const startDate = moment(this.startDate).format('YYYY-MM-DD');
    if (startDate >= today && startDate !== 'Invalid date') {
      return formatDate(new Date(this.startDate), this.dateFormat, 'en-us');
    }
    return null;
  }

  public getCreateSubscriptionPostBody() {
    return {
      dataPackageId: this.requestPackage.dataPackageId,
      subscriptionRequestId: this.requestPackage.subscriptionRequestId,
      subscriptionPrice: this.formGroup.value.price,
      subscriptionDuration: this.formGroup.value.durationTerm,
      startDate: this.formatStartDate(),
      endDate: formatDate(new Date(this.endDate), this.dateFormat, 'en-us'),
      transactionDetail: {
        transactionId: this.formGroup.value.transactionId
      },
      customerDetail: {
        customerId: this.requestPackage.requestedBy,
        customerName: this.requestPackage.requesterName,
        companyName: this.requestPackage.companyName
      }
    };
  }

  public onCreateSubscription(): void {
    this.showLoader = true;
    const postBody: ICreateSubscriptionReqBody = this.getCreateSubscriptionPostBody();
    this.dataSubscriptionService
      .createSubscription(postBody)
      .pipe(
        take(1),
        catchError((e) => {
          if (e.status === 412) {
            const dialogConfig = new MatDialogConfig();
            dialogConfig.autoFocus = true;
            dialogConfig.panelClass = 'deliverables-modal-panel';
            dialogConfig.disableClose = false;
            dialogConfig.data = {
              options: {
                title: 'No Deliverable Files',
                subtitle: this.requestPackage.dataPackageName,
                content: 'There are currently no deliverable files in this package. Upload the deliverables in the package to approve and create a subscription.',
                confirmButtonText: 'Add Deliverables'
              }
            };
            this.dialog.open(ModalComponent, dialogConfig);
            return;
          }
          this.showToastSubscriptionCreated('Error', 'Something went wrong creating your subscription.');
          return of(null);
        })
      )
      .subscribe((response) => {
        this.router.navigateByUrl('/vendor/package/requests');
        if (response.dataSubscriptionId) {
          this.showToastSubscriptionCreated('Success', 'Your subscription has been created');
          this.googleAnalyticsService.gtag('event', 'create_subscription', {
            billingAccountID: this.billingAccountID,
            dataSubscriptionId: response.dataSubscriptionId,
            dataPackageId: postBody.dataPackageId,
            customerName: postBody.customerDetail.customerName,
            companyName: postBody.customerDetail.companyName,
            subscriptionPrice: postBody.subscriptionPrice,
            subscriptionDuration: postBody.subscriptionDuration
          });
        }
      });
  }

  public onCancel() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.panelClass = 'cancel-create-subscription-modal-panel';
    dialogConfig.disableClose = true;
    dialogConfig.data = {
      options: {
        title: 'Create Subscription',
        content: 'Are you sure you want to cancel? If there are changes on the subscription they will be lost.',
        confirmButtonText: 'Cancel',
        cancelButtonText: 'Stay'
      }
    };
    const dialogRef = this.dialog.open(ModalComponent, dialogConfig);

    dialogRef.componentInstance.yesClickEvent.subscribe(() => {
      this.router.navigateByUrl('/vendor/package/requests');
    });
  }

  public showToastSubscriptionCreated(severity: INotificationOptions['severity'], message: string) {
    this.showLoader = false;
    this.notificationService.send({
      severity: severity,
      title: severity,
      message
    });
  }

  public validateEndDate() {
    this.unavailableEndDate =
      this.package?.dataPackageProfile.price.durationTerm === 0 || parseInt(this.formGroup.value.durationTerm) === 0;
  }
}
