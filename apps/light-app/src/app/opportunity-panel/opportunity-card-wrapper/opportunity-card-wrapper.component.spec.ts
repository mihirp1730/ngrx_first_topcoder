import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LassoToolsService } from '@apollo/app/lasso-tools';
import { LassoPersistenceService } from '@apollo/app/services/lasso-persistence';
import { Store } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { mockLassoPersistenceService, mockLassoToolsService } from '../../shared/services.mock';

import * as opportunityPanelSelectors from '../state/selectors/opportunity-panel.selectors';
import { OpportunityCardWrapperComponent } from './opportunity-card-wrapper.component';

describe('OpportunityDashboardComponent', () => {
  let component: OpportunityCardWrapperComponent;
  let fixture: ComponentFixture<OpportunityCardWrapperComponent>;

  let mockStore: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OpportunityCardWrapperComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        provideMockStore({
          selectors: [
            {
              selector: opportunityPanelSelectors.deduceOpportunities,
              value: []
            },
            {
              selector: opportunityPanelSelectors.opportunitiesTotal,
              value: 10
            },
            {
              selector: opportunityPanelSelectors.selectIsFilterSelected,
              value: 10
            },
            {
              selector: opportunityPanelSelectors.selectLassoArea,
              value: ''
            },
            {
              selector: opportunityPanelSelectors.selectFilteredOpportunities,
              value: [
                { opportunityId: 'testId' },
                { opportunityId: 'testId2' },
                { opportunityId: 'testId3' },
                { opportunityId: 'testId4' },
                { opportunityId: 'testId5' },
                { opportunityId: 'testId6' }
              ]
            }
          ]
        }),
        {
          provide: LassoPersistenceService,
          useValue: mockLassoPersistenceService
        },
        {
          provide: LassoToolsService,
          useValue: mockLassoToolsService
        },
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OpportunityCardWrapperComponent);
    component = fixture.componentInstance;
    // IntersectionObserver isn't available in test environment
    const mockIntersectionObserver = jest.fn();
    mockIntersectionObserver.mockReturnValue({
      observe: () => null,
      unobserve: () => null,
      disconnect: () => null,
      takeRecords: jest.fn()
    });
    window.IntersectionObserver = mockIntersectionObserver;
    mockStore = TestBed.inject(Store) as MockStore;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch loadMoreOpportunities action', () => {
    const spy = jest.spyOn(mockStore, 'dispatch').mockImplementation();
    component.getOpportunities();
    expect(spy).toHaveBeenCalled();
  });

  it('should dispatch loadMoreOpportunities action', () => {
    const spy = jest.spyOn(mockStore, 'dispatch').mockImplementation();
    component.getOpportunities();
    expect(spy).toHaveBeenCalled();
  });
 
  it('should clear the lasso selection or onClick opportunity event', () => {
    const spy = jest.spyOn(mockStore, 'dispatch').mockImplementation();
    component.clearLassoSelection();
    expect(spy).toHaveBeenCalled();
  });
});
