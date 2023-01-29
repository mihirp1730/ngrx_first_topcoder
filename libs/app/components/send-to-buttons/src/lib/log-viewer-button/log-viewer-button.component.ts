import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { SummaryCardService } from '@apollo/app/ui/summary-card-buttons';
import { GisMappedSearchResult } from '@slb-innersource/gis-canvas';
import { filter, map, take } from 'rxjs';

@Component({
  selector: 'apollo-log-viewer-button',
  templateUrl: './log-viewer-button.component.html',
  styleUrls: ['./log-viewer-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LogViewerButtonComponent implements OnChanges {
  @Input() result!: GisMappedSearchResult;
  @Input() results: any;
  @Output() buttonClick = new EventEmitter<{
    recordId: string;
    name: string;
  }>();

  private sendLimit = 40;

  public displayButton = false;
  public isDisabled = true;
  public tooltip = '';

  public constructor(private summaryCardService: SummaryCardService) {}

  public handleClick(): void {
    if (this.isDisabled) {
      return;
    }

    this.buttonClick.emit({
      recordId: this.result?.recordId,
      name: this.result?.name
    });
  }

  public ngOnChanges(): void {
    this.isDisabled = false;
    this.displayButton = (this.results?.entityType ?? this.result.type) === 'Well Log';

    if (!this.displayButton) {
      return;
    }

    if (this.results?.recordsTotal > this.sendLimit) {
      this.isDisabled = true;
      this.tooltip = `${this.results.recordsTotal} selected items. The limit is ${this.sendLimit}.`;
    }

    if (this.result) {
      this.summaryCardService.recordsSummaryCards$
        .pipe(
          filter((r) => !!r[this.result.recordId]),
          take(1),
          map((records) => records[this.result.recordId]),
          map((record) => !!record?.wellborelogs.hasWellboreLog)
        )
        .subscribe((hasWellbore) => {
          this.isDisabled = !hasWellbore;
        });
    }
  }
}
