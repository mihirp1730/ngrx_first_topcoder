import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthUser, IMapConfiguration, IMapSettings } from '@apollo/api/interfaces';
import { AuthCodeFlowService } from '@apollo/app/auth-codeflow';
import { FeatureFlagService, FeaturesEnum } from '@apollo/app/feature-flag';
import { LassoTool, LassoToolsService } from '@apollo/app/lasso-tools';
import { ICategory } from '@apollo/app/metadata';
import { PERFORMANCE_INDICATOR, PerformanceIndicatorService } from '@apollo/app/performance';
import { CommunicationService } from '@apollo/app/services/communication';
import { LassoPersistenceService } from '@apollo/app/services/lasso-persistence';
import { IOpportunitiesDetails } from '@apollo/app/services/opportunity-attendee';
import { Store } from '@ngrx/store';
import {
  GisCanvasComponent,
  GisMappedSearchResult,
  GisSearchBoxService,
  GisSearchResultComponent,
  GisSearchResultRecords,
  GisTooltipComponent,
  GisTopToolbarService
} from '@slb-innersource/gis-canvas';
import { IGisLayer } from '@slb-innersource/gis-canvas/gis-canvas-widget/gis-canvas-widget-components/gis-canvas-core/gis-layer-panel/gis-layer-panel.model';
import { onTooltipButtonAction } from '@slb-innersource/gis-canvas/gis-canvas-widget/gis-tooltip-button/gis-tooltip-button.component';
import { Observable, Subscription } from 'rxjs';
import { debounceTime, filter, map, mergeMap, take } from 'rxjs/operators';

import * as opportunityPanelActions from '../opportunity-panel/state/actions/opportunity-panel.actions';
import * as opportunityPanelSelector from '../opportunity-panel/state/selectors/opportunity-panel.selectors';
import * as opportunityAttendeeSelector from '../opportunity/state/selectors/opportunity-attendee.selectors';
import * as packageActions from '../package/state/actions/package.actions';
import * as packageSelectors from '../package/state/selectors/package.selectors';
import { SidePanelViews } from './enums';
import { GetGisDataDetailProperty, removeAllHighlightStyles, removeDetailStyle } from './helpers/map-wrapper.helper';
import { ConfigurationLoaderService } from './services/configuration-loader.service';
import { GisHandlerService, IGisSettings } from './services/gis-handler.service';
import { ResultPanelService } from './services/result-panel.service';
import * as mapWrapperActions from './state/actions/map-wrapper.actions';
import * as mapWrapperSelectors from './state/selectors/map-wrapper.selectors';

// GisHandlerService: we provide the component its own GisHandler instance because
//   both this component and the GisHandler service must use the same injected
//   GisSearchResultActionService, otherwise the gis-canvas and other map-wrapper
//   components get out of sync. The gis service needs to be provided in the root
//   before we can remove this providers. Please find the associated pull-request
//   for more information:
//   https://dev.azure.com/slb-swt/delfi-exploration/_git/apollo/pullrequest/288659
const providers = [GisHandlerService];

@Component({
  selector: 'apollo-map-wrapper',
  templateUrl: './map-wrapper.component.html',
  styleUrls: ['./map-wrapper.component.scss', 'map-wrapper.component.extn.scss'],
  providers
})
export class MapWrapperComponent implements OnInit, OnDestroy {
  @ViewChild('canvasEl') canvasElement: GisCanvasComponent;
  @ViewChild(GisSearchResultComponent) gisSearchResultPanel: GisSearchResultComponent;

  public subscriptions: Subscription = new Subscription();
  public user: AuthUser;
  opportunityDetails: IOpportunitiesDetails;
  public menuOptions;

  // data-object variables
  public isMapExpanded = true;
  public isOpportunityExpanded = false;
  public showHeader = false;
  public isModularChatOpen = false;

  // Feature Flags
  public dataPackageWorkflow$: Observable<boolean>;
  public dataOpportunityWorkflow$: Observable<boolean>;

  // Configuration needed for gis-canvas component
  public gisSettings: IGisSettings = {
    config: null,
    partition: null,
    appKey: null,
    deploymentUrl: null,
    token: null
  };

  // map-wrapper selectors:
  public currentSidepanel$ = this.store.select(mapWrapperSelectors.deduceCurrentSidepanel);
  public showSearchBar$ = this.store.select(mapWrapperSelectors.deduceShowSearchBar);
  public showSidepanel$ = this.store.select(mapWrapperSelectors.deduceShowSidepanel);
  public searchTerm$ = this.store.select(mapWrapperSelectors.selectSearchTerm);
  public showBasemap$ = this.store.select(mapWrapperSelectors.selectShowingBasemap);
  public selectedOpportunityId$ = this.store.select(mapWrapperSelectors.selectSelectedOpportunityId);
  public selectedOpportunityOnPanel$ = this.store.select(opportunityPanelSelector.selectedOpportunityId);
  public selectShowingHamburgerMenu$ = this.store.select(mapWrapperSelectors.selectShowingHamburgerMenu);

  // opportunity attendee selectors
  public isMsgPanelOpen$ = this.store.select(opportunityAttendeeSelector.selectOpenModularChat);

  // package selectors:
  public profileSelected$ = this.store.select(packageSelectors.deduceHasProfileSelected);
  public selectedProfileId$ = this.store.select(packageSelectors.selectSelectedProfileId);

  // opportunity panel selectors
  public opportunitiesFetched$ = this.store.select(opportunityPanelSelector.selectOpportunities);
  public oppPanelSearchTerm$ = this.store.select(opportunityPanelSelector.selectSearchTerm);
  public lassoSelectionArea$ = this.store.select(opportunityPanelSelector.selectLassoArea);
  public filteredOpportunities$ = this.store.select(opportunityPanelSelector.selectFilteredOpportunities);
  public isMapLoaded$ = this.store.select(opportunityPanelSelector.selectIsMapLoaded);

  // UI variables
  public sidePanelViews = SidePanelViews;
  public hasResults = false;
  public gisMapLayersInitiated = false;
  public showMapLoaderOverlay = true;
  public isGuest$ = this.authCodeFlowService.getUser().pipe(map((user) => user.isGuest));

  public countCountLabel = 'Messages';
  constructor(
    public readonly toptoolbarService: GisTopToolbarService,
    public readonly gisHandlerService: GisHandlerService,
    public readonly resultPanelService: ResultPanelService,
    public readonly communicationService: CommunicationService,
    public readonly store: Store,
    private featureFlagService: FeatureFlagService,
    private configurationLoaderService: ConfigurationLoaderService,
    private performanceIndicatorService: PerformanceIndicatorService,
    private authCodeFlowService: AuthCodeFlowService,
    private router: Router,
    private gisSearchBoxService: GisSearchBoxService,
    private lassoPersistenceService: LassoPersistenceService,
    private lassoToolsService: LassoToolsService
  ) {
    this.menuOptions = [
      {
        id: 'opportunities',
        name: 'Opportunities',
        tooltip: 'Go to opportunities dashboard',
        link: '/opportunity/dashboard'
      },
      {
        id: 'messages',
        name: this.countCountLabel,
        tooltip: 'Go to Messages',
        link: '/communication'
      },
      {
        id: 'requests',
        name: 'Requests',
        tooltip: 'Go to Requests',
        link: '/opportunity/requests'
      }
    ];
    this.store.dispatch(mapWrapperActions.openMapWrapperComponent());
  }

  public ngOnInit(): void {
    this.dataPackageWorkflow$ = this.featureFlagService.featureEnabled(FeaturesEnum.dataPackageWorkflow);
    this.dataOpportunityWorkflow$ = this.featureFlagService.featureEnabled(FeaturesEnum.dataOpportunityWorkflow);
    //for modular chat
    this.subscriptions.add(
      this.store
        .select(opportunityAttendeeSelector.selectOpportunities)
        .pipe(filter((opp) => opp.length > 0))
        .subscribe((opportunities) => {
          //select opportunity details
          this.opportunityDetails = opportunities[opportunities.length - 1];
        })
    );

    this.subscriptions.add(
      this.authCodeFlowService
        .getUser()
        .pipe(
          mergeMap((user) => {
            return this.communicationService.getChatThreads(user.email);
          })
        )
        .subscribe(() => {
          this.countCountLabel = `Messages(${this.communicationService.getChatCount()})`;
          this.menuOptions.map((options) => {
            if (options.id == 'messages') {
              options.name = this.countCountLabel;
            }
            return options;
          });
        })
    );
    this.subscriptions.add(
      this.dataPackageWorkflow$.subscribe((flag) => {
        if (flag) {
          this.menuOptions.unshift({
            id: 'subscriptions',
            name: 'My Subscriptions',
            tooltip: 'Go to my subscriptions dashboard',
            link: '/subscriptions',
            action: () => {
              this.authCodeFlowService.signIn('subscriptions');
            }
          });
        }
      })
    );
    this.subscriptions.add(
      this.dataOpportunityWorkflow$.subscribe((flag) => {
        if (flag) {
          this.isMapExpanded = false;
          this.filteredOpportunities$.subscribe((opportunity) => {
            if (opportunity?.length) {
              this.isMapExpanded = false;
            }
          });
          this.oppPanelSearchTerm$.subscribe((term) => {
            this.gisSearchBoxService.setKeyword(term);
          });
        }
      })
    );
    // Get configuration to load the application
    this.setup();
    this.initGisHandlers();

    this.store.dispatch(opportunityPanelActions.getMlConnectionInfo());

    this.resultPanelService.updateState({
      showing: 'datalayers'
    });
    this.subscriptions.add(
      this.gisHandlerService.onSearchTerm.pipe(debounceTime(1000)).subscribe(() => {
        if (this.gisSearchResultPanel && this.gisHandlerService.gisData.recordsTotal == 1) {
          this.gisSearchResultPanel.showNoMatchingResults = true;
          this.gisSearchResultPanel.processGroupResult();
        }
      })
    );
    this.subscriptions.add(
      this.selectShowingHamburgerMenu$.pipe(debounceTime(1000)).subscribe((showingHamburgerMenu) => {
        if (!showingHamburgerMenu) {
          this.processSingleGroupResult();
        }
      })
    );
    this.subscriptions.add(
      this.isMsgPanelOpen$.subscribe((openChat) => {
        this.isModularChatOpen = openChat;
      })
    );
  }

  public processSingleGroupResult() {
    // The fix is to override gis map's default implementation to show single result
    if (
      this.gisSearchResultPanel &&
      this.gisHandlerService.gisData.recordsTotal == 1 &&
      this.gisHandlerService.gisData.records[0].type === 'Opportunity'
    ) {
      this.gisSearchResultPanel.showNoMatchingResults = true;
      this.gisSearchResultPanel.processGroupResult();
    }
  }

  public gotoPackageDetailsFromDataLayer(): void {
    const dataPackageIdProperty = GetGisDataDetailProperty(this.gisHandlerService.gisDataDetail, 'DataPackageId');
    if (dataPackageIdProperty?.value) {
      const { value: id } = dataPackageIdProperty;
      this.router.navigate([`/packages/${id}`]);
    }
  }

  public gotoPackageDetailsFromPkgs(id: string): void {
    this.router.navigate([`/packages/${id}`]);
  }

  public layersHaveLoaded(): void {
    this.gisMapLayersInitiated = true;
    // With gisMapLayersInitiated above set to true, give some time below before removing the overlay.
    setTimeout(() => {
      this.showHeader = true;
      this.showMapLoaderOverlay = false;
      this.store.dispatch(mapWrapperActions.handleGisCanvasLoadedLayers());
      this.dataOpportunityWorkflow$.subscribe((flag) => {
        if (flag) {
          this.store.dispatch(opportunityPanelActions.isMapLoaded({ isMapLoaded: true }));
        }
      });
    }, 1000);
  }

  private enableTooTip(): void {
    this.toptoolbarService.tooltipAction.next(onTooltipButtonAction.ENABLE_TOOLTIP);
  }

  public showDataLayers(): void {
    this.resultPanelService.showDataLayers();
    this.store.dispatch(packageActions.userNavigatedAwayFromPackage());
  }

  public showPackages(): void {
    this.resultPanelService.showPackages();
    this.store.dispatch(packageActions.userNavigatedAwayFromPackage());
  }

  //#region Search bar
  public onSearchInfo(term: string): void {
    this.gisHandlerService.search(term, this.clearResultsPanelState.bind(this), () => {
      this.resultPanelService.updateState({ showing: 'datalayers' });
      this.hasResults = true;
    });
  }

  public onClearInfo(): void {
    this.gisHandlerService.clearSearch((styles: any, layers: any) => {
      removeAllHighlightStyles(styles, layers);
      this.hasResults = false;
    });
  }

  public onShowLayers(): void {
    this.store.dispatch(mapWrapperActions.showLayerPanel());
  }

  public onToggleMenu(): void {
    this.hasResults = true;
    this.store.dispatch(mapWrapperActions.toggleHamburgerMenu());
  }
  //#endregion

  //#region Layers panel
  public onToggleLayerVisibility(): void {
    this.store.dispatch(mapWrapperActions.changeLayerOrFilter());
  }

  public onFilterChange(layer: IGisLayer, forceRefresh: boolean): void {
    this.store.dispatch(mapWrapperActions.filterAttributeValuesUpdated({ layerName: layer.name, forceRefresh }));
  }

  public onToolBarAction(action: string): void {
    if (action === 'Close') {
      this.store.dispatch(mapWrapperActions.handleGisCanvasToolBarAction({ action }));
    } else if (action === 'Back') {
      // Until we're state-driven here, call 'isActionValid' to automatically
      // check for disabled layers and clear the results panel if all layers
      // are disabled.
      this.gisHandlerService.isActionValid(this.clearResultsPanelState.bind(this));
      this.store.dispatch(mapWrapperActions.handleGisCanvasToolBarAction({ action }));
      this.store.dispatch(mapWrapperActions.resetLayersAndFilters());
    } else if (action === 'Toggled') {
      this.store.dispatch(mapWrapperActions.changeLayerOrFilter());
    } else if (action === 'Cleared') {
      this.store.dispatch(mapWrapperActions.changeLayerOrFilter());
    }
  }
  //#endregion

  //#region Lasso tools
  public onZoomToWorldView(): void {
    this.gisHandlerService.setZoom(window.innerWidth);
  }

  public onLassoSelection(lassoType: LassoTool): void {
    this.gisHandlerService.select(lassoType, this.clearResultsPanelState.bind(this), () => {
      this.resultPanelService.updateState({ showing: 'datalayers' });
      this.performanceIndicatorService.startTiming(PERFORMANCE_INDICATOR.apolloMapSelectionTime);
      this.hasResults = true;
      this.onCloseOpportunityDetails();
    });
  }
  //#endregion

  //#region Result panel
  public onBackToPreviousResults() {
    this.store.dispatch(mapWrapperActions.handleGisCanvasBackToPreviousResults());
  }

  public onButtonClick(action: { actionName: string; record: GisMappedSearchResult }): void {
    this.gisHandlerService.resultClick(action);
  }

  public onDetailRecordId(record: GisMappedSearchResult): void {
    const records = { records: [record] } as GisSearchResultRecords;
    const isOpportunity = record.type.toLowerCase() === 'opportunity';
    if (isOpportunity) {
      this.store.dispatch(
        mapWrapperActions.setSelectedOpportunityId({
          opportunityId: GetGisDataDetailProperty(records, 'OpportunityId')?.value || null,
          record
        })
      );
    }

    const id = GetGisDataDetailProperty(records, 'DataPackageId')?.value;
    if (id) {
      const opportunityType = GetGisDataDetailProperty(records, 'OpportunityType')?.value?.toLowerCase();
      if (opportunityType === 'public') {
        this.store.dispatch(packageActions.userSelectedPackage({ id }));
      } else if (opportunityType === 'partially public') {
        this.store.dispatch(packageActions.userSelectedNonpublicPackage({ id }));
      } else {
        this.gisHandlerService.inspect(record);
      }
    }
  }
  //#endregion

  //#region Detail panel
  public onBackToPreviousDetail(): void {
    this.gisHandlerService.back(removeDetailStyle);
  }
  //#endregion

  private setup(): void {
    this.configurationLoaderService.load(
      (metadata: ICategory[], config: IMapSettings, user: AuthUser, mlDebug: boolean, mapLargeConfiguration: IMapConfiguration): void => {
        this.user = user;
        this.configurationLoaderService.MapLargeConfiguration = mapLargeConfiguration;
        this.gisSettings = this.gisHandlerService.configure(
          {
            ...config,
            gisCanvas: {
              ...config.gisCanvas,
              mlControls: mlDebug,
              gisOnloadHiddenLayers: false,
              gisMap: {
                ...config.gisCanvas.gisMap,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                layersMetadataConfiguration: metadata as any
              },
              gisTooltip: {
                disabled: false,
                component: GisTooltipComponent
              }
            }
          },
          user
        );

        this.subscriptions.add(
          this.gisHandlerService.setup(
            metadata,
            (layers: any[]) => {
              if (layers.length) {
                this.layersHaveLoaded();
              }
              this.performanceIndicatorService.endTiming(PERFORMANCE_INDICATOR.gaiaLightLoadTime);
            },
            () => this.performanceIndicatorService.cleanRecord(PERFORMANCE_INDICATOR.gaiaLightLoadTime)
          )
        );
      }
    );
  }

  private initGisHandlers(): void {
    this.subscriptions.add(
      this.gisHandlerService.listen(
        (): void => {
          this.hasResults = true;
        },
        (data: any, layers: any): void => {
          this.resultPanelService.updateState({
            gisCanvasLayers: layers,
            packagesIds: null,
            packagesTotal: 0,
            records: data?.records ?? [],
            recordsTotal: data?.recordsTotal ?? 0
          });
        }
      )
    );

    this.subscriptions.add(
      this.gisHandlerService.click(this.clearResultsPanelState.bind(this), () => {
        this.performanceIndicatorService.startTiming(PERFORMANCE_INDICATOR.apolloMapSelectionTime);
        this.hasResults = true;
        this.onCloseOpportunityDetails();
      })
    );
  }

  private clearResultsPanelState(): void {
    this.resultPanelService.updateState({
      gisCanvasLayers: {},
      showing: 'datalayers',
      packagesIds: null,
      packagesTotal: 0,
      records: [],
      recordsTotal: 0
    });
  }

  public redirectToLogin(): void {
    this.authCodeFlowService.signIn();
  }

  onCloseOpportunityDetails() {
    this.store.dispatch(
      mapWrapperActions.setSelectedOpportunityId({
        opportunityId: null
      })
    );
  }

  public toggleBasemap(): void {
    this.store.dispatch(mapWrapperActions.toggleBasemap());
  }

  // data-object functions
  public toggleMap() {
    this.isMapExpanded = !this.isMapExpanded;
  }

  public toggleOpportunity() {
    this.isOpportunityExpanded = !this.isOpportunityExpanded;
  }

  public onAttributeFilterChange(layer: IGisLayer) {
    this.onFilterChange(layer, false);
  }

  public clearLassoSelection() {
    this.store.dispatch(opportunityPanelActions.setLassoSelection({ selectedLassoArea: '' }));
    this.store.dispatch(opportunityPanelActions.setGISMapClickSelection({ isShapeSelected: false }));
    this.lassoPersistenceService.clearLassoShape();
    this.lassoToolsService.updateCurrentLasso(LassoTool.NONE);
  }

  ngOnDestroy() {
    this.onCloseOpportunityDetails();
    this.subscriptions.unsubscribe();
  }
}
