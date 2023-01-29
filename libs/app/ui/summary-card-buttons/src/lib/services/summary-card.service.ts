import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { SummaryCardsResponse, SummaryCard } from '@apollo/api/discovery/summary-cards';
import { BehaviorSubject } from 'rxjs';

export const DISCOVERY_API_URL = new InjectionToken('DISCOVERY_API_URL');
const DISCOVERY_API_URL_NOT_PROVIDED = 'DISCOVERY_API_URL was not provided!';
export const SUMMARY_CARD_DEBOUNCE_FACTORY = new InjectionToken('SUMMARY_CARD_DEBOUNCE_FACTORY');

@Injectable()
export class SummaryCardService {
  // Keep a cache of record ids and if they have logs and offer a stream of values:
  private recordsSummaryCards: { [recordId: string]: SummaryCard | undefined } = {};
  private recordsSummaryCards$$ = new BehaviorSubject(this.recordsSummaryCards);
  public recordsSummaryCards$ = this.recordsSummaryCards$$.asObservable();

  // Handle variables for running queries:
  private recordsSummaryCardsToLookUp: { [recordId: string]: true } = {};
  private runQueryDebounced: () => void;

  constructor(
    public readonly httpClient: HttpClient,
    @Inject(DISCOVERY_API_URL)
    @Optional()
    public readonly discoveryApiUrl: string,
    @Inject(SUMMARY_CARD_DEBOUNCE_FACTORY)
    public readonly summaryCardDebounceFactory: (callback: () => void) => () => void
  ) {
    this.runQueryDebounced = this.summaryCardDebounceFactory(() => this.runQuery());
    /* istanbul ignore next */
    if (!this.discoveryApiUrl) {
      console.error(DISCOVERY_API_URL_NOT_PROVIDED);
    }
  }
  //run OSDU api query after debounce
  private runQuery(): void {
    /* istanbul ignore next */
    if (!this.discoveryApiUrl) {
      console.error(DISCOVERY_API_URL_NOT_PROVIDED);
      return;
    }
    const recordIds = Object.keys(this.recordsSummaryCardsToLookUp);
    const url = `${this.discoveryApiUrl}/summary-cards`;
    //eslint-disable-next-line
    const headers = {
      'Content-Type': 'application/json',
      'data-partition-id': recordIds[0].split(':')[0]
    };
    const body = {
      recordIds
    };
    this.recordsSummaryCardsToLookUp = {};
    this.httpClient.post<SummaryCardsResponse>(url, body, { headers }).subscribe((res) => {
      res.results.forEach(summaryCard => (this.recordsSummaryCards[summaryCard.recordId] = summaryCard));
      this.recordsSummaryCards$$.next(this.recordsSummaryCards);
    });
  }

  // This public method allows for queuing up a record log look-up. It is asynchronous, returning `void` and calling
  // the debounced `runQuery` method. This should be called by consumers who want to eventually pull data from the
  // `recordsSummaryCards$` data stream.
  public lookupRecordSummaryCard(recordId: string): void {
    // If we're already planning on looking the record up, skip:
    if (this.recordsSummaryCardsToLookUp[recordId]) {
      return;
    }
    // If the record has already been determined, skip:
    if (this.recordsSummaryCards[recordId] !== undefined) {
      return;
    }
    // Otherwise, add the record id to the lookup queue and try:
    this.recordsSummaryCardsToLookUp[recordId] = true;
    this.runQueryDebounced();
  }

  // This public method should be called by a consumer if they unload or simply no longer need the data from the
  // `recordsSummaryCards$` data stream.
  public forgetLookupOfRecordSummaryCard(recordId: string): void {
    delete this.recordsSummaryCardsToLookUp[recordId];
  }
}
