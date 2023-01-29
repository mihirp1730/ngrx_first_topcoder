import { HttpClient } from '@angular/common/http';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { DELFI_USER_CONTEXT } from '@apollo/app/delfi-gui-auth-config';
import { NotificationService } from '@apollo/app/ui/notification';
import { IDataVendor, VendorAppService } from '@apollo/app/vendor';
import { ContextModel } from '@delfi-gui/components/lib/model/context.model';
import { take } from 'rxjs/operators';

import { ISubscriptionRequest, Subscription } from '../interfaces';
import { SubscriptionService } from '../services/subscription.service';

@Component({
  selector: 'apollo-subscription-table',
  templateUrl: './subscription-table.component.html',
  styleUrls: ['./subscription-table.component.scss']
})
export class SubscriptionTableComponent implements OnInit {
  @Input() subscription: Subscription;
  @Input() isRequest: boolean;
  @Input() pendingRequests: ISubscriptionRequest[];

  public pendingRequest: ISubscriptionRequest;
  public panelOpenState = false;
  public packageDetails: any;
  public dataVendor: IDataVendor;

  constructor(
    public readonly subscriptionService: SubscriptionService,
    public readonly httpClient: HttpClient,
    public readonly notificationService: NotificationService,
    @Inject(DELFI_USER_CONTEXT) public readonly userContext: ContextModel,
    private vendorAppService: VendorAppService
  ) {}

  ngOnInit(): void {
    this.subscriptionService.getPackage(this.subscription.dataPackageId).subscribe((res) => {
      this.packageDetails = res;
      this.pendingRequest = this.pendingRequests?.find((req) => req.dataPackageId === res.dataPackageId);
      this.getDataVendorById(this.packageDetails.vendorId);
    });
  }

  public getDataVendorById(dataVendorId: string) {
    this.vendorAppService
      .retrieveDataVendors()
      .pipe(take(1))
      .subscribe((dataVendors: IDataVendor[]) => {
        this.dataVendor = dataVendors.find((vendor) => vendor.dataVendorId === dataVendorId);
      });
  }
}
