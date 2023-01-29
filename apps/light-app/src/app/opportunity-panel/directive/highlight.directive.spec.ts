import { Component, CUSTOM_ELEMENTS_SCHEMA, DebugElement, OnInit } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { GisCanvas, GisMapDataService, GisMapLargeService, query, SettingsService } from '@slb-innersource/gis-canvas';
import { BehaviorSubject, Observable, of } from 'rxjs';

import * as opportunityPanelSelectors from '../state/selectors/opportunity-panel.selectors';

import { HighlightDirective } from './highlight.directive';

const gisMapDataServiceLayers = [
  {
    name: '_gis_highlight_Well',
    load: jest.fn(),
    remove: jest.fn(),
    hide: jest.fn(),
    originalTableName: 'slb/Asset',
    originalOptions: {
      name: '_gis_highlight_Well',
      query: {
        table: {
          name: '_gis_highlight_Well'
        },
        select: {
          type: 'geo.dot'
        }
      },
      style: {
        method: 'rules',
        rules: [
          {
            style: {
              fillColor: '100-204-204-234',
              borderColor: '255-255-255-255'
            },
            where: [
              [
                {
                  exp: 'PhysicalRowIndex() == 1'
                }
              ]
            ]
          },
          {
            style: {
              fillColor: '100-204-204-234',
              borderColor: '255-255-255-255'
            },
            where: {
              exp: 'PhysicalRowIndex() == 1'
            }
          }
        ]
      }
    }
  },
  {
    load: jest.fn(),
    remove: jest.fn(),
    hide: jest.fn(),
    originalTableName: 'slb/Block',
    originalOptions: {
      name: 'WMSMockLayer',
      service: {
        type: 'WMS',
        server: 'geoserver'
      }
    }
  },
  {
    name: 'Well',
    load: jest.fn(),
    remove: jest.fn(),
    hide: jest.fn(),
    originalTableName: 'slb/Well',
    originalOptions: {
      name: 'Well',
      visible: true,
      query: {
        table: {
          name: 'TestTable'
        },
        select: {
          type: 'geo.dot'
        }
      },
      style: {
        method: 'rules',
        rules: [
          {
            style: {
              fillColor: '100-204-204-234',
              borderColor: '255-255-255-255'
            },
            where: [
              [
                {
                  exp: 'PhysicalRowIndex() == 1'
                }
              ]
            ]
          },
          {
            style: {
              fillColor: '100-204-204-234',
              borderColor: '255-255-255-255'
            },
            where: {
              exp: 'PhysicalRowIndex() == 1'
            }
          }
        ]
      }
    }
  }
];

export const mockGisMapLargeService = {
  getInitialStyleRules: jest.fn(),
  highlightSelected: jest.fn(),
  highlightOnHover: jest.fn(() => of({})),
  drawRectangleToSelect: jest.fn(() => of({})),
  drawPolygonToSelect: jest.fn(() => of({})),
  map: {
    layers: gisMapDataServiceLayers,
    zoom: { get: jest.fn() }
  },
  highlightSelectedWktWithStyle: new BehaviorSubject<any>(null)
};

class MockGisMapDataService {
  getFilteredLayerData = jest.fn();
  createGisMapQueryCursor = jest.fn();
  setLayerAndMetaData = jest.fn();
  gisMapInstance = {
    layers: gisMapDataServiceLayers
  };
  getSelectedLayersData = () => {
    return {
      getPage: () => {
        return Observable.create((observer) => {
          setTimeout(() => {
            const resultMap = new Map<string, any>();
            resultMap.get('wells');
            resultMap.set('layerName', {
              results: [{}],
              total_records: 1
            });
            observer.next(resultMap);
          }, 1);
        });
      }
    };
  };
}

@Component({
  template: ` <mat-card class="card-container" [apolloHighlight]="'opId'"> </mat-card> `
})
class TestGisSearchResultComponent {}

describe('HighlightDirective', () => {
  let component: TestGisSearchResultComponent;
  let fixture: ComponentFixture<TestGisSearchResultComponent>;
  let inputEl: DebugElement;
  let directive: HighlightDirective;
  let settingsService: SettingsService;
  let mockStore: MockStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestGisSearchResultComponent, HighlightDirective],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        provideMockStore({
          selectors: [
            {
              selector: opportunityPanelSelectors.selectFilteredLayers,
              value: ['Asset']
            }
          ]
        }),
        { provide: GisMapLargeService, useValue: mockGisMapLargeService },
        { provide: GisMapDataService, useClass: MockGisMapDataService },
        SettingsService
      ]
    });

    fixture = TestBed.createComponent(TestGisSearchResultComponent);
    mockStore = TestBed.inject(Store) as MockStore;
    component = fixture.componentInstance;
    inputEl = fixture.debugElement.query(By.directive(HighlightDirective));
    directive = inputEl.injector.get(HighlightDirective);
    settingsService = TestBed.inject(SettingsService);
    directive.selectedLayer = ['Asset'];
    inputEl = fixture.debugElement.query(By.css('.card-container'));
  });

  it('@HostListener : mouseenter', () => {
    jest.spyOn(directive, 'highlightResult');
    inputEl.triggerEventHandler('mouseenter', null);
    fixture.detectChanges();
    expect(directive.highlightResult).toHaveBeenCalled();
  });

  it('@HostListener : mouseleave - enable/disable highlight', () => {
    const layer = {
      name: '_gis_highlight_Well',
      originalOptions: {
        zIndex: 2
      },
      isReady: true,
      load: jest.fn(),
      show: jest.fn()
    };
    directive.settingsService.map.highlightResult = true;
    jest.spyOn(GisCanvas, 'layer').mockReturnValue(<any>layer);
    directive.highlightResultObject = 'opId';
    directive.settingsService.map.highlightResult = true;

    inputEl.triggerEventHandler('mouseenter', null);
    directive.settingsService.map.highlightResult = true;
    fixture.detectChanges();

    directive.settingsService.map.highlightResult = false;
    inputEl.triggerEventHandler('mouseleave', null);
    expect(gisMapDataServiceLayers.find((x) => x.name === '_gis_highlight_Well').originalOptions.visible).toBeFalsy();
    fixture.detectChanges();
  });

  it('@HostListener : mouseleave - return false on WMS', () => {
    directive.highlightResultObject = 'opId';
    directive.settingsService.map.highlightResult = true;
    inputEl.triggerEventHandler('mouseleave', null);
    fixture.detectChanges();
  });

  it('highlightResult() : should create new layer', () => {
    const layer = {
      originalOptions: {
        zIndex: 2
      },
      isReady: true,
      load: jest.fn(),
      show: jest.fn()
    };
    directive.settingsService.map.highlightResult = true;
    jest.spyOn(GisCanvas, 'layer').mockReturnValue(<any>layer);
    const layerObject = {
      shapeType: 'geo.dot',
      displayName: 'MockLayer',
      originalTableName: 'slb/Asset',
      recordId: 'tenant1:123'
    };
    const rules = [
      {
        style: {
          fillColor: '100-204-204-234',
          borderColor: '255-255-255-255'
        },
        where: [
          [
            {
              exp: 'PhysicalRowIndex() == 1'
            }
          ]
        ]
      }
    ];
    jest.spyOn(query, 'setSelectStyleRules').mockReturnValue(rules);
    directive.highlightResult(layerObject);
    directive.mapDataService.gisMapInstance.layers[0].originalOptions.style = {
      method: 'rules'
    };
    directive.gisMapLargeService.map.layers = [];
    directive.highlightResult(layerObject);
  });

  it('highlightResult() : should update existing layer', () => {
    const layer = {
      originalOptions: {
        zIndex: 2
      },
      isReady: true,
      load: jest.fn(),
      show: jest.fn()
    };
    directive.settingsService.map.highlightResult = true;
    jest.spyOn(GisCanvas, 'layer').mockReturnValue(<any>layer);
    const layerObject = {
      shapeType: 'geo.dot',
      displayName: 'MockLayer',
      originalTableName: 'slb/Asset'
    };
    const rules = [
      {
        style: {
          fillColor: '100-204-204-234',
          borderColor: '255-255-255-255'
        },
        where: [
          [
            {
              exp: 'PhysicalRowIndex() == 1'
            }
          ]
        ]
      }
    ];
    jest.spyOn(query, 'setSelectStyleRules').mockReturnValue(rules);
    directive.highlightResult(layerObject);
    directive.mapDataService.gisMapInstance.layers[0].originalOptions.style = {
      method: 'rules'
    };
    directive.highlightResult(layerObject);
  });

  it('highlightResult() : should not update style', () => {
    const layerObject = {
      shapeType: 'geo.dot',
      displayName: 'MockLayer',
      originalTableName: 'slb/Asset'
    };
    directive.settingsService.map.highlightResult = false;
    directive.highlightResult(layerObject);
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });
});
