import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Store } from '@ngrx/store';

import * as packageSelectors from '../../../state/selectors/package.selectors';

@Component({
  selector: 'apollo-package-request-subscription-requested',
  templateUrl: './requested.component.html',
  styleUrls: ['./requested.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RequestedComponent {
  public lastRequestTime$ = this.store.select(packageSelectors.selectSelectedPackageSubscriptionLastRequestTime);

  constructor(public readonly store: Store) {}
}
