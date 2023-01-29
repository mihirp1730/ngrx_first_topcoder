import { TestBed } from '@angular/core/testing';
import { AuthUser } from '@apollo/api/interfaces';
import { LassoTool, LassoToolsService } from '@apollo/app/lasso-tools';
import { SecureEnvironmentService } from '@apollo/app/secure-environment';
import { provideMockStore } from '@ngrx/store/testing';
import {
  GisLayerPanelService,
  GisMapLargeService,
  GisMappedSearchResult,
  GisSearchResultActionService,
  GisSearchResultRecords,
  GisSearchResultService
} from '@slb-innersource/gis-canvas';
import { GoogleAnalyticsService } from 'ngx-google-analytics';
import { of, throwError } from 'rxjs';

import {
  mockGisLayerPanelService,
  mockGisMapLargeService,
  mockGisSearchResultActionService,
  MockGisSearchResultService,
  mockGoogleAnalyticsService,
  mockLassoToolsService,
  mockMapWrapperService,
  mockSecureEnvironmentService
} from '../../shared/services.mock';
import { AppActions } from '../enums';
import { GisHandlerService } from './gis-handler.service';
import { MapWrapperService } from './map-wrapper.service';

describe('GisHandlerService', () => {
  let service: GisHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideMockStore(),
        {
          provide: SecureEnvironmentService,
          useValue: mockSecureEnvironmentService
        },
        {
          provide: MapWrapperService,
          useValue: mockMapWrapperService
        },
        {
          provide: GisMapLargeService,
          useValue: mockGisMapLargeService
        },
        {
          provide: GisSearchResultActionService,
          useValue: mockGisSearchResultActionService
        },
        {
          provide: GisLayerPanelService,
          useValue: mockGisLayerPanelService
        },
        {
          provide: LassoToolsService,
          useValue: mockLassoToolsService
        },
        {
          provide: GoogleAnalyticsService,
          useValue: mockGoogleAnalyticsService
        },
        {
          provide: GisSearchResultService,
          useValue: MockGisSearchResultService
        }
      ]
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('configure', () => {
    it('should return valid config', () => {
      const inputConfig = { gisCanvas: null, zoomToRadius: null };
      const user = {
        gisToken: 'test'
      } as AuthUser;

      service = TestBed.inject(GisHandlerService);
      const config = service.configure(inputConfig, user);

      expect(config).toEqual(
        expect.objectContaining({
          config: null,
          partition: '',
          appKey: '',
          deploymentUrl: '',
          token: user.gisToken
        })
      );
    });
  });

  describe('setup', () => {
    it('should setup settings and layers', () => {
      const metadata = [];
      const onLoadSpy = jest.fn();
      const onErrorSpy = jest.fn();

      service = TestBed.inject(GisHandlerService);
      service.setup(metadata, onLoadSpy, onErrorSpy);

      expect(mockGisLayerPanelService.initializeLayerPanel).toHaveBeenCalledWith([], metadata);
      expect(mockGisSearchResultActionService.setMetaData).toHaveBeenCalledWith(metadata);
      expect(onLoadSpy).toHaveBeenCalledWith([]);
      expect(onErrorSpy).not.toHaveBeenCalled();
    });

    it('should handle setup error', () => {
      const metadata = [];
      const onLoadSpy = jest.fn();
      const onErrorSpy = jest.fn();

      mockGisMapLargeService.layersChange$ = throwError('error');

      service = TestBed.inject(GisHandlerService);
      service.setup(metadata, onLoadSpy, onErrorSpy);

      expect(onErrorSpy).toHaveBeenCalled();
      expect(onLoadSpy).not.toHaveBeenCalled();
    });
  });

  describe('listen', () => {
    it('should handle a single data record', () => {
      const recordData = { recordsTotal: 1, records: [{ type: '3dSeismic' }] };
      const onHasSpy = jest.fn();
      const onNonDetailResultsSpy = jest.fn();

      mockMapWrapperService.getCurrentAppAction.mockReturnValue(of(AppActions.None));
      mockGisSearchResultActionService.transformedData = of(recordData);

      service = TestBed.inject(GisHandlerService);
      service.listen(onHasSpy, onNonDetailResultsSpy);

      expect(service.gisDataDetail).toMatchObject(recordData);
      expect(onHasSpy).toHaveBeenCalled();
      expect(onNonDetailResultsSpy).not.toHaveBeenCalled();
    });

    it('should handle a single data record for opportunity', () => {
      const recordData = { recordsTotal: 1, records: [{ type: 'Opportunity' }] };
      const onHasSpy = jest.fn();
      const onNonDetailResultsSpy = jest.fn();
      mockMapWrapperService.getCurrentAppAction.mockReturnValue(of(AppActions.None));
      mockGisSearchResultActionService.transformedData = of(recordData);
      service = TestBed.inject(GisHandlerService);
      service.listen(onHasSpy, onNonDetailResultsSpy);
      expect(service.gisDataDetail).toBeUndefined();
      expect(onHasSpy).toHaveBeenCalled();
    });

    it('should handle detail results', () => {
      const recordData = { recordsTotal: 2 };
      const onHasSpy = jest.fn();
      const onNonDetailResultsSpy = jest.fn();

      mockMapWrapperService.getCurrentAppAction.mockReturnValue(of(AppActions.Detail));
      mockGisSearchResultActionService.transformedData = of(recordData);

      service = TestBed.inject(GisHandlerService);
      service.listen(onHasSpy, onNonDetailResultsSpy);

      expect(service.gisData).toBeUndefined();
      expect(service.gisDataDetail).toBeUndefined();
      expect(onHasSpy).toHaveBeenCalled();
      expect(onNonDetailResultsSpy).not.toHaveBeenCalled();
    });

    it('should handle non detail results', () => {
      const recordData = { recordsTotal: 2 };
      const onHasSpy = jest.fn();
      const onNonDetailResultsSpy = jest.fn();

      mockMapWrapperService.getCurrentAppAction.mockReturnValue(of(AppActions.None));
      mockGisSearchResultActionService.transformedData = of(recordData);

      service = TestBed.inject(GisHandlerService);
      service.listen(onHasSpy, onNonDetailResultsSpy);

      expect(service.gisData).toMatchObject(recordData);
      expect(service.gisDataDetail).toBeUndefined();
      expect(onHasSpy).toHaveBeenCalled();
      expect(onNonDetailResultsSpy).toHaveBeenCalled();
    });

    it('should handle map selection', () => {
      const recordData = { recordsTotal: 2 };
      const queryData = {
        query: 'A carefully crafted query'
      };

      const onHasSpy = jest.fn();
      const onNonDetailResultsSpy = jest.fn();

      mockGisSearchResultActionService.searchResultService.query = queryData;

      mockMapWrapperService.getCurrentAppAction.mockReturnValue(of(AppActions.MapSelection));
      mockGisSearchResultActionService.transformedData = of(recordData);

      service = TestBed.inject(GisHandlerService);
      service.listen(onHasSpy, onNonDetailResultsSpy);

      expect(service.gisData).toMatchObject(recordData);
      expect(service.gisDataDetail).toBeUndefined();

      expect(mockLassoToolsService.clearCurrentLasso).toHaveBeenCalled();

      expect(onHasSpy).toHaveBeenCalled();
      expect(onNonDetailResultsSpy).toHaveBeenCalledWith(recordData, queryData);
    });
  });

  describe('search', () => {
    it('should get search results when action is valid', () => {
      const term = 'test';
      const noLayersCallback = jest.fn();
      const hasLayersCallback = jest.fn();
      const testLayers = ['test'];

      mockGisSearchResultActionService.getDisableLayers.mockReturnValue(testLayers);

      service = TestBed.inject(GisHandlerService);
      service.gisLayerService.gisLayers = testLayers;
      service.search(term, noLayersCallback, hasLayersCallback);

      expect(mockGisSearchResultActionService.getSearchResult).toHaveBeenCalledWith(testLayers, term);
      expect(mockMapWrapperService.updateCurrentAppAction).toHaveBeenCalledWith(AppActions.Search);

      expect(noLayersCallback).not.toHaveBeenCalled();
      expect(hasLayersCallback).toHaveBeenCalled();
    });

    it('should not search if all layers are disabled', () => {
      const term = 'test';
      const noLayersCallback = jest.fn();
      const hasLayersCallback = jest.fn();
      const testLayers = [];

      mockGisSearchResultActionService.getDisableLayers.mockReturnValue(testLayers);

      service = TestBed.inject(GisHandlerService);
      service.gisLayerService.gisLayers = testLayers;
      service.search(term, noLayersCallback, hasLayersCallback);

      expect(mockLassoToolsService.clearCurrentLasso).toHaveBeenCalled();

      expect(mockGisSearchResultActionService.getSearchResults).not.toHaveBeenCalled();
      expect(mockMapWrapperService.updateCurrentAppAction).not.toHaveBeenCalled();
      expect(noLayersCallback).toHaveBeenCalled();
      expect(hasLayersCallback).not.toHaveBeenCalled();
    });
  });

  describe('clearSearch', () => {
    it('should close search results', () => {
      const style = 'THIS IS A STYLE';
      const callback = jest.fn();
      mockGisMapLargeService.getInitialStyleRules.mockReturnValue(style);

      service = TestBed.inject(GisHandlerService);
      service.clearSearch(callback);

      expect(mockGisSearchResultActionService.closeSearchResult).toHaveBeenCalled();
      expect(mockGisMapLargeService.getInitialStyleRules).toHaveBeenCalled();
      expect(callback).toHaveBeenCalledWith(style, mockGisMapLargeService.map.layers);
    });
  });

  describe('select', () => {
    it('should disable drawing manager on no lasso tool', () => {
      const tool = LassoTool.NONE;
      const noLayersCallback = jest.fn();
      const hasLayersCallback = jest.fn();

      service = TestBed.inject(GisHandlerService);
      service.select(tool, noLayersCallback, hasLayersCallback);

      expect(mockGisMapLargeService.drawingManager.disable).toHaveBeenCalled();
      expect(mockGisMapLargeService.drawRectangleToSelect).not.toHaveBeenCalled();
      expect(mockGisMapLargeService.drawPolygonToSelect).not.toHaveBeenCalled();

      expect(mockGisSearchResultActionService.getSelectionResults).not.toHaveBeenCalled();
      expect(mockMapWrapperService.updateCurrentAppAction).not.toHaveBeenCalled();

      expect(noLayersCallback).not.toHaveBeenCalled();
      expect(hasLayersCallback).not.toHaveBeenCalled();
    });

    it('should perform selection based on freehand lasso', () => {
      const tool = LassoTool.FREEHAND;
      const noLayersCallback = jest.fn();
      const hasLayersCallback = jest.fn();

      const layers = ['test', 'test2'];
      const results = ['test'];

      mockGisMapLargeService.drawLassoToSelect.mockReturnValue(of(results));
      mockGisSearchResultActionService.getDisableLayers.mockReturnValue(layers);

      service = TestBed.inject(GisHandlerService);
      service.gisLayerService.gisLayers = layers;
      service.select(tool, noLayersCallback, hasLayersCallback);

      expect(mockGisMapLargeService.drawingManager.disable).not.toHaveBeenCalled();
      expect(mockGisMapLargeService.drawLassoToSelect).toHaveBeenCalled();
      expect(mockGisMapLargeService.drawPolygonToSelect).not.toHaveBeenCalled();

      expect(mockGisSearchResultActionService.getSelectionResults).toHaveBeenCalledWith(layers, results);
      expect(mockMapWrapperService.updateCurrentAppAction).toHaveBeenCalledWith(AppActions.MapSelection);

      expect(noLayersCallback).not.toHaveBeenCalled();
      expect(hasLayersCallback).toHaveBeenCalled();
    });

    it('should perform selection based on rectangle lasso', () => {
      const tool = LassoTool.RECTANGLE;
      const noLayersCallback = jest.fn();
      const hasLayersCallback = jest.fn();

      const layers = ['test', 'test2'];
      const results = ['test'];

      mockGisMapLargeService.drawRectangleToSelect.mockReturnValue(of(results));
      mockGisSearchResultActionService.getDisableLayers.mockReturnValue(layers);

      service = TestBed.inject(GisHandlerService);
      service.gisLayerService.gisLayers = layers;
      service.select(tool, noLayersCallback, hasLayersCallback);

      expect(mockGisMapLargeService.drawingManager.disable).not.toHaveBeenCalled();
      expect(mockGisMapLargeService.drawRectangleToSelect).toHaveBeenCalled();
      expect(mockGisMapLargeService.drawPolygonToSelect).not.toHaveBeenCalled();

      expect(mockGisSearchResultActionService.getSelectionResults).toHaveBeenCalledWith(layers, results);
      expect(mockMapWrapperService.updateCurrentAppAction).toHaveBeenCalledWith(AppActions.MapSelection);

      expect(noLayersCallback).not.toHaveBeenCalled();
      expect(hasLayersCallback).toHaveBeenCalled();
    });

    it('should perform selection based on polygon lasso', () => {
      const tool = LassoTool.POLYGON;
      const noLayersCallback = jest.fn();
      const hasLayersCallback = jest.fn();

      const layers = ['test', 'test2'];
      const results = ['test'];

      mockGisMapLargeService.drawPolygonToSelect.mockReturnValue(of(results));
      mockGisSearchResultActionService.getDisableLayers.mockReturnValue(layers);

      service = TestBed.inject(GisHandlerService);
      service.gisLayerService.gisLayers = layers;
      service.select(tool, noLayersCallback, hasLayersCallback);

      expect(mockGisMapLargeService.drawingManager.disable).not.toHaveBeenCalled();
      expect(mockGisMapLargeService.drawRectangleToSelect).not.toHaveBeenCalled();
      expect(mockGisMapLargeService.drawPolygonToSelect).toHaveBeenCalled();

      expect(mockGisSearchResultActionService.getSelectionResults).toHaveBeenCalledWith(layers, results);
      expect(mockMapWrapperService.updateCurrentAppAction).toHaveBeenCalledWith(AppActions.MapSelection);

      expect(noLayersCallback).not.toHaveBeenCalled();
      expect(hasLayersCallback).toHaveBeenCalled();
    });

    it('should skip making selection if no layers are available', () => {
      const tool = LassoTool.RECTANGLE;
      const noLayersCallback = jest.fn();
      const hasLayersCallback = jest.fn();

      const layers = [];
      const results = [];

      mockGisMapLargeService.drawRectangleToSelect.mockReturnValue(of(results));
      mockGisSearchResultActionService.getDisableLayers.mockReturnValue(layers);

      service = TestBed.inject(GisHandlerService);
      service.gisLayerService.gisLayers = layers;
      service.select(tool, noLayersCallback, hasLayersCallback);

      expect(mockGisSearchResultActionService.getSelectionResults).not.toHaveBeenCalledWith(layers, results);
      expect(mockMapWrapperService.updateCurrentAppAction).not.toHaveBeenCalledWith(AppActions.MapSelection);

      expect(noLayersCallback).toHaveBeenCalled();
      expect(hasLayersCallback).not.toHaveBeenCalled();
    });
  });

  describe('click', () => {
    it('should listen click events', () => {
      const noLayersCallback = jest.fn();
      const hasLayersCallback = jest.fn();

      const layers = ['test', 'test2'];
      const wks = 'test';

      mockGisMapLargeService.onClickResult$ = of({});
      mockGisSearchResultActionService.getDisableLayers.mockReturnValue(layers);
      mockGisMapLargeService.singleObjectwktSession = wks;

      service = TestBed.inject(GisHandlerService);
      service.gisLayerService.gisLayers = layers;
      service.click(noLayersCallback, hasLayersCallback);

      expect(mockGisSearchResultActionService.getSingleObjectSelection).toHaveBeenCalledWith(layers, wks);
      expect(mockMapWrapperService.updateCurrentAppAction).toHaveBeenCalledWith(AppActions.MapSelection);

      expect(noLayersCallback).not.toHaveBeenCalled();
      expect(hasLayersCallback).toHaveBeenCalled();
    });

    it('should not perform search if no layers are present', () => {
      const noLayersCallback = jest.fn();
      const hasLayersCallback = jest.fn();
      const layers = [];

      mockGisMapLargeService.onClickResult$ = of({});
      mockGisSearchResultActionService.getDisableLayers.mockReturnValue(layers);

      service = TestBed.inject(GisHandlerService);
      service.gisLayerService.gisLayers = layers;
      service.click(noLayersCallback, hasLayersCallback);

      expect(mockGisSearchResultActionService.getSingleObjectSelection).not.toHaveBeenCalled();
      expect(mockMapWrapperService.updateCurrentAppAction).not.toHaveBeenCalled();

      expect(noLayersCallback).toHaveBeenCalled();
      expect(hasLayersCallback).not.toHaveBeenCalled();
    });

    it('should filter out null click events', () => {
      const noLayersCallback = jest.fn();
      const hasLayersCallback = jest.fn();
      const layers = [];

      mockGisMapLargeService.onClickResult$ = of(null);

      service = TestBed.inject(GisHandlerService);
      service.gisLayerService.gisLayers = layers;
      service.click(noLayersCallback, hasLayersCallback);

      expect(mockGisSearchResultActionService.getSingleObjectSelection).not.toHaveBeenCalled();
      expect(mockMapWrapperService.updateCurrentAppAction).not.toHaveBeenCalled();

      expect(noLayersCallback).not.toHaveBeenCalled();
      expect(hasLayersCallback).not.toHaveBeenCalled();
    });
  });

  describe('inspect', () => {
    it('should inspect a record', () => {
      const input = {} as GisMappedSearchResult;
      const layers = [];

      service = TestBed.inject(GisHandlerService);
      service.gisLayerService.gisLayers = layers;
      service.inspect(input);

      expect(mockMapWrapperService.updateCurrentAppAction).toHaveBeenCalledWith(AppActions.Detail);
      expect(mockGisSearchResultActionService.detailRecord).toHaveBeenCalledWith(layers, input);

      expect(service.gisDataDetail).toBeDefined();
    });
  });

  describe('back', () => {
    it('should move back to results panel', () => {
      const wkt = 'test';
      const callback = jest.fn();

      service = TestBed.inject(GisHandlerService);
      service.gisDataDetail = {
        records: [{ wkt } as GisMappedSearchResult]
      } as GisSearchResultRecords;

      service.back(callback);

      expect(callback).toHaveBeenCalledWith(mockGisMapLargeService.map.layers, wkt);
    });
  });

  describe('resultClick', () => {
    it('should just hand off to gis seatch result action service', () => {
      const input = {
        actionName: 'test',
        record: {} as GisMappedSearchResult
      };

      service = TestBed.inject(GisHandlerService);
      service.resultClick(input);

      expect(mockGisSearchResultActionService.onButtonClick).toHaveBeenCalledWith(input);
    });
  });

  describe('setZoom', () => {
    it('should set zoom level based on screen width', () => {
      [
        { w: 0, z: 0 },
        { w: 1201, z: 2 },
        { w: 1601, z: 3 }
      ].forEach(({ w, z }) => {
        service = TestBed.inject(GisHandlerService);
        service.setZoom(w);
        expect(mockGisMapLargeService.setZoom).toHaveBeenCalledWith(z);
      });
    });
  });
});
