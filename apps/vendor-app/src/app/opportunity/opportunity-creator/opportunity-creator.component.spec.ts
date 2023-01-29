import * as mocks from '../../shared/services.mock';
import * as opportunitySelectors from '../state/selectors/opportunity.selectors';

import { ActivatedRoute, Router } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MockStore, provideMockStore } from '@ngrx/store/testing';

import { MatTabChangeEvent } from '@angular/material/tabs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { OpportunityCreatorComponent } from './opportunity-creator.component';
import { RouterTestingModule } from '@angular/router/testing';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';

describe('OpportunitCreatorComponent', () => {
  let component: OpportunityCreatorComponent;
  let fixture: ComponentFixture<OpportunityCreatorComponent>;
  let mockStore: MockStore;
  const route = { data: of({ editMode: true }) } as any as ActivatedRoute;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OpportunityCreatorComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [FormsModule, ReactiveFormsModule, RouterTestingModule, NoopAnimationsModule],
      providers: [
        {
          provide: Router,
          useValue: mocks.mockRouter
        },
        {
          provide: ActivatedRoute,
          useValue: route
        },
        provideMockStore({
          selectors: [
            {
              selector: opportunitySelectors.selectCreatedOpportunityId,
              value: {
                opportunityId: 'test 1'
              }
            },
            {
              selector: opportunitySelectors.selectIsOpportunityPublished,
              value: {
                isOpportunityPublished: true
              }
            },
            {
              selector: opportunitySelectors.selectCreationDetails,
              value: {
                opportunityName: 'test 1'
              }
            },
            {
              selector: opportunitySelectors.deduceIsOpportunityChanged,
              value: true
            },
            {
              selector: opportunitySelectors.selectIsOpportunityReadyToPublish,
              value: true
            },
            {
              selector: opportunitySelectors.selectOpportunity,
              value: {
                opportunityId: '123',
                opportunityName: 'Sample Opportunity',
                opportunityType: 'Public',
                lastModifiedDate: '2022-09-01T04:19:48.906Z',
                opportunityProfile: {
                  overview: 'test',
                  media: [{}],
                  documents: []
                }
              }
            }
          ]
        })
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OpportunityCreatorComponent);
    mockStore = TestBed.inject(Store) as MockStore;
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('save draft', () => {
    it('should call save opportunity', () => {
      const spy = jest.spyOn(mockStore, 'dispatch').mockImplementation();
      component.opportunityId = '';
      component.saveAsDraft();
      expect(spy).toHaveBeenCalled();
    });
    it('should call edit opportunity', () => {
      const spy = jest.spyOn(mockStore, 'dispatch').mockImplementation();
      component.opportunityId = 'test';
      component.saveAsDraft();
      expect(spy).toHaveBeenCalled();
    });
  });

  it('should update opportunity id and type in opportunity details', () => {
    const spy = jest.spyOn(mockStore, 'dispatch').mockImplementation();
    component.updateOpportunityNameNType();
    expect(spy).toHaveBeenCalled();
  });

  it('should dispatch detailsFormIsValid', () => {
    const spy = jest.spyOn(mockStore, 'dispatch').mockImplementation();
    component.detailsFormIsValid(true);
    expect(spy).toHaveBeenCalled();
  });

  it('should dispatch openInformationFormIsValid', () => {
    const spy = jest.spyOn(mockStore, 'dispatch').mockImplementation();
    component.openInformationFormIsValid(true);
    expect(spy).toHaveBeenCalled();
  });

  it('should dispatch confidentialInfoFormIsValid', () => {
    const spy = jest.spyOn(mockStore, 'dispatch').mockImplementation();
    component.confidentialInfoFormIsValid(true);
    expect(spy).toHaveBeenCalled();
  });

  it('should dispatch additionalServicesInfoFormIsValid', () => {
    const spy = jest.spyOn(mockStore, 'dispatch').mockImplementation();
    component.additionalServicesInfoFormIsValid(true);
    expect(spy).toHaveBeenCalled();
  });

  it('should dispatch opportunityNameChanged', () => {
    const spy = jest.spyOn(mockStore, 'dispatch').mockImplementation();
    component.opportunityNameChanged('test1');
    expect(spy).toHaveBeenCalled();
  });
  it('should dispatch opportunityTypeChanged', () => {
    const spy = jest.spyOn(mockStore, 'dispatch').mockImplementation();
    component.opportunityTypeChanged('Public' as any);
    expect(spy).toHaveBeenCalled();
  });

  it('should go back to vendor route', () => {
    component.onGoHome();
    expect(mocks.mockRouter.navigateByUrl).toHaveBeenCalledWith('/vendor');
  });

  it('should dispatch opportunityOpenInformation', () => {
    const spy = jest.spyOn(mockStore, 'dispatch').mockImplementation();
    component.opportunityOpenInformation({} as any);
    expect(spy).toHaveBeenCalled();
  });

  it('should dispatch opportunityConfidentialInformation', () => {
    const spy = jest.spyOn(mockStore, 'dispatch').mockImplementation();
    component.opportunityConfidentialInformation({} as any);
    expect(spy).toHaveBeenCalled();
  });

  it('should dispatch opportunityAdditionalServices', () => {
    const spy = jest.spyOn(mockStore, 'dispatch').mockImplementation();
    component.opportunityAdditionalServices({} as any);
    expect(spy).toHaveBeenCalled();
  });

  it('should asset tab trigger showGisCanvas ', () => {
    const testEvent: MatTabChangeEvent = { index: 2, tab: null };
    component.selectedTabChange(testEvent);
    expect(component.animationState).toBe('showGisCanvas');
  });

  it('should other tabs hide GisCanvas ', () => {
    const testEvent: MatTabChangeEvent = { index: 3, tab: null };
    component.selectedTabChange(testEvent);
    expect(component.animationState).toBe('hideGisCanvas');
  });

  it('should publish opportunity', () => {
    const spy = jest.spyOn(mockStore, 'dispatch').mockImplementation();
    component.publishOpportunity();
    expect(spy).toHaveBeenCalled();
  });

  it('should publish opportunity', () => {
    const spy = jest.spyOn(mockStore, 'dispatch').mockImplementation();
    component.assetShapeIsValid(true);
    expect(spy).toHaveBeenCalled();
  });

  it('should dispatch updateOpportunityDetails', () => {
    const spy = jest.spyOn(mockStore, 'dispatch').mockImplementation();
    component.opportunityDetailsChanged({} as any);
    expect(spy).toHaveBeenCalled();
  });

  it('should dispatch updateOpportunityDetails', () => {
    const spy = jest.spyOn(mockStore, 'dispatch').mockImplementation();
    component.opportunityDetailsChanged({ assetType: ['Carbon Trading'] } as any);
    expect(spy).toHaveBeenCalled();
  });

  it('should create new opportunity on create opportunity form changes',() => {
    const spy = jest.spyOn(mockStore, 'dispatch').mockImplementation();
    const values = {
      opportunityName: 'abc',
      opportunityId: 231
    }
    component.createOpportunityFormChanged(values);
    expect(spy).toHaveBeenCalled();
  });
});
