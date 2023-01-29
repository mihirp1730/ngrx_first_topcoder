import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { IGetDataPackageResponse } from '@apollo/app/services/data-packages';
import { IDataVendor, VendorAppService } from '@apollo/app/vendor';
import { find } from 'lodash';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

import { PackageService } from '../../../package/services/package.service';

@Component({
  selector: 'apollo-item-header',
  templateUrl: './item-header.component.html'
})
export class ItemHeaderComponent implements OnChanges {
  @Input() result: any;

  public dataVendor: IDataVendor;
  public subscriptions = new Subscription();
  constructor(private packageService: PackageService, private vendorAppService: VendorAppService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.result.currentValue) {
      const dataPackageId = find(changes.result.currentValue.properties, { name: 'DataPackageId' }).value;
      this.subscriptions.add(
        // This call will get removed once publish workflow adds vendor id to maplarge table
        this.packageService.getPackage(dataPackageId).subscribe((response: IGetDataPackageResponse) => {
          this.getDataVendorById(response.vendorId);
        })
      );
    }
  }

  public getDataVendorById(dataVendorId: string) {
    this.subscriptions.add(
      this.vendorAppService
        .retrieveDataVendors()
        .pipe(take(1))
        .subscribe((dataVendor: IDataVendor[]) => {
          this.dataVendor = dataVendor.find((vendor) => vendor.dataVendorId === dataVendorId);
        })
    );
  }

  public ngOnDestroy(): void {
    this.subscriptions?.unsubscribe();
  }
}
