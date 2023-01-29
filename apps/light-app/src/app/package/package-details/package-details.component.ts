import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { GoogleAnalyticsService } from 'ngx-google-analytics';
import { take } from 'rxjs/operators';

import { PackageModalCancelRequestComponent } from '../package-modal-cancel-request/package-modal-cancel-request.component';
import * as packageSelectors from '../state/selectors/package.selectors';
import * as packageActions from '../state/actions/package.actions';
import { IMediaDetails } from '../interfaces';

@Component({
  selector: 'apollo-package-details',
  templateUrl: './package-details.component.html',
  styleUrls: ['./package-details.component.scss']
})
export class PackageDetailsComponent implements OnInit {
  public selectedPackage$ = this.store.select(packageSelectors.selectSelectedPackage);
  public packageMedia: IMediaDetails[];
  public loading = false;

  constructor(
    public readonly store: Store,
    public readonly dialog: MatDialog,
    private googleAnalyticsService: GoogleAnalyticsService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {}

  public ngOnInit() {
    this.store.dispatch(packageActions.userSelectedPackage({ id: this.activatedRoute.snapshot.params.id }));

    this.selectedPackage$.pipe(take(1)).subscribe((pkg) => {
      this.googleAnalyticsService.gtag('event', 'view_package_details', {
        vendorId: pkg?.vendorId,
        dataPackageId: pkg?.dataPackageId,
        name: pkg?.name,
        price: pkg?.dataPackageProfile.price?.price,
        durationTerm: pkg?.dataPackageProfile?.price?.durationTerm,
        onRequest: pkg?.dataPackageProfile?.price?.onRequest,
        regions: pkg?.dataPackageProfile.profile?.regions.join(', ')
      });
    });
  }

  public OpenModal() {
    this.dialog.open(PackageModalCancelRequestComponent);
  }

  public closeThisPane() {
    this.store.dispatch(packageActions.userNavigatedAwayFromPackage());
    this.router.navigate(['/map']);
  }
}
