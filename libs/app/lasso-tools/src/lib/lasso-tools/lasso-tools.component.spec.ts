import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { of } from 'rxjs';

import { LassoToolsService } from '../lasso-tools.service';
import { LassoToolsComponent } from './lasso-tools.component';
import { LassoTool } from './lasso-tools.helper';

const mockLassoToolsService = {
  currentLasso$: of(LassoTool.NONE),
  clearCurrentLasso: jest.fn(),
  updateCurrentLasso: jest.fn(),
  getCurrentLasso: jest.fn()
}

describe('LassoToolsComponent', () => {
  let component: LassoToolsComponent;
  let fixture: ComponentFixture<LassoToolsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatIconTestingModule],
      providers: [
        {
          provide: LassoToolsService,
          useValue: mockLassoToolsService
        }
      ],
      declarations: [LassoToolsComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LassoToolsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit zoomToWorldView when onZoomToWorldView is called', () => {
    const spyZoom = jest.spyOn(component.zoomToWorldView, 'emit');
    component.onZoomToWorldView();
    expect(spyZoom).toHaveBeenCalled();
  });

  it('if current lasso is a rectangle, it should call clearCurrentLasso', () => {
    component.onRectangleSelection(LassoTool.RECTANGLE);

    expect(mockLassoToolsService.clearCurrentLasso).toHaveBeenCalled();
  });

  it('if current lasso is not a rectangle, it should call updateCurrentLasso', () => {
    component.onRectangleSelection(LassoTool.NONE);

    expect(mockLassoToolsService.updateCurrentLasso).toHaveBeenCalledWith(LassoTool.RECTANGLE);
  });

  it('if current lasso is a polygon, it should call clearCurrentLasso', () => {
    component.onPolygonSelection(LassoTool.POLYGON);

    expect(mockLassoToolsService.clearCurrentLasso).toHaveBeenCalled();
  });

  it('if current lasso is a polygon, it should call updateCurrentLasso', () => {
    component.onPolygonSelection(LassoTool.NONE);

    expect(mockLassoToolsService.updateCurrentLasso).toHaveBeenCalledWith(LassoTool.POLYGON);
  });

  it('if current lasso is a freehand, it should call clearCurrentLasso', () => {
    component.onFreehandSelection(LassoTool.FREEHAND);

    expect(mockLassoToolsService.clearCurrentLasso).toHaveBeenCalled();
  });

  it('if current lasso is a freehand, it should call updateCurrentLasso', () => {
    component.onFreehandSelection(LassoTool.NONE);

    expect(mockLassoToolsService.updateCurrentLasso).toHaveBeenCalledWith(LassoTool.FREEHAND);
  });

  it('should update current lasso on esc keydown', () => {
    mockLassoToolsService.getCurrentLasso.mockReturnValue(of(LassoTool.POLYGON));
    const event = new KeyboardEvent('keydown', {
      key: 'Escape'
    });
    document.dispatchEvent(event);

    expect(mockLassoToolsService.clearCurrentLasso).toHaveBeenCalled();
  });

  it('should emit basemap when onBasemapClick is called', () => {
    const spy = jest.spyOn(component.basemap, 'emit').mockImplementation();
    component.onBasemapClick();
    expect(spy).toHaveBeenCalled();
  });
});
