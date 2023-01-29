import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { OpportunityService } from '@apollo/app/services/opportunity';
import { provideMockStore } from '@ngrx/store/testing';
import { SlbPaginationControlModule } from '@slb-dls/angular-material/pagination-control';
import { mockOpportunityService } from '../../shared/services.mock';
import * as opportunitySelectors from '../state/selectors/opportunity.selectors';
import { OpportunityRequestComponent } from './opportunity-request.component';

describe('OpportunityRequestComponent', () => {
  let component: OpportunityRequestComponent;
  let fixture: ComponentFixture<OpportunityRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OpportunityRequestComponent ],
      imports: [ MatTableModule, MatSortModule, SlbPaginationControlModule, NoopAnimationsModule ],
      providers: [
        {
          provide: OpportunityService,
          useValue: mockOpportunityService
        },
        provideMockStore({
          selectors:[
            {
              selector: opportunitySelectors.selectPendingOpportunityRequests,
              value: {
                opportunityId: "test 1"
              }
            },
            {
              selector: opportunitySelectors.selectApprovedOpportunityRequests,
              value: {
                opportunityId: "test 2"
              }
            },
            {
              selector: opportunitySelectors.selectRejectedOpportunityRequests,
              value: {
                opportunityId: "test 3"
              }
            },
          ]
        })
      ],
      schemas: [NO_ERRORS_SCHEMA,CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OpportunityRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
