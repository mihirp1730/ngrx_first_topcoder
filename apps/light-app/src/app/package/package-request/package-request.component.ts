import { Component } from '@angular/core';
import { DataPackageSubscriptionStatus } from '@apollo/api/data-packages/consumer';
import { AuthCodeFlowService } from '@apollo/app/auth-codeflow';
import { Store } from '@ngrx/store';
import { map, take, tap } from 'rxjs/operators';

import * as packageSelectors from '../state/selectors/package.selectors';

@Component({
  selector: 'apollo-package-request',
  templateUrl: './package-request.component.html',
  styleUrls: ['./package-request.component.scss']
})
export class PackageRequestComponent {
  public isGuest$ = this.authCodeFlowService.getUser().pipe(map((user) => user.isGuest));

  public selectedProfileId$ = this.store.select(packageSelectors.selectSelectedProfileId);
  public selectedPackageSubscriptionStatus$ = this.store.select(packageSelectors.selectSelectedPackageSubscriptionStatus);
  public DataPackageSubscriptionStatus = DataPackageSubscriptionStatus;

  constructor(public readonly store: Store, private authCodeFlowService: AuthCodeFlowService) {}

  public redirectToSignIn(): void {
    this.selectedProfileId$.pipe(take(1)).subscribe((packageId: string) => {
      this.authCodeFlowService.signIn(`packages/${packageId}`);
    });
  }
}
