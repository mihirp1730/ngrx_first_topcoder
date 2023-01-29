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
import { ApprovedRequestsComponent } from './approved-requests.component';

describe('ApprovedRequestsComponent', () => {
  let component: ApprovedRequestsComponent;
  let fixture: ComponentFixture<ApprovedRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ApprovedRequestsComponent],
      imports: [MatTableModule, MatSortModule, SlbPaginationControlModule, NoopAnimationsModule, MatMenuModule],
      providers: [
        {
          provide: OpportunityService,
          useValue: mockOpportunityService
        },
        provideMockStore({
          selectors: [
            {
              selector: opportunitySelectors.selectApprovedOpportunityRequests,
              value: [
                {
                  subscriptionRequestId: 'OSR-VD8-jk8ylck3vud4-267396186974',
                  opportunityId: 'OP-VD8-87lora5xm1ws-776750329938',
                  opportunityName: 'test',
                  opportunityStatus: 'Published',
                  status: 'Approved',
                  firstName: 'Kirti Narendra',
                  lastName: 'Kanchan',
                  requestedBy: 'kkanchan@slb.com',
                  vendorId: 'VD8-2bu4gh7pw2l8-841832760286',
                  requestedOn: '2022-10-12T07:14:53.699Z',
                  comment: 'testing ',
                  accessLevels: ['VDR', 'CONFIDENTIAL_INFORMATION'],
                  companyName: 'testing',
                  changeStatusComment: null,
                  changeStatusDate: '2022-10-12T07:16:59.666Z',
                  opportunitySubscriptionId: 'OPS-VD8-g6woksohz2fe-122978639291',
                  accessDetails: [
                    {
                      startDate: '2022-10-12T18:30:00.000Z',
                      endDate: '2022-10-14T18:30:00.000Z',
                      accessLevel: 'VDR',
                      status: 'APPROVED'
                    },
                    {
                      startDate: '2022-10-12T18:30:00.000Z',
                      endDate: '2022-10-30T18:30:00.000Z',
                      accessLevel: 'CONFIDENTIAL_INFORMATION',
                      status: 'APPROVED'
                    }
                  ]
                },
                {
                  subscriptionRequestId: 'OSR-VD8-jk8ylck3vud4-267396186974',
                  opportunityId: 'OP-VD8-87lora5xm1ws-776750329938',
                  opportunityName: 'test',
                  opportunityStatus: 'Published',
                  status: 'Approved',
                  firstName: 'Kirti Narendra',
                  lastName: 'Kanchan',
                  requestedBy: 'kkanchan@slb.com',
                  vendorId: 'VD8-2bu4gh7pw2l8-841832760286',
                  requestedOn: '2022-10-12T07:14:53.699Z',
                  comment: 'testing ',
                  accessLevels: ['VDR', 'CONFIDENTIAL_INFORMATION'],
                  companyName: 'testing',
                  changeStatusComment: null,
                  changeStatusDate: '2022-10-12T07:16:59.666Z',
                  opportunitySubscriptionId: 'OPS-VD8-g6woksohz2fe-122978639291',
                  accessDetails: undefined
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
    fixture = TestBed.createComponent(ApprovedRequestsComponent);
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
