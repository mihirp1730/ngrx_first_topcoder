import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayerFilterComponent } from './layer-filter.component';

import { Store } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { GisMapLargeService } from '@slb-innersource/gis-canvas';
import { mockGisMapLargeService } from '../../shared/services.mock';
import * as opportunityPanelSelectors from '../state/selectors/opportunity-panel.selectors';

describe('LayerFilterComponent', () => {
  let component: LayerFilterComponent;
  let fixture: ComponentFixture<LayerFilterComponent>;
  let mockStore: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LayerFilterComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore({
          selectors: [
            {
              selector: opportunityPanelSelectors.selectFilteredLayers,
              value: ['Asset']
            }
          ]
        }),
        { provide: GisMapLargeService, useValue: mockGisMapLargeService }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LayerFilterComponent);
    mockStore = TestBed.inject(Store) as MockStore;
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch an action', () => {
    const spy = jest.spyOn(mockStore, 'dispatch').mockImplementation();
    component.ngOnInit();
    expect(spy).toHaveBeenCalled();
  });

  it('should call clear filter', () => {
    component.clearFilter();
    expect(component.selectedLayers.value).toStrictEqual([]);
  });

  it('should trigger the selected layer valueChange method', () => {
    component.ngOnInit();
    component.selectedLayers.patchValue(['Asset']);
    expect(component.itemSelected).toBeTruthy();
  });
});
