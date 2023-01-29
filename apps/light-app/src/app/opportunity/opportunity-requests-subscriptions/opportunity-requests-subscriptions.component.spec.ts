import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeatureFlagService } from '@apollo/app/feature-flag';
import { OpportunityAttendeeService } from '@apollo/app/services/opportunity-attendee';
import { provideMockStore } from '@ngrx/store/testing';

import { mockFeatureFlagService, mockOpportunityAttendeeService } from '../../shared/services.mock';
import * as opportunityAttendeeSelectors from '../state/selectors/opportunity-attendee.selectors';
import { OpportunityRequestsSubscriptionsComponent } from './opportunity-requests-subscriptions.component';

describe('OpportunityRequestsSubscriptionsComponent', () => {
  let component: OpportunityRequestsSubscriptionsComponent;
  let fixture: ComponentFixture<OpportunityRequestsSubscriptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OpportunityRequestsSubscriptionsComponent],
      providers: [
        {
          provide: OpportunityAttendeeService,
          useValue: mockOpportunityAttendeeService
        },
        {
          provide: FeatureFlagService,
          useValue: mockFeatureFlagService
        },
        provideMockStore({
          selectors: [
            {
              selector: opportunityAttendeeSelectors.selectOpportunityRequests,
              value: {
                opportunityId: 'test 1'
              }
            }
          ]
        })
      ],
      schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OpportunityRequestsSubscriptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
