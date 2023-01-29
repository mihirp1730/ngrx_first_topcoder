import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { LassoTool, LassoToolsService } from '@apollo/app/lasso-tools';
import { GisCustomTemplateService, GisTopToolbarService } from '@slb-innersource/gis-canvas';
import { ITopToolbarAction } from '@slb-innersource/gis-canvas/gis-canvas-widget/gis-canvas-widget-components/gis-canvas-core/gis-top-toolbar/gis-top-toolbar-action.interface';
import { BehaviorSubject, Subject } from 'rxjs';

import { MapToolbarComponent } from './map-toolbar.component';

export class mockGisTopToolbarService {
  selectedToolbarButton = new Subject();
  drawRectangleToZoom = jest.fn();  
}

export class MockLassoToolsService {
  currentLasso$ = new BehaviorSubject<LassoTool>(LassoTool.NONE);
  updateCurrentLasso = jest.fn();
  clearCurrentLasso = jest.fn();
}

describe('MapToolbarComponent', () => {
  let component: MapToolbarComponent;
  let fixture: ComponentFixture<MapToolbarComponent>;
  let mockLassoToolsService: MockLassoToolsService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MapToolbarComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        provideMockStore(),
        {
          provide: GisCustomTemplateService,
          useValue: { customToolbarButtons: null }
        },
        {
          provide: GisTopToolbarService,
          useClass: mockGisTopToolbarService
        },
        {
          provide: LassoToolsService,
          useClass: MockLassoToolsService
        }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MapToolbarComponent);
    mockLassoToolsService = TestBed.inject(LassoToolsService) as unknown as MockLassoToolsService;
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    const event = new KeyboardEvent('keydown', {
      key: 'Escape'
    });
    document.dispatchEvent(event);
    expect(component).toBeTruthy();
  });

  it('should call basemap emit action', () => {
    const toolBarAction: ITopToolbarAction = {
      action: 'basemap'
    };

    const spy = jest.spyOn(component, 'onToolbarAction');
    component.onToolbarAction(toolBarAction);
    expect(spy).toHaveBeenCalled();
  });

  it('should call zoomToWorld emit action', () => {
    const toolBarAction: ITopToolbarAction = {
      action: 'zoomToWorld'
    };

    const spy = jest.spyOn(component, 'onToolbarAction');
    component.onToolbarAction(toolBarAction);
    expect(spy).toHaveBeenCalled();
  });

  it('should call rubberbandzoom', () => {
    const toolBarAction: ITopToolbarAction = {
      action: 'rubberbandzoom'
    };

    const spy = jest.spyOn(component, 'onToolbarAction');
    component.onToolbarAction(toolBarAction);
    expect(spy).toHaveBeenCalled();
  });

  describe('onFreehandSelection', () => {
    it('should call Freehand Lasso', fakeAsync(() => {
      const mockAction = { action: 'lasso' };

      component.onToolbarAction(mockAction);
      tick();
      expect(mockLassoToolsService.updateCurrentLasso).toHaveBeenCalled();
    }));
    it('should not call Freehand Lasso', fakeAsync(() => {
      mockLassoToolsService.currentLasso$.next(LassoTool.FREEHAND);
      const mockAction = { action: 'lasso' };

      component.onToolbarAction(mockAction);
      tick();
      expect(mockLassoToolsService.updateCurrentLasso).not.toHaveBeenCalled();
    }));
  });

  describe('onRectangleSelection', () => {
    it('should call Rectangle Lasso', fakeAsync(() => {
      const mockAction = { action: 'rectangle' };

      component.onToolbarAction(mockAction);
      tick();
      expect(mockLassoToolsService.updateCurrentLasso).toHaveBeenCalled();
    }));
    it('should not call Freehand Lasso', fakeAsync(() => {
      mockLassoToolsService.currentLasso$.next(LassoTool.RECTANGLE);
      const mockAction = { action: 'rectangle' };

      component.onToolbarAction(mockAction);
      tick();
      expect(mockLassoToolsService.updateCurrentLasso).not.toHaveBeenCalled();
    }));
  });
  describe('onPolygonSelection', () => {
    it('should call Polygon Lasso', fakeAsync(() => {
      const mockAction = { action: 'polygon' };

      component.onToolbarAction(mockAction);
      tick();
      expect(mockLassoToolsService.updateCurrentLasso).toHaveBeenCalled();
    }));
    it('should not call Freehand Lasso', fakeAsync(() => {
      mockLassoToolsService.currentLasso$.next(LassoTool.POLYGON);
      const mockAction = { action: 'polygon' };

      component.onToolbarAction(mockAction);
      tick();
      expect(mockLassoToolsService.updateCurrentLasso).not.toHaveBeenCalled();
    }));
  });
});
