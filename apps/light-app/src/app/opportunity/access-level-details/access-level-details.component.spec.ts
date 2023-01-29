import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { initialState } from '../state/opportunity-attendee.state';

import * as opportunityAttendeeSelector from '../state/selectors/opportunity-attendee.selectors';
import { AccessLevelDetailsComponent } from './access-level-details.component';

const mockOpportunity = {
  opportunityId: 'test',
  opportunityName: 'publish demo',
  opportunityStatus: 'Published',
  opportunityType: 'PUBLIC',
  dataVendorId: 'XYZ-yrde08gxk3de-097273363452',
  opportunityProfile: {
    overview: '',
    asset: [],
    assetType: [],
    offer: [],
    contract: [],
    offerStartDate: '2022-11-07T05:40:41.410Z',
    offerEndDate: '2022-11-07T05:40:41.410Z',
    media: [],
    documents: []
  },
  confidentialOpportunityProfile: {
    documents: []
  },
  countries: [],
  opportunityVDR: {
    opportunityVDRId: 'vdr-id',
    accountName: 'account-name',
    departmentName: 'dept-name',
    vdrLink: 'http:test-lnk',
    hasAccess: true
  },
  requests: [
    {
      accessLevels: ['CONFIDENTIAL_INFORMATION', 'VDR'],
      opportunityId: 'test',
      opportunityName: 'oppo-name-1',
      requestStatus: 'Pending',
      requestedOn: '2022-05-06T05:15:42.384Z',
      subscriptionRequestId: 'subs-id-1',
      vendorId: 'vendor-id-1'
    }
  ],
  subscriptions: [
    {
      accessDetails: [{ startDate: '2022-05-03T18:30Z', endDate: '2022-05-05T18:30Z', accessLevel: 'VDR', accessStatus: 'Approved' }],
      approvedBy: 'approver-2',
      approvedOn: '5/2/22, 11:12 AM',
      opportunityId: 'test',
      opportunityName: 'oppo-name-2',
      subscriptionId: 'subs-id-2',
      subscriptionRequestId: null,
      vendorId: 'vendor-id-2'
    }
  ]
};

describe('AccessLevelDetailsComponent', () => {
  let component: AccessLevelDetailsComponent;
  let fixture: ComponentFixture<AccessLevelDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AccessLevelDetailsComponent],
      providers: [
        provideMockStore({
          initialState: {
            'opportunity-attendee': {
              ...initialState,
              opportunities: [mockOpportunity]
            }
          },
          selectors: [
            {
              selector: opportunityAttendeeSelector.selectOpportunityVDR({ opportunityId: 'test' }),
              value: {
                opportunityVDRId: 'vdr-id',
                accountName: 'account-name',
                departmentName: 'dept-name',
                vdrLink: 'http:test-lnk',
                hasAccess: true
              }
            },
            {
              selector: opportunityAttendeeSelector.selectOpportunityVDRRequests({ opportunityId: 'test' }),
              value: {
                accessLevels: ['CONFIDENTIAL_INFORMATION', 'VDR'],
                opportunityId: 'test',
                opportunityName: 'oppo-name-1',
                requestStatus: 'Pending',
                requestedOn: '2022-05-06T05:15:42.384Z',
                subscriptionRequestId: 'subs-id-1',
                vendorId: 'vendor-id-1'
              }
            },
            {
              selector: opportunityAttendeeSelector.selectOpportunityVDRSubscription({ opportunityId: 'test' }),
              value: [
                {
                  accessDetails: [
                    { startDate: '2022-05-03T18:30Z', endDate: '2022-05-05T18:30Z', accessLevel: 'VDR', accessStatus: 'Approved' }
                  ],
                  approvedBy: 'approver-2',
                  approvedOn: '5/2/22, 11:12 AM',
                  opportunityId: 'test',
                  opportunityName: 'oppo-name-2',
                  subscriptionId: 'subs-id-2',
                  subscriptionRequestId: null,
                  vendorId: 'vendor-id-2'
                }
              ]
            }
          ]
        })
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccessLevelDetailsComponent);
    component = fixture.componentInstance;
    component.selectedOpportunityId = 'test';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
