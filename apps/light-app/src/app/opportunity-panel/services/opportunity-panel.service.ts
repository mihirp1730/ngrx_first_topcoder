/* istanbul ignore file */

import {
  GisCanvas,
  GisCreateLayerService,
  GisMapDataService,
  GisMappedSearchResult,
  GisSearchResultService,
  IGisLayerMetadataSettings,
  SettingsService,
  query
} from '@slb-innersource/gis-canvas';
import { get, uniq, values } from 'lodash';

import { ConfigurationLoaderService } from '../../map-wrapper/services/configuration-loader.service';
import { IMlConnectionInfo } from '@apollo/app/services/opportunity';
import { Injectable } from '@angular/core';
import { MapLargeHelperService } from './maplarge-helper.service';
import { Observable } from 'rxjs';
import { WindowRef } from '@apollo/app/ref';
import { opportunitiesPageSize } from '../constants/opportunity-panel.constants';

@Injectable({
  providedIn: 'root'
})
export class OpportunityPanelService {
  private opportunities: any[] = [];

  constructor(
    public windowRef: WindowRef,
    private settingsService: SettingsService,
    private gisSearchResultService: GisSearchResultService,
    private mapDataService: GisMapDataService,
    private gisCreateLayerService: GisCreateLayerService,
    private mapLargeHelperService: MapLargeHelperService,
    private configurationService: ConfigurationLoaderService
  ) {}

  public getOpportunitiesOnLoad(connectionInfo: IMlConnectionInfo): Observable<any> {
    return new Observable<any>((subscriber) => {
      this.mapLargeHelperService.getOpportunitiesOnLoad(connectionInfo, this.getTableName()).subscribe((results) => {
        this.opportunities = [];
        const opportunityData = results['data'].data; // opportunity data
        const opportunityTotal = results['data'].totals.Records;
        for (let i = 0; i < opportunityTotal; i++) {
          const opportunity = {
            assetType: opportunityData['AssetType'][i],
            contractType: opportunityData['ContractType'][i],
            country: opportunityData.Country?.[i],
            deliveryType: opportunityData['DeliveryType'][i],
            duration: opportunityData['Duration'][i],
            offerEndDate: opportunityData['OfferEndDate'][i],
            offerStartDate: opportunityData['OfferStartDate'][i],
            offerType: opportunityData['OfferType'][i],
            phase: opportunityData['Phase'][i],
            opportunityId: opportunityData['OpportunityId'][i],
            opportunityName: opportunityData['OpportunityName'][i],
            opportunityType: opportunityData['OpportunityType'][i],
            vendorId: opportunityData['DataVendorId'][i],
            profileImage: opportunityData['ProfileImage'][i],
            recordId: opportunityData['recordId'][i]
          };
          if (
            opportunity.opportunityId &&
            this.opportunities.findIndex((item) => item.opportunityId === opportunity.opportunityId) === -1
          ) {
            this.opportunities.push(opportunity);
          }
        }
        subscriber.next({ opportunities: [...this.opportunities], totalOpportunities: opportunityTotal });
        subscriber.complete();
      });
    });
  }

  public getResultPanelOpportunityQueries(
    layers: IGisLayerMetadataSettings[],
    searchTerm?: string,
    whereClause?: any[],
    lassoSelection?: string[],
    page?: { start?: number; end?: number }
  ): JQueryPromise<any[]>[] {
    const maplarge = get(this.windowRef.nativeWindow, 'ml') as typeof ml;
    if (!maplarge) {
      return [];
    }

    const getOpportunitiesFromResponse = (res: any) => res;
    return uniq(values(layers))
      .map((layer) => {
        const lassoQuery = [];
        const shapeInfo = layer.attributes.find((item) => item.name === 'Shape');
        const layerName = shapeInfo.mapLargeAttribute;
        if (lassoSelection) {
          lassoSelection
            .filter((lasso) => !!lasso)
            .forEach((lassoPolygon) => {
              let test = `Overlaps`;
              if (
                (lassoPolygon?.toLowerCase()?.includes('point') || lassoPolygon?.toLowerCase()?.includes('circle')) &&
                (shapeInfo?.type === 'geo.dot' || shapeInfo?.type === 'geo.line')
              ) {
                const zoom = GisCanvas.getZoom(this.mapDataService.gisMapInstance);
                const lat = ml.data.drawing.WKT.parsePointLatLng(lassoPolygon).lat;
                const metersPerPixel = ((156543.03392 * Math.cos((lat * Math.PI) / 180)) / Math.pow(2, zoom)) * 10;
                test = `DWithin:${metersPerPixel}`;
              }
              lassoQuery.push({ col: layerName, test, value: `WKT(${lassoPolygon}),COL(${layerName})` });
            });
        }
        const startPosition = (page.start - 1) * opportunitiesPageSize;
        const takeCount = page?.end === -1 || lassoQuery?.length > 0 ? -1 : opportunitiesPageSize;

        return maplarge.data.query.getQueryFromJSON({
          table: {
            query: {
              attemptFlattening: true,
              where: [
                whereClause || [
                  {
                    col: '*',
                    test: 'Contains',
                    value: searchTerm || ''
                  }
                ]
              ],
              table: {
                query: {
                  sqlselect: ['*', 'OpportunityId'],
                  table: `${this.getTableName()}/Asset`
                }
              },
              take: -1,
              sqlselect: ['*', `${layer['mapLargeTable'].split('/')[1]}Count`, 'childTableOpportunityId'],
              join: {
                outer: true,
                method: 'Equals',
                table: {
                  query: {
                    groupby: ['OpportunityId'],
                    sqlselect: [
                      `OpportunityId.count as ${layer['mapLargeTable'].split('/')[1]}Count`,
                      layerName,
                      'OpportunityId as childTableOpportunityId'
                    ],
                    table: layer['mapLargeTable'],
                    where: lassoQuery
                  }
                },
                leftcolumn: 'OpportunityId',
                rightcolumn: 'childTableOpportunityId'
              }
            }
          },
          start: startPosition,
          take: takeCount,
          sqlselect: ['*', `${layer['mapLargeTable'].split('/')[1]}Count`, 'childTableOpportunityId'],
          groupby: ['OpportunityId'],
          orderby: ['LastPublishedDate.desc']
        } as unknown as query.Query);
      })
      .map((layerQuery) => layerQuery.runPromise())
      .map((layerPromise) => layerPromise.then(getOpportunitiesFromResponse));
  }

  public runMapLargeQuery(
    pageNumber?: { start?: number; end?: number },
    searchTerm?: string,
    whereClause?: any[],
    lassoSelection?: string[],
    selectedLayers?: string[]
  ) {
    return new Observable<any>((subscriber) => {
      let filteredLayers = this.settingsService.layersMetadata;
      if (selectedLayers?.length) {
        filteredLayers = this.settingsService.layersMetadata?.filter((element: any) => {
          return selectedLayers?.includes(element['mapLargeTable'].split('/')[1]);
        });
      }
      const queries = this.getResultPanelOpportunityQueries(uniq(filteredLayers), searchTerm, whereClause, lassoSelection, pageNumber);
      if (!queries.length) {
        subscriber.next({ opportunities: [], totalOpportunities: 0 });
        return;
      }
      // Run all the prepared MapLarge calls and return opportunities with data object count
      Promise.all(queries).then((results) => {
        this.opportunities = [];
        const opportunityData = results[0]['data'].data; // opportunity data
        const opportunityTotal = results[0]['data'].totals.Records;

        const pageSize = lassoSelection || pageNumber.end === -1 ? opportunityTotal : opportunitiesPageSize;
        const entityIcons = {};
        const displayNames = {};
        for (let i = 0; i < pageSize; i++) {
          const dataObjects = [];
          let isOpportunityFiltered = false;
          results.forEach((element) => {
            const opportunityChild = element['data'].data;
            if (opportunityChild.childTableOpportunityId[i] != '') {
              isOpportunityFiltered = true;
            }
            const tableName = element['query'].froms.query.join.table.query.table.split('/')[1].trim();
            let layerMetadata: IGisLayerMetadataSettings;
            if (!entityIcons[tableName]) {
              layerMetadata = this.settingsService.layersMetadata.find((metadata) => {
                return metadata['mapLargeTable'].includes(tableName);
              });
              entityIcons[tableName] = layerMetadata?.entityIcon;
              displayNames[tableName] = layerMetadata?.displayName === 'Opportunity' ? 'Asset' : layerMetadata?.displayName;
            }
            dataObjects.push({
              count: opportunityChild[`${tableName}Count`][i],
              name: displayNames[tableName],
              entityIcon: entityIcons[tableName]
            });
          });
          const opportunity = {
            assetType: opportunityData['AssetType'][i],
            contractType: opportunityData['ContractType'][i],
            country: opportunityData.Country?.[i],
            deliveryType: opportunityData['DeliveryType'][i],
            duration: opportunityData['Duration'][i],
            offerEndDate: opportunityData['OfferEndDate'][i],
            offerStartDate: opportunityData['OfferStartDate'][i],
            offerType: opportunityData['OfferType'][i],
            phase: opportunityData['Phase'][i],
            opportunityId: opportunityData['OpportunityId'][i],
            opportunityName: opportunityData['OpportunityName'][i],
            opportunityType: opportunityData['OpportunityType'][i],
            vendorId: opportunityData['DataVendorId'][i],
            profileImage: opportunityData['ProfileImage'][i],
            recordId: opportunityData['recordId'][i],
            dataObjects
          };
          if (isOpportunityFiltered && !!opportunity.opportunityId) {
            this.opportunities.push(opportunity);
          }
        }
        subscriber.next({ opportunities: [...this.opportunities], totalOpportunities: opportunityTotal });
        subscriber.complete();
      });
    });
  }

  public zoomToExtents(opportunityId: string) {
    this.opportunities = [];
    const getRowIndexQuery = ml.data.query.getQueryFromJSON({
      sqlselect: ['*', 'PhysicalRowIndex() as rowIndex'],
      table: `${this.getTableName()}/Asset`,
      where: [
        [
          {
            col: 'OpportunityId',
            test: 'Equal',
            value: opportunityId
          }
        ]
      ],
      take: -1
    });

    getRowIndexQuery.run((res) => {
      const result = res.data;
      for (const key in result) {
        if (Object.prototype.hasOwnProperty.call(result, key)) {
          result[key] = result[key][0];
        }
      }
      const config = this.settingsService.layersMetadata.find((e) => e.name === 'Opportunity');
      const layer = this.mapDataService.gisMapInstance.layers.find((e: { originalTableName: string }) => {
        return e.originalTableName === `${this.getTableName()}/Asset`;
      });
      const record = new GisMappedSearchResult(result, config, layer);
      this.gisSearchResultService.zoomToExtents(record);
    });
  }

  getCount(opportunityIds: any) {
    const maplarge = get(this.windowRef.nativeWindow, 'ml') as typeof ml;
    const getOpportunitiesFromResponse = (res: any) => res;
    if (maplarge)
      return uniq(values(this.settingsService.layersMetadata))
        .map((layers) => {
          return maplarge.data.query.getQueryFromJSON({
            table: {
              query: {
                groupby: ['OpportunityId'],
                sqlselect: [`OpportunityId.count as Count`, 'OpportunityId'],
                start: 0,
                table: {
                  name: `${layers['mapLargeTable']}`
                },
                take: -1,
                truncatestringellipsis: '',
                truncatestringlength: 0,
                where: [
                  [
                    {
                      col: 'OpportunityId',
                      test: 'EqualAny',
                      value: opportunityIds
                    }
                  ]
                ]
              }
            }
          } as query.Query);
        })
        .map((layerQuery) => layerQuery.runPromise())
        .map((layerPromise) => layerPromise.then(getOpportunitiesFromResponse));
  }

  getCountRunner(opportunityIds) {
    return new Observable<any[]>((subscriber) => {
      // Clearing out any previous value:
      const maplarge = get(this.windowRef.nativeWindow, 'ml') as typeof ml;
      if (!maplarge) {
        subscriber.next([]);
        subscriber.complete();
        return;
      } else {
        const queries = this.getCount(opportunityIds);
        if (!queries.length) {
          subscriber.next([]);
          return;
        }
        Promise.all(queries).then((results) => {
          const entityIcons = {};
          const displayNames = {};
          const response: { opportunityId: any; dataObjects: { count: any; name: any; entityIcon: any }[] }[] = [];
          results.forEach((item) => {
            const tableName = item['query'].froms.query.table.split('/')[1].trim();
            const opportunityData = item['data'].data; // opportunity data
            const opportunityTotal = item['data'].totals.Records;
            let layerMetadata: IGisLayerMetadataSettings;
            if (!entityIcons[tableName]) {
              layerMetadata = this.settingsService.layersMetadata.find((metadata) => {
                return metadata['mapLargeTable'].includes(tableName);
              });
              entityIcons[tableName] = layerMetadata?.entityIcon;
              displayNames[tableName] = layerMetadata?.displayName === 'Opportunity' ? 'Asset' : layerMetadata?.displayName;
            }
            for (let i = 0; i < opportunityTotal; i++) {
              const index = response.findIndex((opportunity) => opportunity.opportunityId === opportunityData['OpportunityId'][i]);
              const Object = {
                count: opportunityData['Count'][i],
                name: displayNames[tableName],
                entityIcon: entityIcons[tableName]
              };
              if (index > -1) {
                response[index].dataObjects.push(Object);
              } else {
                const object = {
                  opportunityId: opportunityData['OpportunityId'][i],
                  dataObjects: [Object]
                };
                response.push(object);
              }
            }
          });
          subscriber.next([...response]);
          subscriber.complete();
        });
      }
    });
  }

  getTableName(): string {
    const { data } = this.configurationService.MapLargeConfiguration;
    if (data.mapAccount) {
      return data.mapAccount;
    }
    return 'slb';
  }
}
