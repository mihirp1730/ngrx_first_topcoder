import {
  Component,
  ChangeDetectionStrategy,
  EventEmitter,
  Input,
  OnChanges,
  SimpleChanges,
  Output,
  InjectionToken,
  Inject
} from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';

import { SummaryButtonEventType } from '../../enums';
import { IButtonDisplayConfig, ISummaryButtonEvent } from '../../interfaces';
import { SummaryCardService } from '../../services/summary-card.service';

export const BUTTON_DISPLAY_CONFIG = new InjectionToken('BUTTON_DISPLAY_CONFIG');

@Component({
  selector: 'apollo-summary-card-buttons',
  templateUrl: './summary-card-buttons.component.html',
  styleUrls: ['./summary-card-buttons.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SummaryCardButtonsComponent implements OnChanges {
  @Input() recordId = '';
  @Input() recordType = '';
  @Output() buttonClick = new EventEmitter<ISummaryButtonEvent>();

  // To keep the component 'responsive' and to effectively use 'OnPush', we'll use two different streams of data: the
  // record id (changed upon any inputs i.e. `ngOnChanges`) and the stream of summary card data from the service. If
  // either of these change then our streams used in the view will automatically and efficiently update, too.
  private recordId$ = new BehaviorSubject('');
  private actionableChanges$ = combineLatest([this.recordId$, this.summaryCardService.recordsSummaryCards$]).pipe(
    filter(([recordId]) => !!recordId)
  );

  // Use the record id and stream of wellbore log data above to determine what to show, also use `distinctUntilChanged`
  // in both so that we only re-render if the values actually change.
  public summaryCard$ = this.actionableChanges$
    .pipe(map(([recordId, summaryCardsMap]) => summaryCardsMap[recordId]))
    .pipe(distinctUntilChanged());
  public showLoader$ = this.actionableChanges$
    .pipe(map(([recordId, summaryCardsMap]) => summaryCardsMap[recordId] === undefined))
    .pipe(distinctUntilChanged());

  constructor(
    @Inject(BUTTON_DISPLAY_CONFIG)
    public readonly buttonDisplayConfig: IButtonDisplayConfig,
    public readonly summaryCardService: SummaryCardService
  ) {}

  getButtonsVisibility(buttonType: string) {
    return (
      (this.buttonDisplayConfig as any)[buttonType] === true ||
      ((this.buttonDisplayConfig as any)[buttonType] as Array<string>)
        .map((type) => type.toLowerCase())
        .includes(this.recordType.toLowerCase())
    );
  }

  get summaryButtonEventType(): typeof SummaryButtonEventType {
    return SummaryButtonEventType;
  }

  get documentsButtonTitle$(): Observable<string> {
    return this.summaryCard$.pipe(
      map(summaryCard => summaryCard?.documents?.count && summaryCard.documents.count > 1 ?
        `${summaryCard.documents.count} documents available in the details card` :
        'Open document')
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    const recordIdChanges = changes?.recordId ?? null;
    if (!recordIdChanges) {
      return;
    }
    const { currentValue, previousValue } = recordIdChanges;
    // If this component was recycled (i.e. in a virtual scroll list) and we had a previous value, let's be sure to tell
    // the service to drop or forget any possible lookup. This is non-breaking and serves as an opportunity to optimize.
    if (previousValue) {
      this.summaryCardService.forgetLookupOfRecordSummaryCard(previousValue);
    }
    // Only if the new value is valid or truthy do we want the service to lookup whether or not this wellbore has logs.
    if (currentValue) {
      this.summaryCardService.lookupRecordSummaryCard(currentValue);
    }
    // Pushing the new wellbore id into our `recordId$` stream will effectively re-render with cached data. If no cache
    // exists, it will wait for the service to lookup the actual log data (i.e. the wellboresWithLogs$ data stream.)
    this.recordId$.next(currentValue);
  }

  public onDocumentClick(): void {
    this.buttonClick.emit({
      recordId: this.recordId,
      eventType: SummaryButtonEventType.DOCUMENT
    });
  }

  public onWellLogClick(): void {
    this.buttonClick.emit({
      recordId: this.recordId,
      eventType: SummaryButtonEventType.WELL_LOG
    });
  }

  public on2dViewerClick(): void {
    this.buttonClick.emit({
      recordId: this.recordId,
      eventType: SummaryButtonEventType.SEISMIC_2D
    });
  }
}
