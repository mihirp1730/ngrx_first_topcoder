import { Component, Inject, InjectionToken, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { AuthUser, IMapSettings } from '@apollo/api/interfaces';
import { AuthCodeFlowService } from '@apollo/app/auth-codeflow';
import { DELFI_USER_CONTEXT } from '@apollo/app/delfi-gui-auth-config';
import { ICategory, MetadataService } from '@apollo/app/metadata';
import { SecureEnvironmentService } from '@apollo/app/secure-environment';
import { SettingsService } from '@apollo/app/settings';
import { ContextModel } from '@delfi-gui/components/lib/model/context.model';
import { Store } from '@ngrx/store';
import { GisLayerPanelService, GisMapLargeService, GisSearchResultActionService, IGisSettingsConfig } from '@slb-innersource/gis-canvas';
import { orderBy } from 'lodash';
import { Subscription, zip } from 'rxjs';

import { ShareDataService } from '../../../shared/services/share-data.service';
import { GisHandlerService } from '../../Services/gis-handler.service';
import * as opportunitySelectors from '../../state/selectors/opportunity.selectors';
import * as commonActions from '../../../shared/state/actions/common.actions';
import { AssetShapeFillStyle } from '../../../shared/state/common.state';

export const GISCANVAS_FACTORY = new InjectionToken('GISCANVAS_FACTORY');

export interface IGisSettings {
  config: IGisSettingsConfig;
  partition: string;
  appKey: string;
  deploymentUrl: string;
  token: string;
}
@Component({
  selector: 'apollo-opportunity-map-wrapper',
  templateUrl: './opportunity-map-wrapper.component.html',
  styleUrls: ['./opportunity-map-wrapper.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class OpportunityMapWrapperComponent implements OnInit, OnDestroy {
  billingAccountID = '';
  // Configuration needed for gis-canvas component
  public gisSettings: IGisSettings = {
    config: null,
    partition: null,
    appKey: null,
    deploymentUrl: null,
    token: null
  };
  // Keep all the configuration from settings service
  private config: IMapSettings;

  // GIS Canvas
  public gisLayers;
  public gisMapLayersInitiated = false;
  public showMapLoaderOverlay = true;
  public subscription = new Subscription();

  opportunityId;
  mapRepresentationIdList = [];
  gisWhereClause = [];
  hiddenLayers = [];
  hiddenMRs = [];
  mapRepresentationId$ = this.subscription.add(
    this.store.select(opportunitySelectors.deduceMapRepresentationIds).subscribe((data) => {
      this.mapRepresentationIdList = data;
      this.setGisLayers();
      return data;
    })
  );
  opportunityId$ = this.subscription.add(
    this.store.select(opportunitySelectors.selectCreatedOpportunityId).subscribe((id) => {
      this.opportunityId = id || '';
    })
  );
  hiddenLayers$ = this.subscription.add(
    this.store.select(opportunitySelectors.selectHiddenLayers).subscribe((layers) => {
      this.hiddenLayers = layers;
    })
  );
  hiddenMRs$ = this.subscription.add(
    this.store.select(opportunitySelectors.selectHiddenMRs).subscribe((mapReps) => {
      this.hiddenMRs = mapReps;
      this.setGisLayers();
    })
  );

  @Input() isGlobeOptionVisible: boolean;

  constructor(
    private metadataService: MetadataService,
    private settingsService: SettingsService,
    private secureEnvironmentService: SecureEnvironmentService,
    private authCodeFlowService: AuthCodeFlowService,
    public readonly gisHandlerService: GisHandlerService,
    private gisSearchResultActionService: GisSearchResultActionService,
    private gisMapLargeService: GisMapLargeService,
    private gisLayerPanelService: GisLayerPanelService,
    @Inject(DELFI_USER_CONTEXT) private readonly userContext: ContextModel,
    private shareDataService: ShareDataService,
    public readonly store: Store,
    @Inject(GISCANVAS_FACTORY) private readonly giscanvasFactory: any
  ) {
    this.billingAccountID = this.userContext.crmAccountId;
    if (sessionStorage.getItem('layerConfigSession')) {
      sessionStorage.removeItem('layerConfigSession');
    }
  }

  public ngOnInit(): void {
    // Get configuration to load the application
    this.subscription.add(
      zip(this.metadataService.metadata$, this.settingsService.getSettings(), this.authCodeFlowService.getUser()).subscribe(
        ([metadata, config, user]: [ICategory[], IMapSettings, AuthUser]) => {
          this.setMapConfiguration(metadata, config, user, true);
        }
      )
    );
    this.subscription.add(
      this.shareDataService.isMRCreated$.subscribe((isMRDone: boolean) => {
        if (isMRDone && this.opportunityId) {
          this.setGisLayers();
        }
      })
    );
  }

  private setMapConfiguration(metadata, config, user, mlDebug): void {
    this.gisSettings.partition = this.secureEnvironmentService.secureEnvironment.xchange.mlAccount;
    this.gisSettings.appKey = this.secureEnvironmentService.secureEnvironment.app.key;
    this.gisSettings.deploymentUrl = this.secureEnvironmentService.secureEnvironment.map.deploymentUrl;

    //updating table name
    this.updateTableNames(config, metadata);

    this.generateGisConfig(config, mlDebug);
    // Set metadata for the common component
    this.gisSearchResultActionService.setMetaData(metadata);

    // Set auth
    this.gisSettings.token = user.gisToken;

    //set asset type colors in store
    this.setAssetShapeFillStyle(config);

    this.subscription.add(
      this.gisMapLargeService.layersChange$.subscribe((layers) => {
        // Initialize layers configuration
        this.gisLayers = this.gisLayerPanelService.initializeLayerPanel(layers, metadata);

        // First try to pass the package id to avoid issues coming from package detail page
        this.setGisLayers();
      })
    );
  }

  private setAssetShapeFillStyle(config): void {
    const oppLayer = config?.gisCanvas.gisMap.layersConfiguration.find((layer) => layer.id === 'Opportunity');
    const assetShapeStyle: AssetShapeFillStyle[] = [];
    oppLayer.style.rules.forEach((rule) => {
      rule.where[0].forEach((type) => {
        assetShapeStyle.push({
          assetType: type.value,
          fillColor: rule.style.fillColor
        });
      });
    });
    this.store.dispatch(commonActions.saveAssetShapeFillStyle({ assetShapeFillStyles: assetShapeStyle }));
  }

  public updateTableNames(config, metadata) {
    config.gisCanvas?.gisMap.layersConfiguration.forEach((layer) => {
      const tableName = layer.tableInfo.table.name.split('/')[1];
      layer.tableInfo.table.name = `${this.billingAccountID}/${tableName}`;
      // in order to stop the maplarge query error due to wrong column name
      layer.tableInfo.where = [[{ col: 'mapRepresentationId', test: 'Equal', value: 'null' }]];
    });
    metadata.forEach((layer) => {
      const tableName = layer.mapLargeTable.split('/')[1];
      layer.mapLargeTable = `${this.billingAccountID}/${tableName}`;
    });
  }

  private generateGisConfig(config: IMapSettings, mlDebug: boolean) {
    this.config = {
      ...config,
      gisCanvas: {
        ...config.gisCanvas,
        mlControls: mlDebug,
        gisOnloadHiddenLayers: false
      }
    };
    this.gisSettings.config = this.config.gisCanvas;
  }

  private setGisLayers(): void {
    this.gisQueryWhereClause();
    this.giscanvasFactory().showGisIndecator('isBusyIndicator');
    this.gisLayers = this.gisLayers?.map((layer: any) => {
      return {
        ...layer,
        filter: {
          ...layer.filter,
          isAnyAttributeSelected: true
        },
        originalOptions: {
          ...layer.originalOptions,
          query: {
            ...layer.originalOptions.query,
            where: this.gisWhereClause
          }
        }
      };
    });
    this.gisLayers = orderBy(this.gisLayers, ['originalOptions.zIndex']);
    setTimeout(
      () => {
        this.subscription.add(
          this.gisMapLargeService.reloadLayers(this.gisLayers?.map((l) => l.originalOptions)).subscribe(() => {
            this.giscanvasFactory().hideGisIndecator('isBusyIndicator');

            this.gisMapLargeService.map?.layers.forEach((element) => {
              if (this.hiddenLayers.indexOf(element.originalOptions.name) > -1) {
                element.hide();
              }
            });

            this.gisMapLargeService.map?.zoomToExtents();
          })
        );
      },
      this.opportunityId ? 2000 : 0
    );
  }

  gisQueryWhereClause() {
    this.gisWhereClause = [];
    if (this.mapRepresentationIdList.length) {
      this.mapRepresentationIdList.forEach((mapRepresentationId) => {
        if (this.hiddenMRs.findIndex((mr) => mr.mapRepresentationId === mapRepresentationId) === -1) {
          const isClausePresent = this.gisWhereClause.find((element) => {
            return element[0].value === mapRepresentationId;
          });
          if (!isClausePresent) {
            this.gisWhereClause.push([{ col: 'mapRepresentationId', test: 'EqualAny', value: mapRepresentationId }]);
          }
        }
      });
    }

    if (!this.gisWhereClause.length) {
      this.gisWhereClause = [[{ col: 'mapRepresentationId', test: 'Equal', value: 'null' }]];
    }
    return this.gisWhereClause;
  }

  public onZoomToWorldView(): void {
    this.gisHandlerService.setZoom(window.innerWidth);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
