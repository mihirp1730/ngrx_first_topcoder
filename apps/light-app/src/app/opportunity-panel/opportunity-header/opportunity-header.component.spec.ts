import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';

import { GisHandlerService } from '../../map-wrapper/services/gis-handler.service';
import { mockGisHandlerService } from '../../shared/services.mock';
import * as opportunityPanelSelectors from '../state/selectors/opportunity-panel.selectors';
import { OpportunityHeaderComponent } from './opportunity-header.component';

describe('OpportunityHeaderComponent', () => {
  let component: OpportunityHeaderComponent;
  let fixture: ComponentFixture<OpportunityHeaderComponent>;
  let mockStore: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OpportunityHeaderComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        provideMockStore({
          selectors: [
            {
              selector: opportunityPanelSelectors.selectFilteredOpportunities,
              value: [
                {
                  opportunityName: 'test12',
                  opportunityId: 'test12'
                },
                {
                  opportunityName: 'test12',
                  opportunityId: 'test12'
                }
              ]
            },
            {
              selector: opportunityPanelSelectors.selectSearchTerm,
              value: 'test'
            }
          ]
        }),
        {
          provide: GisHandlerService,
          useValue: mockGisHandlerService
        }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OpportunityHeaderComponent);
    mockStore = TestBed.inject(Store) as MockStore;
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call set search term', () => {
    const spy = jest.spyOn(mockStore, 'dispatch').mockImplementation();
    component.onSearch('searchTerm');
    expect(spy).toHaveBeenCalled();
  });

  it('should call clear search', () => {
    const spy = jest.spyOn(mockStore, 'dispatch').mockImplementation();
    component.clearSearch();
    expect(spy).toHaveBeenCalled();
  });

  it('should call search Term Change function', () => {
    const spy = jest.spyOn(mockStore, 'dispatch').mockImplementation();
    component.searchTermChange('');
    expect(spy).toHaveBeenCalled();
  });

  it('should emit filter change', () => {
    const spyEmit = jest.spyOn(component.filterChange, 'emit');
    component.onFilterChange();
    expect(spyEmit).toHaveBeenCalled();
  });

  it('should return attribute selected values', () => {
    const values = [
      { name: 'CCUS', selected: true },
      { name: 'Carbon', selected: false }
    ];
    expect(component.checkValues(values)).toStrictEqual(['CCUS']);
  });

  it('should call detectDataObjectFilterChanged', () => {
    component.dataObjectFilterChanged = true;
    component.detectDataObjectFilterChanged(component.dataObjectFilterChanged);
    expect(component.dataObjectFilterChanged).toBeFalsy();
  });
});
