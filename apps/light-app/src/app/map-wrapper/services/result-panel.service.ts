import { formatNumber } from '@angular/common';
import { Injectable } from '@angular/core';
import { WindowRef } from '@apollo/app/ref';
import { query } from '@slb-innersource/gis-canvas';
import { debounce, flatten, get, uniq } from 'lodash';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { distinctUntilChanged, map, switchMap } from 'rxjs/operators';

import { GetResultPanelPackageQueries } from '../helpers/map-wrapper.helper';

export interface State {
  gisCanvasLayers: { [layerName: string]: query.Query };
  packagesIds: string[];
  packagesTotal: number;
  records: any[];
  recordsTotal: number;
  showing: 'datalayers' | 'packages';
}

@Injectable({
  providedIn: 'root'
})
export class ResultPanelService {
  //
  // State:
  //
  private state: State = {
    gisCanvasLayers: {},
    packagesIds: [],
    packagesTotal: 0,
    records: [],
    recordsTotal: 0,
    showing: 'datalayers'
  };
  public state$ = new BehaviorSubject<State>(this.state);
  //
  // State selectors:
  //
  public records$ = this.state$.pipe(map(({ records }) => records)).pipe(distinctUntilChanged());
  public recordsTotal$ = this.state$.pipe(map(({ recordsTotal }) => recordsTotal)).pipe(distinctUntilChanged());
  public packagesIds$ = this.state$.pipe(map(({ packagesIds }) => packagesIds)).pipe(distinctUntilChanged());
  public packagesTotal$ = this.state$.pipe(map(({ packagesTotal }) => packagesTotal)).pipe(distinctUntilChanged());
  public showing$ = this.state$.pipe(map(({ showing }) => showing)).pipe(distinctUntilChanged());
  //
  // State selectors (deductions):
  //
  public showingDataLayers$ = this.showing$.pipe(map((showing) => showing === 'datalayers'));
  public showingPackages$ = this.showing$.pipe(map((showing) => showing === 'packages'));
  public totalMessage$ = combineLatest([this.showingDataLayers$, this.recordsTotal$, this.packagesTotal$])
    .pipe(
      map(([showingDataLayers, recordsTotal, packagesTotal]) => formatNumber(showingDataLayers ? recordsTotal : packagesTotal, 'en-US'))
    )
    .pipe(map((total) => `Showing ${total} result${total === '1' ? '' : 's'}`));
  //
  // State effects:
  //
  public packageIdLookUp = this.records$.pipe(switchMap(() => this.lookupPackageIds())).subscribe({
    next: (packagesIds) =>
      this.updateState({
        packagesIds,
        packagesTotal: packagesIds?.length ?? 0
      }),
    error: (error) => console.log({ error })
  });

  //
  private packages: { [projectId: string]: any } = {};
  private packages$$ = new BehaviorSubject<{ [projectId: string]: any }>(this.packages);
  public packages$ = this.packages$$.asObservable();

  private packagesToLookUp: { [projectId: string]: any } = {};

  private runMapLargeQueryDebounced = debounce(() => this.runMapLargeQuery(), 500);

  constructor(public readonly windowRef: WindowRef) {}

  public updateState(state: Partial<State>): State {
    this.state = {
      ...this.state,
      ...state
    };
    this.state$.next(this.state);
    return this.state;
  }

  public showDataLayers(): void {
    this.updateState({
      showing: 'datalayers'
    });
  }

  public showPackages(): void {
    this.updateState({
      showing: 'packages'
    });
  }

  private lookupPackageIds(): Observable<null | string[]> {
    return new Observable<string[]>((subscriber) => {
      // Clear out any previous value:
      subscriber.next(null);
      // Prepare all of the MapLarge calls:
      const maplarge = get(this.windowRef.nativeWindow, 'ml') as typeof ml;
      const queries = GetResultPanelPackageQueries(maplarge, this.state.gisCanvasLayers);
      // Run all the prepared MapLarge calls and return the unique package ids:
      Promise.all(queries).then((results) => {
        subscriber.next(uniq(flatten(results)));
        subscriber.complete();
      });
    });
  }

  private runMapLargeQuery() {
    const packageIds = Object.keys(this.packagesToLookUp).join('","');
    const packageIdsString = `"${packageIds}"`;
    this.packagesToLookUp = {};
    const mlQuery = ml.query();
    mlQuery.select('*');
    mlQuery.from('slb/DataPackage');
    mlQuery.where('DataPackageId', 'EqualAny', packageIdsString);
    mlQuery.run({
      callback: (data) => {
        for (let i = 0; i < data.totals.Records; i++) {
          const VendorId = data.data.VendorId[i];
          const VendorName = data.data.VendorName[i];
          const DataPackageId = data.data.DataPackageId[i];
          const DataPackageName = data.data.DataPackageName[i];
          const OnRequest = data.data.OnRequest[i];
          const Price = data.data.Price[i];
          const Duration = data.data.Duration[i];
          const Region = data.data.Region[i];
          const DataType = data.data.DataType[i];
          const Overview = data.data.Overview[i];
          this.packages[DataPackageId] = {
            VendorId,
            VendorName,
            DataPackageId,
            DataPackageName,
            OnRequest,
            Price,
            Duration,
            Region,
            DataType,
            Overview
          };
          this.packages$$.next(this.packages);
        }
      }
    });
  }

  public getCachedPackage(packageId: string): any {
    return this.packages[packageId] ?? null;
  }

  public lookupPackage(packageId: string): void {
    if (this.packagesToLookUp[packageId]) {
      return;
    }
    this.packagesToLookUp[packageId] = true;
    this.runMapLargeQueryDebounced();
  }

  public forgetLookupOfPackage(packageId: string): void {
    delete this.packagesToLookUp[packageId];
  }
}
