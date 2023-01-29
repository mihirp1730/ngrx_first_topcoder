import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthUser, ICategory, IMapSettings } from '@apollo/api/interfaces';
import { AuthCodeFlowService } from '@apollo/app/auth-codeflow';
import { FeatureFlagService } from '@apollo/app/feature-flag';
import { LassoTool } from '@apollo/app/lasso-tools';
import { PERFORMANCE_INDICATOR, PerformanceIndicatorService } from '@apollo/app/performance';
import { CommunicationService } from '@apollo/app/services/communication';
import { ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import {
  GisMappedSearchResult,
  GisSearchBoxService,
  GisSearchResultRecords,
  GisTooltipComponent,
  GisTopToolbarService
} from '@slb-innersource/gis-canvas';
import { IGisLayer } from '@slb-innersource/gis-canvas/gis-canvas-widget/gis-canvas-widget-components/gis-canvas-core/gis-layer-panel/gis-layer-panel.model';
import { v4 as uuid } from 'uuid';

import * as opportunityPanelSelectors from '../opportunity-panel/state/selectors/opportunity-panel.selectors';
import * as packageActions from '../package/state/actions/package.actions';
import {
  mockAuthCodeFlowService,
  mockCommunicationService,
  mockConfigurationLoaderService,
  mockFeatureFlagService,
  mockGisHandlerService,
  mockGisSearchBoxService,
  mockGisTopToolbarService,
  mockPerformanceIndicatorService,
  mockResultPanelService,
  mockRouter
} from '../shared/services.mock';
import * as mapWrapperHelper from './helpers/map-wrapper.helper';
import { MapWrapperComponent } from './map-wrapper.component';
import { ConfigurationLoaderService } from './services/configuration-loader.service';
import { GisHandlerService } from './services/gis-handler.service';
import { ResultPanelService } from './services/result-panel.service';
import * as mapWrapperActions from './state/actions/map-wrapper.actions';

describe('MapWrapperComponent', () => {
  let component: MapWrapperComponent;
  let mockStore: MockStore;
  let fixture: ComponentFixture<MapWrapperComponent>;

  beforeEach(async () => {
    TestBed.overrideComponent(MapWrapperComponent, {
      set: {
        providers: [
          {
            provide: GisHandlerService,
            useValue: mockGisHandlerService
          },
          {
            provide: AuthCodeFlowService,
            useValue: mockAuthCodeFlowService
          },
          {
            provide: Router,
            useValue: mockRouter
          },
          {
            provide: GisTopToolbarService,
            useValue: mockGisTopToolbarService
          },
          {
            provide: CommunicationService,
            useValue: mockCommunicationService
          },
          {
            provide: FeatureFlagService,
            useValue: mockFeatureFlagService
          },
          {
            provide: GisSearchBoxService,
            useValue: mockGisSearchBoxService
          }
        ]
      }
    });
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        // provideMockStore(),
        provideMockStore({
          selectors: [
            {
              selector: opportunityPanelSelectors.selectOpportunities,
              value: [{}]
            }
          ]
        }),
        {
          provide: ConfigurationLoaderService,
          useValue: mockConfigurationLoaderService
        },
        {
          provide: PerformanceIndicatorService,
          useValue: mockPerformanceIndicatorService
        },
        {
          provide: ResultPanelService,
          useValue: mockResultPanelService
        }
      ],
      declarations: [MapWrapperComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MapWrapperComponent);
    mockStore = TestBed.inject(Store) as MockStore;
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('gotoPackageDetailsFromPkgs', () => {
    it('should dispatch userSelectedPackage', () => {
      const id = uuid();
      const spy = jest.spyOn(mockRouter, 'navigate').mockImplementation();
      component.gotoPackageDetailsFromPkgs(id);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('showDataLayers', () => {
    it('should dispatch userNavigatedAwayFromPackage', () => {
      const spy = jest.spyOn(mockStore, 'dispatch').mockImplementation();
      component.showDataLayers();
      expect(spy).toHaveBeenCalledWith(packageActions.userNavigatedAwayFromPackage());
    });
  });

  describe('showPackages', () => {
    it('should dispatch userNavigatedAwayFromPackage', () => {
      const spy = jest.spyOn(mockStore, 'dispatch').mockImplementation();
      component.showPackages();
      expect(spy).toHaveBeenCalledWith(packageActions.userNavigatedAwayFromPackage());
    });
  });

  it('should hide loading screen', fakeAsync(() => {
    component.gisMapLayersInitiated = false;
    component.showMapLoaderOverlay = true;
    component.layersHaveLoaded();
    expect(component.gisMapLayersInitiated).toBeTruthy();
    tick(2000);
    expect(component.showMapLoaderOverlay).toBeFalsy();
  }));

  it('should call on search info', () => {
    const term = 'test';
    mockGisHandlerService.search.mockImplementation((_1, _2, callBackUnderTest) => callBackUnderTest());
    component.onSearchInfo(term);
    expect(component.hasResults).toBeTruthy();
  });

  it('should call on clear info', () => {
    mockGisHandlerService.clearSearch.mockImplementation((callback) => callback({}, 'layers'));
    component.hasResults = null;
    component.onClearInfo();
    expect(component.hasResults).toBe(false);
    expect(mockGisHandlerService.clearSearch).toHaveBeenCalled();
  });

  it('should call onShowLayers', () => {
    const spy = jest.spyOn(mockStore, 'dispatch').mockImplementation();
    component.onShowLayers();
    expect(spy).toHaveBeenCalled();
  });

  it('should call onToggleMenu', () => {
    const spy = jest.spyOn(mockStore, 'dispatch').mockImplementation();
    component.hasResults = null;
    component.onToggleMenu();
    expect(component.hasResults).toBe(true);
    expect(spy).toHaveBeenCalled();
  });

  it('should call onToolbarAction', () => {
    expect(component.onToolBarAction('Close')).toBeUndefined();
    expect(component.onToolBarAction('Back')).toBeUndefined();
    expect(component.onToolBarAction('Toggled')).toBeUndefined();
    expect(component.onToolBarAction('Cleared')).toBeUndefined();
    expect(component.onToolBarAction('dummy')).toBeUndefined();
  });

  it('should call onZoomToWorldView', () => {
    global.innerWidth = 1700;
    expect(component.onZoomToWorldView()).toBeUndefined();
    global.innerWidth = 1300;
    expect(component.onZoomToWorldView()).toBeUndefined();
    global.innerWidth = 1200;
    expect(component.onZoomToWorldView()).toBeUndefined();
  });

  describe('onLassoSelection', () => {
    [LassoTool.NONE, LassoTool.RECTANGLE, LassoTool.POLYGON].forEach((type: LassoTool) => {
      it(`should call onLassoSelection ${type}`, () => {
        mockGisHandlerService.select.mockImplementation((_1: string, _2: () => void, callBackUnderTest: () => void) => callBackUnderTest());
        expect(component.onLassoSelection(type)).toBeUndefined();
        expect(mockPerformanceIndicatorService.startTiming).toHaveBeenCalledWith(PERFORMANCE_INDICATOR.apolloMapSelectionTime);
        expect(component.hasResults).toBeTruthy();
        expect(component.onCloseOpportunityDetails());
      });
    });
  });

  it('should redirect to login', () => {
    component.redirectToLogin();
    expect(mockAuthCodeFlowService.signIn).toHaveBeenCalled();
  });

  describe('onBackToPreviousResults', () => {
    it('should dispatch handleGisCanvasBackToPreviousResults', (done) => {
      mockStore.scannedActions$.pipe(ofType(mapWrapperActions.handleGisCanvasBackToPreviousResults)).subscribe(() => done());
      component.onBackToPreviousResults();
    });
  });

  it('should call onButtonClick', () => {
    expect(component.onButtonClick({ actionName: 'name', record: { recordId: 'id' } as any })).toBeUndefined();
  });

  describe('onDetailRecordId', () => {
    it('should mockGisHandlerService.inspect', () => {
      const recordRef = {
        type: 'dataPackage',
        properties: [{ name: 'DataPackageId', value: 'test_123' }]
      } as GisMappedSearchResult;
      mockGisHandlerService.inspect.mockReturnValue({});
      component.onDetailRecordId(recordRef);
      expect(mockGisHandlerService.inspect).toHaveBeenCalledWith(recordRef);
    });
    it('should dispatch setSelectedOpportunityId action', () => {
      const recordRef = {
        type: 'opportunity'
      } as GisMappedSearchResult;
      const spy = jest.spyOn(mockStore, 'dispatch').mockImplementation();
      component.onDetailRecordId(recordRef);
      expect(spy).toHaveBeenCalled();
    });

    it('should dispatch userSelectedPackage', (done) => {
      const mockId = uuid();
      const recordRef = {
        type: 'Opportunity',
        properties: [
          {
            name: 'DataPackageId',
            value: mockId
          },
          {
            name: 'OpportunityType',
            value: 'Public'
          }
        ]
      } as GisMappedSearchResult;
      component.onDetailRecordId(recordRef);
      mockStore.scannedActions$.pipe(ofType(packageActions.userSelectedPackage)).subscribe(({ id }) => {
        expect(id).toBe(mockId);
        done();
      });
    });

    it('should dispatch userSelectedNonpublicPackage', (done) => {
      const mockId = uuid();
      const recordRef = {
        type: 'Opportunity',
        properties: [
          {
            name: 'DataPackageId',
            value: mockId
          },
          {
            name: 'OpportunityType',
            value: 'Partially Public'
          }
        ]
      } as GisMappedSearchResult;
      component.onDetailRecordId(recordRef);
      mockStore.scannedActions$.pipe(ofType(packageActions.userSelectedNonpublicPackage)).subscribe(({ id }) => {
        expect(id).toBe(mockId);
        done();
      });
    });
  });

  it('should call onBackToPreviousDetail', () => {
    jest.spyOn(mapWrapperHelper, 'removeDetailStyle').mockImplementation();
    component.gisHandlerService.gisDataDetail = { records: [{ recordId: 'id' }] } as any;
    expect(component.onBackToPreviousDetail()).toBeUndefined();
  });

  it('should call onToggleLayerVisibility', () => {
    expect(component.onToggleLayerVisibility()).toBeUndefined();
  });

  it('should call onFilterChange', () => {
    const spy = jest.spyOn(component.store, 'dispatch');
    const layer: IGisLayer = {
      hasTags: true,
      name: 'Seismic 3D Survey',
      id: '0',
      layerId: 'layer_ml_14',
      opacity: 1,
      toggled: false,
      totalCount: 1,
      zIndex: 1,
      isVisible: false,
      icon: '3d-seismic',
      expanded: false,
      originalOptions: {
        query: {
          table: { name: 'slb/Pipeline/636674346988327070' },
          select: { type: 'geo.line' },
          where: [[]]
        }
      },
      originalTableName: 'slb_datalake/dd_Survey_3d'
    };
    const forceRefresh = true;
    component.onFilterChange(layer, forceRefresh);
    expect(spy).toHaveBeenCalledWith({
      type: '[Map-Wrapper] Filter Attribute Values Updated',
      layerName: layer.name,
      forceRefresh: forceRefresh
    });
  });

  describe('gotoPackageDetailsFromDataLayer', () => {
    it('should not go to package details', () => {
      component.gisHandlerService.gisDataDetail = {} as any;
      const spy = jest.spyOn(mockRouter, 'navigate').mockClear();
      component.gotoPackageDetailsFromDataLayer();
      expect(spy).not.toHaveBeenCalled();
    });
    it('should go to package details', () => {
      const spy = jest.spyOn(mockRouter, 'navigate').mockImplementation();
      const mockValue = uuid();
      component.gisHandlerService.gisDataDetail = {
        records: [
          null,
          {},
          {
            properties: [
              null,
              {},
              {
                name: 'DataPackageId',
                value: mockValue
              }
            ]
          }
        ]
      } as unknown as GisSearchResultRecords;
      component.gotoPackageDetailsFromDataLayer();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('setup', () => {
    const metadata = [];
    const inputConfig = { gisCanvas: { gisOnloadHiddenLayers: false, gisMap: null }, zoomToRadius: null };
    const user = {
      idToken: 'test'
    } as AuthUser;
    const mlDebug = true;

    beforeEach(() => {
      jest.spyOn(MapWrapperComponent.prototype as any, 'initGisHandlers');
      jest.spyOn(component, 'layersHaveLoaded');

      mockConfigurationLoaderService.load.mockImplementation(
        (callback: (metadata: ICategory[], config: IMapSettings, user: AuthUser, mlDebug: boolean) => void) =>
          callback(metadata, inputConfig, user, mlDebug)
      );

      mockGisHandlerService.configure.mockImplementation((config: IMapSettings, _: AuthUser) => config);
    });

    it('should setup gis handler once configuration is loaded', () => {
      const layerData = ['test_layer_1'];
      mockGisHandlerService.setup.mockImplementation((_1: ICategory[], callback: (layers: any) => void, _2: () => void) =>
        callback(layerData)
      );

      component.ngOnInit();

      expect(mockGisHandlerService.configure).toHaveBeenCalledWith(
        expect.objectContaining({
          ...inputConfig,
          gisCanvas: {
            ...inputConfig.gisCanvas,
            mlControls: mlDebug,
            gisMap: {
              ...inputConfig.gisCanvas.gisMap,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              layersMetadataConfiguration: metadata as any
            },
            gisTooltip: {
              component: GisTooltipComponent,
              disabled: false
            }
          }
        }),
        user
      );
      expect(mockGisHandlerService.setup).toHaveBeenCalledWith(metadata, expect.anything(), expect.anything());

      expect(component.gisSettings).toBeDefined();
      expect(component.layersHaveLoaded).toHaveBeenCalled();
      expect(mockPerformanceIndicatorService.endTiming).toHaveBeenCalledWith(PERFORMANCE_INDICATOR.gaiaLightLoadTime);
    });

    it('should clear performance timing on error', () => {
      mockGisHandlerService.setup.mockImplementation((_1: ICategory[], _2: (layers: any) => void, error: () => void) => error());

      component.ngOnInit();

      expect(mockPerformanceIndicatorService.cleanRecord).toHaveBeenCalledWith(PERFORMANCE_INDICATOR.gaiaLightLoadTime);
    });
  });

  describe('initGisHandlers', () => {
    beforeEach(() => {
      jest.spyOn(MapWrapperComponent.prototype as any, 'setup');
    });

    it('should subscribe and listen to maps updates', () => {
      const data = {};
      const layers = [];

      mockGisHandlerService.listen.mockImplementation((onListen: () => void, onData: (data: any, layers: any) => void): void => {
        onListen();
        onData(data, layers);
      });

      component.ngOnInit();

      expect(component.hasResults).toBeTruthy();
      expect(mockResultPanelService.updateState).toHaveBeenCalledWith(
        expect.objectContaining({
          gisCanvasLayers: layers,
          records: [],
          recordsTotal: 0
        })
      );
    });

    it('should subscribe and listen to click events', () => {
      mockGisHandlerService.click.mockImplementation((_1: () => void, callback: () => void): void => callback());

      component.ngOnInit();

      expect(mockPerformanceIndicatorService.startTiming).toHaveBeenCalledWith(PERFORMANCE_INDICATOR.apolloMapSelectionTime);
      expect(component.hasResults).toBeTruthy();
    });
  });

  describe('toggleBasemap', () => {
    it('should dispatch toggleBasemap action', () => {
      const spy = jest.spyOn(mockStore, 'dispatch').mockImplementation();
      component.toggleBasemap();
      expect(spy).toHaveBeenCalledWith(mapWrapperActions.toggleBasemap());
    });
  });

  describe('toggleMapWidth', () => {
    it('should change the width of the map', () => {
      component.isMapExpanded = true;
      component.toggleMap();
      expect(component.isMapExpanded).toBeFalsy();
    });
  });

  describe('toggleOpportunityWidth', () => {
    it('should change the width of the opportunity section', () => {
      component.isOpportunityExpanded = true;
      component.toggleOpportunity();
      expect(component.isOpportunityExpanded).toBeFalsy();
    });
  });

  describe('onAttributeFilterChange', () => {
    it('should apply the global filter', () => {
      const spy = jest.spyOn(component.store, 'dispatch');
      const layer: IGisLayer = {
        hasTags: true,
        name: 'Seismic 3D Survey',
        id: '0',
        layerId: 'layer_ml_14',
        opacity: 1,
        toggled: false,
        totalCount: 1,
        zIndex: 1,
        isVisible: false,
        icon: '3d-seismic',
        expanded: false,
        originalOptions: {
          query: {
            table: { name: 'slb/Pipeline/636674346988327070' },
            select: { type: 'geo.line' },
            where: [[]]
          }
        },
        originalTableName: 'slb_datalake/dd_Survey_3d'
      };
      const forceRefresh = false;
      component.onAttributeFilterChange(layer);
      expect(spy).toHaveBeenCalledWith({
        type: '[Map-Wrapper] Filter Attribute Values Updated',
        layerName: layer.name,
        forceRefresh: forceRefresh
      });
    });
  });

  describe('clearLassoSelection', () => {
    it('should clear the lasso selection or onClick opportunity event', () => {
      const spy = jest.spyOn(mockStore, 'dispatch').mockImplementation();
      component.clearLassoSelection();
      expect(spy).toHaveBeenCalled();
    });
  });
});
