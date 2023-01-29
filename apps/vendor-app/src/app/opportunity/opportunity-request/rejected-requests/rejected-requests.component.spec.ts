import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatMenuModule } from '@angular/material/menu';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { OpportunityService } from '@apollo/app/services/opportunity';
import { provideMockStore } from '@ngrx/store/testing';
import { SlbPaginationControlModule } from '@slb-dls/angular-material/pagination-control';

import { mockOpportunityService } from '../../../shared/services.mock';
import * as opportunitySelectors from '../../state/selectors/opportunity.selectors';
import { RejectedRequestsComponent } from './rejected-requests.component';

describe('RejectedRequestsComponent', () => {
  let component: RejectedRequestsComponent;
  let fixture: ComponentFixture<RejectedRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RejectedRequestsComponent],
      imports: [MatTableModule, MatSortModule, SlbPaginationControlModule, NoopAnimationsModule, MatMenuModule],
      providers: [
        {
          provide: OpportunityService,
          useValue: mockOpportunityService
        },
        provideMockStore({
          selectors: [
            {
              selector: opportunitySelectors.selectRejectedOpportunityRequests,
              value: [
                {
                  subscriptionRequestId: 'OSR-VD8-qtuv6mmg1pvp-543190229698',
                  opportunityId: 'OP-VD8-bfhmj12rsylx-091023337503',
                  opportunityName: 'test publish private',
                  opportunityStatus: 'Expired',
                  status: 'Rejected',
                  firstName: 'Donna',
                  lastName: 'Ghai',
                  requestedBy: 'dghai@slb.com',
                  vendorId: 'VD8-2bu4gh7pw2l8-841832760286',
                  requestedOn: '2022-07-05T08:08:07.474Z',
                  comment: '',
                  accessLevels: ['VDR', 'CONFIDENTIAL_INFORMATION'],
                  companyName: 'test',
                  changeStatusComment: 'test',
                  changeStatusDate: '2022-07-05T08:08:34.968Z',
                  opportunitySubscriptionId: '',
                  accessDetails: []
                }
              ]
            }
          ]
        })
      ],
      schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RejectedRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should unsubscribe the subscription', () => {
    jest.spyOn(component.subscriptions, 'unsubscribe');
    component.ngOnDestroy();
    expect(component.subscriptions.unsubscribe).toHaveBeenCalled();
  });
});
