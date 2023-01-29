import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { OpportunityService } from '@apollo/app/services/opportunity';
import { provideMockStore } from '@ngrx/store/testing';
import { SlbPaginationControlModule } from '@slb-dls/angular-material/pagination-control';

import { mockOpportunityService } from '../../../shared/services.mock';
import * as opportunitySelectors from '../../state/selectors/opportunity.selectors';
import { PendingRequestsComponent } from './pending-requests.component';

describe('PendingRequestsComponent', () => {
  let component: PendingRequestsComponent;
  let fixture: ComponentFixture<PendingRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PendingRequestsComponent],
      imports: [MatTableModule, MatSortModule, SlbPaginationControlModule, NoopAnimationsModule, MatMenuModule],
      providers: [
        {
          provide: OpportunityService,
          useValue: mockOpportunityService
        },
        provideMockStore({
          selectors: [
            {
              selector: opportunitySelectors.selectPendingOpportunityRequests,
              value: [
                {
                  subscriptionRequestId: 'OSR-VD8-zlopx16hk2u9-657945956578',
                  opportunityId: 'OP-VD8-wsvy2csyhcko-898295512692',
                  opportunityName: '1043736 - V2',
                  opportunityStatus: 'Published',
                  status: 'Pending',
                  firstName: 'Mudassar Nazar',
                  lastName: 'Raheman',
                  requestedBy: 'mraheman@slb.com',
                  vendorId: 'VD8-2bu4gh7pw2l8-841832760286',
                  requestedOn: '2022-10-13T09:50:26.359Z',
                  comment: 'Test message',
                  accessLevels: ['VDR', 'CONFIDENTIAL_INFORMATION'],
                  companyName: 'Test company',
                  changeStatusComment: null,
                  changeStatusDate: '',
                  opportunitySubscriptionId: '',
                  accessDetails: []
                }
              ]
            }
          ]
        }),
        {
          provide: MatDialog,
          useValue: {
            open: jest.fn()
          }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });
  beforeEach(() => {
    fixture = TestBed.createComponent(PendingRequestsComponent);
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

  it('should open dialog', () => {
    component.approveRequest({} as any);
    expect(component.dialog).toBeTruthy();
  });

  it('should open dialog', () => {
    component.rejectRequest({} as any);
    expect(component.dialog).toBeTruthy();
  });
});
