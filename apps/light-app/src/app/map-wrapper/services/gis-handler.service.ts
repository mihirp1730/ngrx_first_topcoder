import { Injectable } from '@angular/core';
import { AuthUser, IMapSettings } from '@apollo/api/interfaces';
import { LassoTool, LassoToolsService } from '@apollo/app/lasso-tools';
import { ICategory } from '@apollo/app/metadata';
import { SecureEnvironmentService } from '@apollo/app/secure-environment';
import { Store } from '@ngrx/store';
import {
  GisLayerPanelService,
  GisMapLargeService,
  GisMappedSearchResult,
  GisSearchResultActionService,
  GisSearchResultRecords,
  GisSearchResultService,
  IGisSettingsConfig
} from '@slb-innersource/gis-canvas';
import { GoogleAnalyticsService } from 'ngx-google-analytics';
import { Observable, Subject, Subscription } from 'rxjs';
import { filter, map, switchMap, tap } from 'rxjs/operators';

import * as opportunityPanelActions from '../../opportunity-panel/state/actions/opportunity-panel.actions';
import * as packageActions from '../../package/state/actions/package.actions';
import { AppActions } from '../enums';
import { cleanupLayers } from '../helpers/map-wrapper.helper';
import * as mapWrapperActions from '../state/actions/map-wrapper.actions';
import { GisLayerService } from './gis-layer.service';
import { MapWrapperService } from './map-wrapper.service';

export interface IGisSettings {
  config: IGisSettingsConfig;
  partition: string;
  appKey: string;
  deploymentUrl: string;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class GisHandlerService {
  public gisData: GisSearchResultRecords;
  public gisDataDetail: GisSearchResultRecords;
  public onSearchTerm: Subject<string> = new Subject<string>();

  constructor(
    public readonly store: Store,
    public readonly gisLayerService: GisLayerService,
    private secureEnvironmentService: SecureEnvironmentService,
    private mapWrapperService: MapWrapperService,
    private gisMapLargeService: GisMapLargeService,
    private gisSearchResultActionService: GisSearchResultActionService,
    private gisLayerPanelService: GisLayerPanelService,
    private lassoToolsService: LassoToolsService,
    private googleAnalyticsService: GoogleAnalyticsService,
    public readonly gisSearchResultService: GisSearchResultService
  ) {}

  configure(config: IMapSettings, user: AuthUser): IGisSettings {
    // We would put all of the IMapSettings into the store,
    // but the GisCanvas mutates the IGisSettingsConfig and
    // then breaks because of NgRx store immutability.
    this.store.dispatch(mapWrapperActions.newZoomToRadiusMap({ zoomToRadius: config.zoomToRadius }));
    // Construct gis settings
    return {
      config: config.gisCanvas,
      partition: this.secureEnvironmentService.secureEnvironment.xchange.mlAccount,
      appKey: this.secureEnvironmentService.secureEnvironment.app.key,
      deploymentUrl: this.secureEnvironmentService.secureEnvironment.map.deploymentUrl,
      token: user.gisToken
    };
  }

  setup(metadata: ICategory[], onLoad: (layers: any[]) => void, onError: () => void): Subscription {
    // Set metadata for the common component
    this.gisSearchResultActionService.setMetaData(metadata);
    // Add subscription to obtain available layers
    return this.gisMapLargeService.layersChange$.subscribe((layers) => {
      const _layers = cleanupLayers(layers);
      this.gisLayerService.gisLayers = this.gisLayerPanelService.initializeLayerPanel(_layers, metadata);
      onLoad(_layers);
    }, onError);
  }

  listen(onHasResults: () => void, onNonDetailResults: (record: any, layers: any) => void): Subscription {
    return this.gisSearchResultActionService.transformedData
      .pipe(switchMap((data) => this.getCurrentAppAction(data)))
      .subscribe(({ data, currentAction }) => {
        this.gisSearchResultService.isGroupMapExtent = true;
        if (data !== null) {
          if (data.recordsTotal === 1 && data.records[0].type !== 'Opportunity') {
            this.gisDataDetail = { ...data };
            onHasResults();
            this.store.dispatch(mapWrapperActions.openRecordDetailsFromSingleResult());
            this.googleAnalyticsService.gtag('event', 'select_item', {
              type: data.records[0].type,
              name: data.records[0].name,
              recordId: data.records[0].recordId
            });
            return;
          }

          if (currentAction !== AppActions.Detail) {
            this.gisData = { ...data };
            onNonDetailResults(data, this.gisSearchResultActionService.searchResultService.query);
          }

          // We may want to do something specific depending on the action
          if (currentAction === AppActions.MapSelection) {
            this.lassoToolsService.clearCurrentLasso();
          }

          onHasResults();
          if (currentAction === 1 || currentAction === 2) {
            this.generateGtagEvent(currentAction, data);
          }
          if (data.recordsTotal === 1 && data.records[0].type === 'Opportunity') {
            this.onSearchTerm.next('Opportunity');
          }

          this.store.dispatch(mapWrapperActions.openRecordResultsList());
        } else {
          this.gisData = data;
          this.gisDataDetail = data;
          onNonDetailResults(data, this.gisSearchResultActionService.searchResultService.query);
        }
      });
  }

  search(term: string, onNoLayers: () => void, onHasLayers: () => void): void {
    this.store.dispatch(mapWrapperActions.searchExecuted({ term }));
    if (this.isActionValid(onNoLayers)) {
      this.gisSearchResultActionService.getSearchResult(this.gisLayerService.gisLayers, term);
      this.mapWrapperService.updateCurrentAppAction(AppActions.Search);
      onHasLayers();
    }
  }

  clearSearch(callback: (styles: any, layers: any) => void) {
    this.store.dispatch(mapWrapperActions.closeSidepanel());
    // Clear results
    this.gisSearchResultActionService.closeSearchResult();
    // Clear map styles
    const initialStyleRules = this.gisMapLargeService.getInitialStyleRules();
    callback(initialStyleRules, this.gisMapLargeService.map.layers);
  }

  select(lassoType: LassoTool, onNoLayers: () => void, onHasLayers: () => void): void {
    const getResults = (results) => {
      this.store.dispatch(opportunityPanelActions.setSelectedOpportunityId({ opportunityId: null }));
      this.store.dispatch(opportunityPanelActions.setLassoSelection({ selectedLassoArea: results.wkt }));
      this.store.dispatch(mapWrapperActions.handleGisCanvasSelection({ spatialQuery: results.wkt }));
      if (this.isActionValid(onNoLayers)) {
        // We would want to put the 'results' into the store, but the
        // GisCanvas mutates the objects and runs into issues because
        // of NgRx's immutability.
        this.gisMapLargeService.wktSession = results;
        this.gisLayerService.selectionResults = results;
        this.gisSearchResultActionService.getSelectionResults(this.gisLayerService.gisLayers, results);
        this.mapWrapperService.updateCurrentAppAction(AppActions.MapSelection);
        onHasLayers();
      }
    };

    if (lassoType === LassoTool.NONE) {
      this.gisMapLargeService.drawingManager?.disable();
    } else if (lassoType === LassoTool.FREEHAND) {
      this.gisMapLargeService.drawLassoToSelect(false).subscribe(getResults);
    } else if (lassoType === LassoTool.RECTANGLE) {
      this.gisMapLargeService.drawRectangleToSelect(false).subscribe(getResults);
    } else if (lassoType === LassoTool.POLYGON) {
      this.gisMapLargeService.drawPolygonToSelect(false).subscribe(getResults);
    }
  }

  click(onNoLayers: () => void, onHasLayers: () => void): Subscription {
    return this.gisMapLargeService.onClickResult$
      .pipe(
        filter((r) => r !== null),
        tap((r) => {
          this.store.dispatch(opportunityPanelActions.setSelectedOpportunityId({ opportunityId: null }));
          this.store.dispatch(opportunityPanelActions.setLassoSelection({ selectedLassoArea: r.wkt }));
          this.store.dispatch(opportunityPanelActions.setGISMapClickSelection({ isShapeSelected: true }));
        })
      )
      .subscribe(() => {
        if (this.isActionValid(onNoLayers)) {
          this.gisSearchResultActionService.getSingleObjectSelection(
            this.gisLayerService.gisLayers,
            this.gisMapLargeService.singleObjectwktSession
          );
          this.mapWrapperService.updateCurrentAppAction(AppActions.MapSelection);
          onHasLayers();
        }
      });
  }

  inspect(record: GisMappedSearchResult): void {
    const recordInfo = { ...record };
    this.gisDataDetail = { records: [recordInfo], recordsTotal: 1, recordsTotalPerLayer: new Map().set('Packages', 1) };
    this.mapWrapperService.updateCurrentAppAction(AppActions.Detail);
    this.gisSearchResultActionService.detailRecord(this.gisLayerService.gisLayers, record);
  }

  back(callback: (layers: any[], wkt: string) => void) {
    this.store.dispatch(mapWrapperActions.openRecordResultsList());
    const { wkt: gisDataDetailWkt } = this.gisDataDetail.records[0];
    this.mapWrapperService.updateCurrentAppAction(this.mapWrapperService.previousAppAction);
    callback(this.gisMapLargeService.map.layers, gisDataDetailWkt);
  }

  resultClick(action: { actionName: string; record: GisMappedSearchResult }) {
    this.store.dispatch(packageActions.userNavigatedAwayFromPackage());
    this.gisSearchResultActionService.onButtonClick(action);
  }

  setZoom(width: number) {
    let zoom = 0;
    if (width > 1600) {
      zoom = 3;
    } else if (width > 1200) {
      zoom = 2;
    }
    this.gisMapLargeService.setZoom(zoom);
  }

  isActionValid(onNoLayers: () => void): boolean {
    const disabledLayers = this.gisSearchResultActionService.getDisableLayers(this.gisLayerService.gisLayers);
    if (!disabledLayers.length) {
      this.gisData = {
        records: [],
        recordsTotal: 0,
        recordsTotalPerLayer: new Map<string, number>()
      };
      onNoLayers();
      this.store.dispatch(mapWrapperActions.openRecordResultsList());
      this.lassoToolsService.clearCurrentLasso();
      return false;
    }
    return true;
  }

  private getCurrentAppAction(data: GisSearchResultRecords): Observable<{ data: GisSearchResultRecords; currentAction: AppActions }> {
    return this.mapWrapperService.getCurrentAppAction().pipe(
      map((currentAction) => ({
        data,
        currentAction
      }))
    );
  }

  private generateGtagEvent(appAction: AppActions, data) {
    let gaEvent = '';
    const gaParams = {};
    switch (appAction) {
      case 1:
        gaEvent = 'search';
        gaParams['searchTerm'] = this.gisSearchResultActionService.searchResultService.searchTerm;
        gaParams['recordsTotal'] = data.recordsTotal;
        break;
      case 2:
        gaEvent = 'map_select';
        gaParams['selectType'] = this.gisMapLargeService.singleObjectwktSession ? 'Click' : 'Polygon';
        gaParams['location'] = this.gisMapLargeService.singleObjectwktSession
          ? this.gisMapLargeService.singleObjectwktSession.value
          : this.gisMapLargeService.selectedWkt;
        gaParams['recordsTotal'] = data.recordsTotal;
        break;
    }
    this.googleAnalyticsService.gtag('event', gaEvent, gaParams);
  }
}
