import { ChangeDetectionStrategy, Component, Input, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

import { ResultPanelService } from '../../services/result-panel.service';

export interface IPackageState {
  packageId: string;
}

const initialState: IPackageState = {
  packageId: ''
};

@Component({
  selector: 'apollo-packages-panel-item',
  templateUrl: './packages-panel-item.component.html',
  styleUrls: ['./packages-panel-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PackagesPanelItemComponent implements OnDestroy {
  // Component state
  private _state: IPackageState = initialState;
  private state = new BehaviorSubject<IPackageState>(this._state);
  public state$ = this.state.asObservable();

  @Input() set packageId(packageId: string) {
    const packageData = this.resultPanelService.getCachedPackage(packageId);
    if (packageData) {
      this.updateState({ ...packageData, packageId });
    } else {
      this.resultPanelService.lookupPackage(packageId);
      this.updateState({
        ...this._state,
        packageId
      });
    }
  }
  public package$ = this.resultPanelService.packages$
    .pipe(
      map((packageMap) => {
        return packageMap[this._state.packageId];
      })
    )
    .pipe(distinctUntilChanged());

  public packageId$ = this.package$
    .pipe(
      map((packageData) => {
        return packageData?.DataPackageId ?? 'Not Available';
      })
    )
    .pipe(distinctUntilChanged());

  public packageName$ = this.package$
    .pipe(
      map((packageData) => {
        return packageData?.DataPackageName ?? 'Not Available';
      })
    )
    .pipe(distinctUntilChanged());

  public packageVendorName$ = this.package$
    .pipe(map((packageData) => packageData?.VendorName ?? 'Not Available'))
    .pipe(distinctUntilChanged());

  public packageRegion$ = this.package$
    .pipe(map((packageData) => packageData?.Region?.split(',').join(', ') ?? 'Not Available'))
    .pipe(distinctUntilChanged());

  public packageDataType$ = this.package$
    .pipe(map((packageData) => packageData?.DataType?.split(',').join(', ') ?? 'Not Available'))
    .pipe(distinctUntilChanged());

  public packagePrice$ = this.package$.pipe(map((packageData) => packageData?.Price ?? 'Not Available')).pipe(distinctUntilChanged());

  public packageOnRequest$ = this.package$.pipe(map((packageData) => packageData?.OnRequest === 'true')).pipe(distinctUntilChanged());

  public packageDuration$ = this.package$.pipe(map((packageData) => packageData?.Duration ?? 'Not Available')).pipe(distinctUntilChanged());

  public updateState(data: IPackageState): void {
    this._state = data;
    this.state.next(this._state);
  }

  constructor(public resultPanelService: ResultPanelService) {}

  ngOnDestroy() {
    this.resultPanelService.forgetLookupOfPackage(this.state.value.packageId);
  }
}
