import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { IMarketingRepresentation } from '@apollo/api/interfaces';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';

import { ICategory, IOppotunitiesMetadata } from './app-metadata.interface';
import { countryList } from './country-list';

export const METADATA_SERVICE_API_URL = new InjectionToken<string>('MetadataServiceApiUrl');

@Injectable({
  providedIn: 'root'
})
export class MetadataService {

  private _metadata$: Observable<ICategory[]>;
  private _regions$: Observable<string[]>;
  private _marketingLayers$: Observable<IMarketingRepresentation[]>;
  private _opportunity$: Observable<string[]>;
  private _opportunitiesMetadata$: Observable<IOppotunitiesMetadata>;
  private _countryList$: Observable<string[]>;
  public assetTypesMetadata$: Observable<string[]> = this.opportunitiesMetadata$.pipe(map((res) => {
    return res.assetTypes;
  }));
  public contractTypesMetadata$: Observable<string[]> = this.opportunitiesMetadata$.pipe(map((res) => {
    return res.contractTypes;
  }));
  public deliveryTypesMetadata$: Observable<string[]> = this.opportunitiesMetadata$.pipe(map((res) => {
    return res.deliveryTypes;
  }));
  public offerTypesMetadata$: Observable<string[]> = this.opportunitiesMetadata$.pipe(map((res) => {
    return res.offerTypes;
  }));
  public phaseTypesMetadata$: Observable<string[]> = this.opportunitiesMetadata$.pipe(map((res) => {
    return res.phaseTypes;
  }));

  private readonly CACHE_SIZE = 1;

  constructor(
    private httpClient: HttpClient,
    @Inject(METADATA_SERVICE_API_URL) private readonly metadataServiceApi: string
  ) {}

  public getMetadataFromType(type: string): Promise<ICategory> {
    return this.metadata$.pipe(
      map((metadata: ICategory[]) => metadata.find((meta) => meta.name === type))
    ).toPromise();
  }

  public get metadata$(): Observable<ICategory[]> {

    if (!this._metadata$) {
      this._metadata$ = this.getLayerMetadataFromApi().pipe(
        shareReplay(this.CACHE_SIZE)
      );
    }

    return this._metadata$;

  }

  public get countryList$(): Observable<string[]> {
    if(!this._countryList$) {
      this._countryList$ = this.getCountryFromApi().pipe(
        shareReplay(this.CACHE_SIZE)
      );
    }
    return this._countryList$;
  }

  public get regions$(): Observable<string[]> {

    if (!this._regions$) {
      this._regions$ = this.getRegionsMetadataFromApi().pipe(
        shareReplay(this.CACHE_SIZE)
      );
    }

    return this._regions$;

  }

  public get marketingLayers$(): Observable<IMarketingRepresentation[]> {

    if (!this._marketingLayers$) {
      this._marketingLayers$ = this.getMarketingLayersMetadataFromApi().pipe(
        shareReplay(this.CACHE_SIZE)
      );
    }

    return this._marketingLayers$;

  }

  public get opportunity$(): Observable<string[]> {

    if (!this._opportunity$) {
      this._opportunity$ = this.getOpportunityFromApi().pipe(
        shareReplay(this.CACHE_SIZE)
      );
    }

    return this._opportunity$;

  }

  public get opportunitiesMetadata$(): Observable<IOppotunitiesMetadata> {
    if(!this._opportunitiesMetadata$) {
      this._opportunitiesMetadata$ = this.getOpportunitiesMetadataFromApi().pipe(
        shareReplay(this.CACHE_SIZE)
      );
    }
    return this._opportunitiesMetadata$;
  }

  private getLayerMetadataFromApi(): Observable<ICategory[]> {
    return this.httpClient.get<ICategory[]>(this.metadataServiceApi + '/layers').pipe(
      catchError(() => of([]))
    );
  }

  private getRegionsMetadataFromApi(): Observable<string[]> {
    return this.httpClient.get<string[]>(this.metadataServiceApi + '/regions').pipe(
      catchError(() => of([]))
    );
  }

  private getMarketingLayersMetadataFromApi(): Observable<IMarketingRepresentation[]> {
    return this.httpClient.get<IMarketingRepresentation[]>(`${this.metadataServiceApi}/marketing-layers`).pipe(
      catchError(() => of([]))
    );
  }

  private getOpportunityFromApi(): Observable<string[]> {
    return of(["Oil & Gas", "Wind", "Solar", "CCUS", "Geothermal", "Carbon Trading"]);
  }

  private getCountryFromApi(): Observable<string[]> {
    return of(countryList)
  }
  
  private getOpportunitiesMetadataFromApi(): Observable<IOppotunitiesMetadata | null> {
    return this.httpClient.get<IOppotunitiesMetadata>(this.metadataServiceApi + '/opportunities').pipe(
      catchError(() => of(null))
    );
  }

}
