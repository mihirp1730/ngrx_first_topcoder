import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { DataPackagesService, IDataPackage } from '@apollo/app/services/data-packages';
import { NotificationService } from '@apollo/app/ui/notification';
import { forkJoin, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { transformPackage } from './helpers/package.helper';

@Injectable({
  providedIn: 'root'
})
export class PackageResolver implements Resolve<IDataPackage> {
  constructor(
    private dataPackagesService: DataPackagesService,
    private router: Router,
    private readonly notificationService: NotificationService
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IDataPackage> {
    const dataPackageId = route.params['id'];

    return forkJoin([
      this.dataPackagesService.getDataPackage(dataPackageId),
      this.dataPackagesService.getMarketingRepresentations(dataPackageId),
      this.dataPackagesService.getAssociateDeliverables(dataPackageId)
    ]).pipe(
      map(([dataPackage, marketingRepresentations, deliverables]) => transformPackage(dataPackage, marketingRepresentations, deliverables)),
      tap((response) => {
        if (!response) {
          this.notificationService.send({
            severity: 'Error',
            title: 'Error',
            message: 'Something went wrong retrieving the information of this package, please try again later.'
          });
          this.router.navigateByUrl('vendor/datapackage');
        }
      })
    );
  }
}
