import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, SimpleChanges } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { SlbPopoverModule } from '@slb-dls/angular-material/popover';
import { FiltersModule, GisLayerPanelService, GisLayersService } from '@slb-innersource/gis-canvas';
import { IFilterAttributeModel } from '@slb-innersource/gis-canvas/gis-canvas-widget/gis-canvas-widget-components/gis-canvas-core/gis-filters/gis-filter-model/filter-attribute.model';
import { IFilterModel } from '@slb-innersource/gis-canvas/gis-canvas-widget/gis-canvas-widget-components/gis-canvas-core/gis-filters/gis-filter-model/filter.model';
import { IGisLayer } from '@slb-innersource/gis-canvas/gis-canvas-widget/gis-canvas-widget-components/gis-canvas-core/gis-layer-panel/gis-layer-panel.model';
import { BehaviorSubject } from 'rxjs';

import { GisGlobalFiltersComponent } from './global-filters.component';

export const mockGisLayerPanelService = {
  initializeLayerPanel: jest.fn().mockReturnValue([{}]),
  clearLayerFilter: new BehaviorSubject<any>({} as any),
  clearAllFilter: jest.fn().mockReturnValue([{
    mapLargeAttribute: 'mapLargeAttribute',
    isGlobalFilter: true,
    name: "Opportunity",
    displayName: "Test",
    values: []
  }])
}

describe('GisGlobalFiltersComponent', () => {
  let component: GisGlobalFiltersComponent;
  let fixture: ComponentFixture<GisGlobalFiltersComponent>;
  const initialState: IFilterModel = {
    isExpanded: false,
    isLoaded: true,
    isLoading: false,
    layer: 'test/dd_test',
    name: 'Opportunity',
    displayName: 'Test',
    displayIcon: 'test.svg',
    isAnyAttributeSelected: true,
    attributes: []
  };
  const attribute: IFilterAttributeModel = {
    mapLargeAttribute: 'mapLargeAttribute',
    isGlobalFilter: true,
    name: "Opportunity",
    displayName: "Test",
    values: [
      {
        count: 109,
        selected: true,
        name: 'test'
      }
    ]
  };
  const layer: IGisLayer = {
    hasTags: true,
    name: 'Opportunity',
    id: '0',
    layerId: 'layer_ml_14',
    opacity: 1,
    toggled: false,
    totalCount: 1,
    zIndex: 1,
    isVisible: false,
    icon: 'test',
    expanded: false,
    originalOptions: {
      query: {
        table: { name: 'test/dd_test/88327070' },
        select: { type: 'geo.line' },
        where: [[]]
      }
    },
    originalTableName: 'test/dd_test',
  }
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatChipsModule, MatIconModule, FiltersModule, SlbPopoverModule],
      declarations: [GisGlobalFiltersComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
      providers: [
        {
          provide: GisLayersService,
          useValue: {
            onFilterChange: jest.fn(),
            gisLayerService: {
              gisLayers: {}
            }

          }
        },
        {
          provide: GisLayerPanelService,
          useValue: mockGisLayerPanelService
        },
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GisGlobalFiltersComponent);
    component = fixture.componentInstance;
    component.opportunityLayer = layer;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit on filterChange', () => {
    const filters: IFilterModel = {
      ...initialState,
      attributes: [
        attribute
      ]
    };
    layer.filter = filters;
    component.opportunityLayer.filter = filters;
    const spy = jest.spyOn(component.filterChange, 'emit').mockImplementation();
    component.onFilterChange(layer);
    expect(spy).toHaveBeenCalled();
  });

  it('should call clear all filters if layers are empty', () => {
    const filters: IFilterModel = {
      ...initialState,
      attributes: [
        attribute
      ]
    };
    component.opportunityLayer.filter = filters;
    layer.filter = filters;
    component.layers = [layer];
    component.clearAllFilters();
    expect(component.attributeSelected).toBeFalsy();
  });

  it('should call clear all filters if data object filter', () => {
    component.dataObjectFilter = true;
    const spy = jest.spyOn(component.clearDataObjectFilter, 'emit').mockImplementation();
    component.clearAllFilters();
    expect(spy).toHaveBeenCalled();
  });

  it('should select layer on Click of chip', () => {
    component.onClick(layer, attribute);
    expect(component.selectedLayer).toEqual(layer);
  });

  it('should clear selected filter on close', () => {
    component.onClose();
    expect(component.selectedLayer).toBeFalsy();
  });

  it('should show global filters', () => {
    const filters: IFilterModel = {
      ...initialState,
      attributes: [
        attribute
      ]
    };
    layer.filter = filters;
    component.layers = [layer];
    component.ngOnChanges({  layers: { currentValue: [layer] } } as unknown as SimpleChanges);
    component.showGlobalFilters = true;
  });

  it('should hide global filters', () => {
    component.layers = [];
    component.ngOnChanges({  layers: { currentValue: [] } } as unknown as SimpleChanges);
    component.showGlobalFilters = false;
  });

  it('should return css class', () => {
    const attribute = [
      {
        name: 'Geothermal',
        selected: true,
        count: 27
      },
      {
        name: 'CCUS',
        selected: false,
        count: 27
      }
    ];
    expect(component.isFilter(attribute)).toBe('selected');
  })
});
