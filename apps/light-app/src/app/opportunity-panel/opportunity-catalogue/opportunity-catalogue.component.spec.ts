import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Store } from '@ngrx/store';

import { MockStore, provideMockStore } from '@ngrx/store/testing';
import * as opportunityPanelSelectors from '../state/selectors/opportunity-panel.selectors';
import { OpportunityCatalogueComponent } from './opportunity-catalogue.component';

describe('OpportunityCatalogueComponent', () => {
  let component: OpportunityCatalogueComponent;
  let fixture: ComponentFixture<OpportunityCatalogueComponent>;
  let mockStore: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OpportunityCatalogueComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        provideMockStore({
          selectors: [
            {
              selector: opportunityPanelSelectors.selectedOpportunityId,
              value: 'test-123'
            }
          ]
        })
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OpportunityCatalogueComponent);
    mockStore = TestBed.inject(Store) as MockStore;
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch an action to set opportunity id', () => {
    const spy = jest.spyOn(mockStore, 'dispatch').mockImplementation();
    component.onCloseOpportunityDetails();
    expect(spy).toHaveBeenCalled();
  });
});
