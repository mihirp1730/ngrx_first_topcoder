import * as opportunityAttendeeActions from '../state/actions/opportunity-attendee.actions';
import * as opportunityAttendeeSelector from '../state/selectors/opportunity-attendee.selectors';

import { ATTENDEE_FILE_DOWNLOAD_SERVICE, OpportunityAttendeeService } from '@apollo/app/services/opportunity-attendee';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MEDIA_FILE_DOWNLOAD_API_URL, MediaDownloadService } from '@apollo/app/services/media-download';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import {
  mockFeatureFlagService,
  mockLogoMediaDownloadService,
  mockMediaDocumentUploaderService,
  mockNotificationService,
  mockOpportunityAttendeeService,
  mockRouter
} from '../../shared/services.mock';

import { FeatureFlagService } from '@apollo/app/feature-flag';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { IVendorProfile } from '@apollo/app/vendor';
import { MatDialog } from '@angular/material/dialog';
import { MediaDocumentUploaderService } from '@apollo/app/services/media-document-uploader';
import { NotificationService } from '@apollo/app/ui/notification';
import { OpportunityDetailsComponent } from './opportunity-details.component';
import { RouterTestingModule } from '@angular/router/testing';
import { initialState } from '../state/opportunity-attendee.state';
import { of } from 'rxjs';
import { take } from 'rxjs/operators';

const mockOpportunity = {
  opportunityId: 'test',
  opportunityName: 'publish demo',
  opportunityStatus: 'Published',
  opportunityType: 'PUBLIC',
  dataVendorId: 'XYZ-yrde08gxk3de-097273363452',
  opportunityProfile: {
    overview: `<h1>Asset Description</h1><ul>
    <li>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quod, earum!</li>
    <li>Delectus voluptatem dolor fugit reiciendis quod qui, similique itaque sit.</li>
    <li>Doloribus, officiis velit. Autem, dicta omnis a id adipisci nam?</li>
    <li>Ipsa consequuntur laboriosam deleniti deserunt sapiente animi enim optio doloremque?</li>
    <li>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quod, earum!</li>
    <li>Delectus voluptatem dolor fugit reiciendis quod qui, similique itaque sit.</li>
    <li>Doloribus, officiis velit. Autem, dicta omnis a id adipisci nam?</li>
    <li>Ipsa consequuntur laboriosam deleniti deserunt sapiente animi enim optio doloremque?</li>
</ul>`,
    asset: ['Oil & Gas', 'Wind'],
    offer: ['Farm-in', 'License Round'],
    contract: ['Production Sharing Contract', 'Royalty Based'],
    offerStartDate: '2022-11-07T05:40:41.410Z',
    offerEndDate: '2022-11-07T05:40:41.410Z',
    media: [
      {
        fileId: 'f-xtr45-75675',
        fileName: 'image1.png',
        fileType: 'image2',
        caption: 'captioneaa',
        profileImage: true
      }
    ],
    documents: [
      {
        fileId: 'f-xtr45-75677',
        fileName: 'report.pdf',
        fileType: 'pdf',
        caption: 'captionssdsd'
      }
    ]
  },
  confidentialOpportunityProfile: {
    documents: [
      {
        fileId: 'f-xtr45-75676',
        fileName: 'report.pdf',
        fileType: 'pdf',
        caption: 'captionssdsd'
      }
    ]
  },
  countries: ['India'],
  phase: ['test'],
  assetType: ['CCUS'],
  deliveryType: ['example'],
  offerType: ['Exploration'],
  contractType: ['sample'],
  requests: [
    {
      accessLevels: ['CONFIDENTIAL_INFORMATION'],
      opportunityId: 'test',
      opportunityName: 'publish demo',
      requestStatus: 'Pending',
      requestedOn: '2022-07-29T05:27:41.402Z',
      subscriptionRequestId: 'OSR-VD2020-fdh5r654gfhgfh-74857349858943',
      vendorId: 'XYZ-yrde08gxk3de-097273363452'
    }
  ],
  subscriptions: [
    {
      accessDetails: [
        {
          accessLevel: 'VDR',
          accessStatus: 'APPROVED',
          endDate: '2022-08-16T18:30Z',
          startDate: '2022-08-02T18:30Z'
        }
      ],
      opportunityId: 'test',
      opportunityName: 'publish demo',
      approvedBy: 'any@any.com',
      approvedOn: '2022-07-29T05:27:41.402Z',
      subscriptionId: 'OPS-VD7-u71f34ai9gwf-476379969076',
      subscriptionRequestId: '',
      subscriptionRequestIds: ['OSR-VD2020-fdh5r654gfhgfh-74857349858943'],
      vendorId: 'XYZ-yrde08gxk3de-097273363452'
    }
  ]
};

describe('OpportunityDetailsComponent', () => {
  let component: OpportunityDetailsComponent;
  let fixture: ComponentFixture<OpportunityDetailsComponent>;
  let mockStore: MockStore;
  let mockOpportunityService: OpportunityAttendeeService;
  const open = jest.fn();
  Object.defineProperty(navigator, 'clipboard', {
    value: {
      writeText: () => {
        'test';
      }
    }
  });
  Object.defineProperty(window, 'open', open);
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      declarations: [OpportunityDetailsComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
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
              selector: opportunityAttendeeSelector.selectOpportunityById({ opportunityId: 'test' }),
              value: {
                opportunityId: 'test',
                opportunityName: 'Oppo-name-1',
                opportunityStatus: 'Published',
                opportunityType: 'PUBLIC',
                countries: ['India'],
                dataVendorId: 'XYZ-yrde08gxk3de-097273363452',
                opportunityProfile: {
                  asset: [],
                  assetType: [],
                  offer: [],
                  contract: [],
                  offerStartDate: '',
                  offerEndDate: '',
                  overview: '',
                  media: [],
                  documents: [
                    {
                      fileId: 'f-xtr45-75677',
                      fileName: 'report.pdf',
                      fileType: 'pdf',
                      caption: 'captionssdsd'
                    }
                  ]
                },
                confidentialOpportunityProfile: {
                  overview: '',
                  media: [],
                  documents: [
                    {
                      fileId: 'f-xtr45-75676',
                      fileName: 'report.pdf',
                      fileType: 'pdf',
                      caption: 'captionssdsd'
                    }
                  ]
                },
                vendorId: 'vendor-id',
                vendorProfile: null
              }
            },
            {
              selector: opportunityAttendeeSelector.selectOpportunityCIRequest({ opportunityId: 'test' }),
              value: {
                opportunityId: 'test',
                opportunityName: 'Oppo-name-1',
                opportunityStatus: 'Published',
                opportunityType: 'PUBLIC',
                countries: ['India'],
                requests: [
                  {
                    accessLevels: ['CONFIDENTIAL_INFORMATION'],
                    opportunityId: 'test',
                    opportunityName: 'oppo-name-1',
                    requestStatus: 'Pending',
                    requestedOn: '2022-05-06T05:15:42.384Z',
                    subscriptionRequestId: 'subs-id-1',
                    vendorId: 'vendor-id-1'
                  }
                ],
                subscriptions: [],
                dataVendorId: 'XYZ-yrde08gxk3de-097273363452',
                opportunityProfile: {
                  asset: [],
                  assetType: [],
                  offer: [],
                  contract: [],
                  offerStartDate: '',
                  offerEndDate: '',
                  overview: '',
                  media: [],
                  documents: [
                    {
                      fileId: 'f-xtr45-75677',
                      fileName: 'report.pdf',
                      fileType: 'pdf',
                      caption: 'captionssdsd'
                    }
                  ]
                },
                confidentialOpportunityProfile: {
                  overview: '',
                  media: [],
                  documents: [
                    {
                      fileId: 'f-xtr45-75676',
                      fileName: 'report.pdf',
                      fileType: 'pdf',
                      caption: 'captionssdsd'
                    }
                  ]
                },
                vendorId: 'vendor-id',
                vendorProfile: null
              }
            },
            {
              selector: opportunityAttendeeSelector.selectOpportunityCISubscription({ opportunityId: 'test' }),
              value: {
                opportunityId: 'test',
                opportunityName: 'Oppo-name-1',
                opportunityStatus: 'Published',
                opportunityType: 'PUBLIC',
                countries: ['India'],
                requests: [],
                subscriptions: [
                  {
                    accessDetails: [
                      {
                        startDate: '2022-05-03T18:30Z',
                        endDate: '2022-05-05T18:30Z',
                        accessLevel: 'CONFIDENTIAL_INFORMATION',
                        accessStatus: 'Approved'
                      }
                    ],
                    approvedBy: 'approver-2',
                    approvedOn: '5/2/22, 11:12 AM',
                    opportunityId: 'test',
                    opportunityName: 'oppo-name-2',
                    subscriptionId: 'subs-id-2',
                    subscriptionRequestId: null,
                    vendorId: 'vendor-id-2'
                  }
                ],
                dataVendorId: 'XYZ-yrde08gxk3de-097273363452',
                opportunityProfile: {
                  asset: [],
                  assetType: [],
                  offer: [],
                  contract: [],
                  offerStartDate: '',
                  offerEndDate: '',
                  overview: '',
                  media: [],
                  documents: [
                    {
                      fileId: 'f-xtr45-75677',
                      fileName: 'report.pdf',
                      fileType: 'pdf',
                      caption: 'captionssdsd'
                    }
                  ]
                },
                confidentialOpportunityProfile: {
                  overview: '',
                  media: [],
                  documents: [
                    {
                      fileId: 'f-xtr45-75676',
                      fileName: 'report.pdf',
                      fileType: 'pdf',
                      caption: 'captionssdsd'
                    }
                  ]
                },
                vendorId: 'vendor-id',
                vendorProfile: null
              }
            }
          ]
        }),
        {
          provide: MatDialog,
          useValue: {
            open: () => {
              return {
                componentInstance: {
                  requestAccessClickEvent: of({})
                }
              };
            }
          }
        },
        {
          provide: MediaDocumentUploaderService,
          useValue: mockMediaDocumentUploaderService
        },
        {
          provide: MediaDownloadService,
          useValue: mockLogoMediaDownloadService
        },
        {
          provide: MEDIA_FILE_DOWNLOAD_API_URL,
          useValue: 'http://file-url'
        },
        {
          provide: OpportunityAttendeeService,
          useValue: mockOpportunityAttendeeService
        },
        {
          provide: NotificationService,
          useValue: mockNotificationService
        },
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ id: 'test' })) }
        },
        {
          provide: Router,
          useValue: mockRouter
        },
        {
          provide: ATTENDEE_FILE_DOWNLOAD_SERVICE,
          useValue: 'http://test'
        },
        {
          provide: FeatureFlagService,
          useValue: mockFeatureFlagService
        }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(OpportunityDetailsComponent);
    component = fixture.componentInstance;
    mockStore = TestBed.inject(MockStore);
    mockOpportunityService = TestBed.inject(OpportunityAttendeeService);
    mockStore.refreshState();
    fixture.detectChanges();
  });

  it('should return the logo media signed url on success ', (done) => {
    const vendorProfile: IVendorProfile = {
      name: 'Test',
      logo: {
        name: 'test-logo',
        relativePath: '',
        signedUrl: '',
        description: ''
      },
      companyLogo: {
        url: 'http://file-url/${fileId}/download'
      },
      companyUrl: {
        url: '',
        title: ''
      },
      dataPackageProfileId: ''
    };
    const downloadURL = 'http://file-url/${fileId}/download';
    component.downloadLogoSrc(vendorProfile);
    mockLogoMediaDownloadService.downloadLogoImageSrc(downloadURL).subscribe((signedURL) => {
      expect(signedURL);
      done();
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('opportunityId', () => {
    it('should set opportunityId and dispatch action', () => {
      const opportunityId = 'testId';
      const storeSpy = jest.spyOn(mockStore, 'dispatch').mockImplementation();
      const dispatchAction = opportunityAttendeeActions.getOpportunityById({ opportunityId });
      component.opportunityId = opportunityId;
      expect((component as any)._opportunityId).toEqual(opportunityId);
      expect(storeSpy).toBeCalledWith(dispatchAction);
    });

    it('should return opportunityId value', () => {
      const opportunityId = 'someTestId';
      (component as any)._opportunityId = opportunityId;
      expect(component.opportunityId).toEqual(opportunityId);
    });
  });

  describe('ngOnInit', () => {
    it('should select opportunity from store', (done) => {
      jest.spyOn(mockStore, 'dispatch').mockImplementation();
      component.opportunityId = mockOpportunity.opportunityId;
      component.ngOnInit();
      component.opportunity$.subscribe((opportunity) => {
        expect(opportunity).toEqual(mockOpportunity);
        done();
      });
    });
    it('should provide confidential documents', (done) => {
      component.opportunityId = mockOpportunity.opportunityId;
      component.ngOnInit();
      component.renderableConfidentialDocuments$.pipe(take(1)).subscribe((renderableDocuments) => {
        expect(renderableDocuments.length).toBe(1);
        expect(renderableDocuments[0].fileId).toBe('f-xtr45-75676');
        done();
      });
    });
    it('should provide open documents', (done) => {
      component.opportunityId = mockOpportunity.opportunityId;
      component.ngOnInit();
      component.renderableOpenDocuments$.pipe(take(1)).subscribe((renderableDocuments) => {
        expect(renderableDocuments.length).toBe(1);
        expect(renderableDocuments[0].fileId).toBe('f-xtr45-75677');
        done();
      });
    });
  });

  describe('should call openDocument', () => {
    it('with confidential document file -id', () => {
      const event = {
        fileId: 'f-xtr45-75676',
        fileName: 'report.pdf',
        fileType: 'pdf',
        caption: 'captionssdsd',
        imgUrl: ''
      };
      const spy = jest.spyOn(mockMediaDocumentUploaderService, 'downloadMedia').mockReturnValue(of('https://signedUrl'));
      component.openDocument(event);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('onOpportunityDetailsBack', () => {
    it('should emit opportunityDetailsBack', () => {
      const opportunityDetailsBackSpy = jest.spyOn(component.opportunityDetailsBack, 'emit');
      component.isRouteFlow = false;
      component.onOpportunityDetailsBack();
      expect(opportunityDetailsBackSpy).toBeCalled();
    });

    it('should navigate to map', () => {
      component.isRouteFlow = true;
      component.onOpportunityDetailsBack();
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/map');
    });
  });

  describe('getOpportunityAttributes', () => {
    it('should return opportunity attributes', () => {
      const result = component.getOpportunityAttributes(mockOpportunity);
      expect(result.length).toEqual(6);
    });
  });

  describe('checkRequest', () => {
    const accessRequestTypesData: any = {};
    const accessSubscriptionsTypeData: any = {};
    it('should return opportunity check request', () => {
      component.isRequestBtnDisabled = false;
      component.isVDRDisabled = false;
      component.isCIDisabled = false;
      component.checkRequest(mockOpportunity.requests, mockOpportunity.opportunityId, mockOpportunity.subscriptions);
    });

    it('should return getRaisedRequestAccesses', () => {
      component.getRaisedRequestAccesses(mockOpportunity.requests);
    });
    it('should return getRaisedSubscriptionAccesses', () => {
      component.getRaisedSubscriptionAccesses(mockOpportunity.subscriptions);
    });
    it('should return accessRequestTypesData', () => {
      component.isVDRDisabled = false;
      component.isCIDisabled = true;
      component.isRequestBtnDisabled = component.isVDRDisabled && component.isCIDisabled;
      component.setRequestBtn();
      expect(component.isRequestBtnDisabled).toBeFalsy;
    });
    it('should return accessSubscriptionsTypeData', () => {
      component.setRequestModalFlags(accessRequestTypesData, accessSubscriptionsTypeData);
    });
  });

  describe('requestAccess', () => {
    it('should open request access modal', () => {
      component.opportunitiesDetails = mockOpportunity as any;
      component.requestAccess();
      expect(component.dialog).toBeTruthy();
      expect(mockOpportunityService.createRequestAccess).toHaveBeenCalled();
    });
  });

  describe('copy url', () => {
    it('should call clipboard.writeText', fakeAsync(() => {
      jest.spyOn(navigator.clipboard, 'writeText');
      component.detailsPage();
      expect(navigator.clipboard.writeText).toBeCalledTimes(1);
      tick(2000);
      expect(component.showTooltip).toBeFalsy();
    }));
  });

  describe('should call notification with given error message', () => {
    it('should call notification with error message when openDocument gives no signedUrl', () => {
      const item = {
        caption: 'test',
        fileId: null,
        fileName: 'text-name',
        fileType: 'txt',
        imgUrl: 'https:www.link'
      };
      const result = component.openDocument(item);
      mockMediaDocumentUploaderService.downloadMedia(item.fileId).subscribe((signedUrl) => {
        expect(mockNotificationService.send).toHaveBeenCalled();
      });
    });

    it('should call notification with error message when downloadDocument gives no signedUrl', () => {
      const item = {
        caption: 'test',
        fileId: null,
        fileName: 'text-name',
        fileType: 'txt',
        imgUrl: 'https:www.link'
      };
      const result = component.downloadDocument(item);
      mockMediaDocumentUploaderService.downloadMedia(item.fileId).subscribe((signedUrl) => {
        expect(mockNotificationService.send).toHaveBeenCalled();
      });
    });
  });
});
