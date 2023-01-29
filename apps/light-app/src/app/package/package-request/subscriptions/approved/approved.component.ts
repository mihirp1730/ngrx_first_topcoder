import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Store } from '@ngrx/store';

import * as packageSelectors from '../../../state/selectors/package.selectors';

@Component({
  selector: 'apollo-package-request-subscription-approved',
  templateUrl: './approved.component.html',
  styleUrls: ['./approved.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApprovedComponent {
  startTime$ = this.store.select(packageSelectors.deduceSelectedPackageSubscriptionStartTimeDate);

  constructor(public readonly store: Store) {}
}
