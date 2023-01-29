import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Store } from '@ngrx/store';

import * as packageActions from '../../../state/actions/package.actions';
import * as packageSelectors from '../../../state/selectors/package.selectors';

@Component({
  selector: 'apollo-package-request-subscription-active',
  templateUrl: './active.component.html',
  styleUrls: ['./active.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActiveComponent {
  packageDownloading$ = this.store.select(packageSelectors.selectSelectedPackageDownloading);

  constructor(public readonly store: Store) {}

  async download() {
    this.store.dispatch(packageActions.userDownloadsSelectedPackage());
  }
}
