import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthCodeFlowService } from '@apollo/app/auth-codeflow';
import { Store } from '@ngrx/store';
import { tap } from 'rxjs/operators';

import * as packageActions from '../../../state/actions/package.actions';
import * as packageSelectors from '../../../state/selectors/package.selectors';

@Component({
  selector: 'apollo-package-request-subscription-expired',
  templateUrl: './expired.component.html',
  styleUrls: ['./expired.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExpiredComponent {
  endTime$ = this.store.select(packageSelectors.deduceSelectedPackageSubscriptionEndTimeDate);
  selectedPackageRequesting$ = this.store.select(packageSelectors.selectSelectedPackageRequesting);
  subRequestFormGroup = new FormGroup({
    company: new FormControl('', [Validators.required, Validators.maxLength(50), Validators.minLength(1)]),
    comment: new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(250)])
  });
  // User info should be pulled from the store...
  userAuth$ = this.authCodeFlowService.getUser().pipe(tap(({ company }) => this.subRequestFormGroup.patchValue({ company })));

  constructor(public readonly store: Store, public readonly authCodeFlowService: AuthCodeFlowService) {}

  public onRequestPackage(): void {
    const { comment, company } = this.subRequestFormGroup.value;
    this.store.dispatch(packageActions.userRequestsPackageSubscription({ comment, company }));
  }
}
