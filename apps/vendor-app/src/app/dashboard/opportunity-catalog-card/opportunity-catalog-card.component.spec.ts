import * as opportunityCatalogSelector from '../state/selectors/opportunity-catalog.selectors';
import * as opportunitySelectors from '../../opportunity/state/selectors/opportunity.selectors';

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { mockMediaDownloadService, mockRouter } from '../../shared/services.mock';

import { DataObjectsPipe } from '../pipe/data-objects.pipe';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MediaDownloadService } from '@apollo/app/services/media-download';
import { MessageService } from '@slb-dls/angular-material/notification';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { OpportunityCatalogCardComponent } from './opportunity-catalog-card.component';
import { OpportunityType } from '@apollo/app/services/opportunity';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';

export const mockMatDialogModal = {
  open: jest.fn()
};

const mockMessageService = {
  add: jest.fn()
};

describe('OpportunityCatalogCardComponent', () => {
  let component: OpportunityCatalogCardComponent;
  let mockStore: MockStore;
  let fixture: ComponentFixture<OpportunityCatalogCardComponent>;
  let service: MessageService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OpportunityCatalogCardComponent, DataObjectsPipe],
      imports: [MatMenuModule],
      providers: [
        provideMockStore({
          selectors: [
            {
              selector: opportunityCatalogSelector.selectAttendeeSubscriptionsCreated,
              value: ['sub-id-1', 'sub-id2']
            },
            {
              selector: opportunitySelectors.selectOpportunitySubscriptions,
              value: [
                {
                  opportunityId: 'test 1',
                  username: 'user 1',
                  opportunityName: 'opp_name_1',
                  accessDetails: [
                    {
                      accessLevel: 'confidential_information'
                    },
                    {
                      accessLevel: 'xyz'
                    }
                  ]
                },
                {
                  opportunityId: 'test 2',
                  username: 'user 2',
                  opportunityName: 'opp_name_2',
                  accessDetails: [
                    {
                      accessLevel: 'vdr'
                    }
                  ]
                },
                {
                  opportunityId: 'test 3',
                  username: 'user 2',
                  opportunityName: 'opp_name_2'
                },
                {
                  opportunityId: 'test 4',
                  username: 'user 2',
                  opportunityName: 'opp_name_2',
                  accessDetails: [
                    {
                      accessLevel: 'newAccessLevel'
                    }
                  ]
                },
                {
                  opportunityId: 'test 5',
                  username: 'user 2',
                  opportunityName: 'opp_name_2',
                  accessDetails: [{}]
                }
              ]
            },
            {
              selector: opportunitySelectors.selectPendingOpportunityRequests,
              value: [
                {
                  opportunityId: 'opp-id-2',
                  opportunityName: 'opp-name-2',
                  status: 'PENDING',
                  firstName: 'name-first',
                  lastName: 'name-last',
                  requestedOn: '05-Jan-2022',
                  requestedBy: 'test',
                  comment: 'tes',
                  requestedFor: ['est'],
                  accessLevels: [],
                  vendorId: 'test',
                  companyName: 'test',
                  subscriptionRequestId: 'sub-request-id'
                }
              ]
            },
            {
              selector: opportunitySelectors.selectApprovedOpportunityRequests,
              value: [
                {
                  opportunityId: 'opp-id-2',
                  opportunityName: 'opp-name-2',
                  status: 'PENDING',
                  firstName: 'name-first',
                  lastName: 'name-last',
                  requestedOn: '05-Jan-2022',
                  requestedBy: 'test',
                  comment: 'tes',
                  requestedFor: ['est'],
                  accessLevels: [],
                  vendorId: 'test',
                  companyName: 'test',
                  opportunitySubscriptionId: 'subctn-id'
                }
              ]
            }
          ]
        }),
        {
          provide: MatDialog,
          useValue: {
            open: () => {
              return {
                componentInstance: {
                  createSubscriptionClickEvent: of({}),
                  getSubscriptionsEvent: of({})
                }
              };
            }
          }
        },
        {
          provide: MediaDownloadService,
          useValue: mockMediaDownloadService
        },
        {
          provide: Router,
          useValue: mockRouter
        },
        {
          provide: MessageService,
          useValue: mockMessageService
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
    service = TestBed.inject(MessageService);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OpportunityCatalogCardComponent);
    mockStore = TestBed.inject(Store) as MockStore;
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should ngonchange', () => {
    const change: any = { opportunityDetails: { currentValue: {} } };
    component.opportunityDetails = {
      opportunityId: 'test-opportunity-id',
      opportunityName: 'test-opportunity-name',
      opportunityType: 'test-opportunity-type',
      userId: 'test-user-id',
      billingAccountId: 'test-billing-id',
      dataVendorId: 'vendor-id',
      opportunityProfile: {
        media: [
          {
            fileId: 'test'
          }
        ]
      }
    } as any;
    component.ngOnChanges(change);
    expect(component.opportunityName).toBe('test-opportunity-name');
  });

  it('should ngonchange', () => {
    const change: any = { opportunityDetails: { currentValue: {} } };
    component.opportunityDetails = {
      opportunityId: 'test-opportunity-id',
      opportunityName: '',
      opportunityType: 'test-opportunity-type',
      userId: 'test-user-id',
      billingAccountId: 'test-billing-id',
      dataVendorId: 'vendor-id'
    } as any;
    component.ngOnChanges(change);
    expect(component.opportunityName).toBe('No Value!');
  });

  it('should call getConfirmationMessage with "unPublish"', () => {
    const id = 'test-id';
    component.opportunityDetails = {
      opportunityId: 'test-opportunity-id-1',
      opportunityName: 'test-opportunity-name-1',
      opportunityType: 'test-opportunity-type',
      userId: 'test-user-id',
      billingAccountId: 'test-billing-id',
      dataVendorId: 'vendor-id',
      opportunityProfile: {
        media: [
          {
            fileId: 'test'
          }
        ]
      }
    } as any;
    component.isPendingRequests = true;
    component.isApprovedRequests = true;
    component.isSubscribedViaInvitation = false;
    const getConfirmationMessageSpy = jest.spyOn(component, 'getConfirmationMessage').mockReturnValue('test message');
    component.unPublishOpportunity(id);
    expect(getConfirmationMessageSpy).toHaveBeenCalledWith('unPublish');
  });

  it('should call getConfirmationMessage with "delete"', () => {
    const id = 'test-id';
    component.opportunityDetails = {
      opportunityId: 'test-opportunity-id-2',
      opportunityName: 'test-opportunity-name-2',
      opportunityType: 'test-opportunity-type',
      userId: 'test-user-id',
      billingAccountId: 'test-billing-id',
      dataVendorId: 'vendor-id',
      opportunityProfile: {
        media: [
          {
            fileId: 'test'
          }
        ]
      }
    } as any;
    component.isPendingRequests = true;
    component.isApprovedRequests = true;
    component.isSubscribedViaInvitation = false;
    const getConfirmationMessageSpy = jest.spyOn(component, 'getConfirmationMessage').mockReturnValue('test message');
    component.deleteOpportunity(id);
    expect(getConfirmationMessageSpy).toHaveBeenCalledWith('delete');
  });

  it('should return proper messsage on calling getConfirmationMessage with arg "delete"', () => {
    component.isPendingRequests = true;
    component.isApprovedRequests = true;
    component.isSubscribedViaInvitation = false;
    component.opportunityDetails = {
      opportunityId: 'test-opportunity-id-1',
      opportunityName: 'test-opportunity-name-1'
    } as any;
    const opportunityName = 'test-opportunity-name-1';
    const result = component.getConfirmationMessage('delete');
    expect(result).toEqual(
      `There are pending access requests and existing subscribers of this opportunity whose access was on hold while <b style="word-break: break-all;">"${opportunityName}"</b> unpublished. They will permanently lose access if it is deleted and this action cannot be undone. Continue anyway?`
    );
  });

  it('should return proper messsage on calling getConfirmationMessage with arg "unPublish"', () => {
    component.isPendingRequests = true;
    component.isApprovedRequests = true;
    component.isSubscribedViaInvitation = true;
    component.opportunityDetails = {
      opportunityId: 'test-opportunity-id-2',
      opportunityName: 'test-opportunity-name-2'
    } as any;
    const opportunityName = 'test-opportunity-name-2';
    const result = component.getConfirmationMessage('unPublish');
    expect(result).toEqual(
      `There are pending access requests and existing subscribers of this opportunity who will lose access if <b style="word-break: break-all;">"${opportunityName}"</b> is unpublished. Access will be resumed once the opportunity is published again. Do you want to continue?`
    );
  });

  it('should return proper messsage on calling getConfirmationMessage with arg "delete"', () => {
    component.isPendingRequests = true;
    component.isApprovedRequests = false;
    component.isSubscribedViaInvitation = false;
    component.opportunityDetails = {
      opportunityId: 'test-opportunity-id-3',
      opportunityName: 'test-opportunity-name-3'
    } as any;
    const opportunityName = 'test-opportunity-name-3';
    const result = component.getConfirmationMessage('delete');
    expect(result).toEqual(
      `There are open pending request for opportunity <b style="word-break: break-all;">"${opportunityName}"</b>. You will no longer be able to approve them once deleted. This action can't be undone. Continue anyway?`
    );
  });

  it('should return proper messsage on calling getConfirmationMessage with arg "unPublish"', () => {
    component.isPendingRequests = true;
    component.isApprovedRequests = false;
    component.isSubscribedViaInvitation = false;
    component.opportunityDetails = {
      opportunityId: 'test-opportunity-id-4',
      opportunityName: 'test-opportunity-name-4'
    } as any;
    const opportunityName = 'test-opportunity-name-4';
    const result = component.getConfirmationMessage('unPublish');
    expect(result).toEqual(
      `There are pending access requests for this opportunity -<b style="word-break: break-all;">"${opportunityName}"</b>. Do you want to continue?`
    );
  });

  it('should dispatch delete Opportunity', () => {
    const id = 'test-id';
    const spy = jest.spyOn(mockStore, 'dispatch').mockImplementation();
    component.confirmationForDelete(id);
    expect(spy).toHaveBeenCalled();
  });

  it('should dispatch invite attendees modal', () => {
    const spy = jest.spyOn(mockStore, 'dispatch').mockImplementation();
    component.opportunityDetails = {
      opportunityId: 'test-opportunity-id',
      opportunityName: 'test-opportunity-name',
      opportunityType: 'test-opportunity-type',
      userId: 'test-user-id',
      billingAccountId: 'test-billing-id',
      dataVendorId: 'vendor-id',
      opportunityProfile: {
        media: [
          {
            fileId: 'test'
          }
        ]
      }
    } as any;
    component.inviteAttendees();
    expect(spy).toHaveBeenCalled();
  });

  it('should dispatch unPublish opportunity', () => {
    const id = 'op-dfsgfdg-sdfd';
    const spy = jest.spyOn(mockStore, 'dispatch').mockImplementation();
    component.confirmationForUnPublish(id);
    expect(spy).toHaveBeenCalled();
  });

  it('should navigate to opportunity edit', () => {
    component.opportunityDetails = {
      opportunityId: 'test-opportunity-id'
    } as any;
    component.editOpportunity();
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('vendor/edit/test-opportunity-id');
  });

  it('should send an confirmation', () => {
    let detailMsg: string;
    component.opportunityDetails = {
      opportunityId: 'opp-sdgf-435',
      opportunityType: OpportunityType.Public,
      opportunityName: 'test-opp'
    };
    if (
      component.opportunityDetails.opportunityType === OpportunityType.Public ||
      component.opportunityDetails.opportunityType === OpportunityType.Partial
    ) {
      detailMsg = 'this opportunity have many subscriptions associated.';
    } else {
      detailMsg = 'this opportunity have many invites associated.';
    }
    service.add({
      severity: null,
      summary: 'test',
      detail: detailMsg
    });
    expect(mockMessageService.add).toHaveBeenCalled();
  });

  describe('should return the opportunity status icon', () => {
    it('should return earth', () => {
      expect(component.iconSelector('PUBLIC')).toBe('earth');
    });

    it('should return locked', () => {
      expect(component.iconSelector('PRIVATE')).toBe('locked');
    });
  });
});
