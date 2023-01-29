import { Component, ChangeDetectionStrategy, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'apollo-packages-panel-list',
  templateUrl: './packages-panel-list.component.html',
  styleUrls: ['./packages-panel-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PackagesPanelListComponent {
  public loading = true;

  private _packagesIds: string[] = [];
  @Input()
  set packagesIds(packagesIds: string[] | null) {
    this.loading = packagesIds === null;
    this._packagesIds = packagesIds || [];
  }
  get packagesIds(): string[] {
    return this._packagesIds;
  }
  @Output() packageDetail: EventEmitter<string> = new EventEmitter<string>();

  public goToPackageDetails(packageId: string) {
    this.packageDetail.emit(packageId);
  }
}
