import { Component, ChangeDetectionStrategy, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'apollo-results-lock-icon',
  templateUrl: './results-lock-icon.component.html',
  styleUrls: ['./results-lock-icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResultsLockIconComponent implements OnChanges {
  @Input() result = {};
  @Input() isGuest = true;

  public showLock = false;

  static getIsPublicValue(result: any): boolean {
    const properties = result?.properties ?? [];
    for (const property of properties) {
      if (property?.name === 'OpportunityType') {
        return property.value?.toLowerCase() === 'public';
      }
    }
    return false;
  }

  ngOnChanges(changes: SimpleChanges) {
    const result = changes?.result?.currentValue ?? this.result;
    const isGuest = changes?.isGuest?.currentValue ?? this.isGuest;
    this.updateShowLock(result, isGuest);
  }

  private updateShowLock(result: any, isGuest: boolean) {
    // TEMP: only consider the lock icon for Opportunities - skip other layers...
    if (result?.type !== 'Opportunity') {
      this.showLock = false;
      return;
    }
    const isPublic = ResultsLockIconComponent.getIsPublicValue(result);
    if (isPublic) {
      this.showLock = false;
    } else {
      this.showLock = isGuest === true;
    }
  }
}
