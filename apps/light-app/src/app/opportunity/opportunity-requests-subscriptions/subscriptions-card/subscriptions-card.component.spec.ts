import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatMenuModule } from '@angular/material/menu';
import { ConsumerSubscriptionService } from '@apollo/app/services/consumer-subscription';
import { MediaDownloadService } from '@apollo/app/services/media-download';
import { IOpportunitySubscription, OpportunityStatus } from '@apollo/app/services/opportunity-attendee';
import { IVendorProfile } from '@apollo/app/vendor';
import { mockConsumerSubscriptionService, mockLogoMediaDownloadService } from '../../../shared/services.mock';

import { SubscriptionsComponent } from './subscriptions-card.component';

describe('SubscriptionsComponent', () => {
  let component: SubscriptionsComponent;
  let fixture: ComponentFixture<SubscriptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SubscriptionsComponent],
      imports: [MatMenuModule, HttpClientTestingModule],
      providers: [
        {
          provide: ConsumerSubscriptionService,
          useValue: mockConsumerSubscriptionService
        },
        {
          provide: MediaDownloadService,
          useValue: mockLogoMediaDownloadService
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubscriptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
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

  describe('ngOnChanges', () => {
    it('should set input and call ngOnChanges, expired Oppor', () => {
      const data: IOpportunitySubscription = {
        vendorId: 'sdgdf',
        subscriptionId: 'dsgdfgdr',
        subscriptionRequestId: 'sub-34234',
        opportunityId: 'op-465fdgf-fdgfd',
        opportunityName: 'OppName',
        opportunityStatus: OpportunityStatus.Expired,
        requestedOn: '08-05-2022 05:22 AM',
        status: 'Approved',
        approvedBy: 'Mogli',
        approvedOn: '10-05-2022 05:22 AM',
        accessDetails: [
          {
            accessLevel: 'VDR',
            startDate: '23-05-2022 05:22 AM',
            endDate: '30-05-2022 05:22 AM',
            status: 'Approved'
          }
        ]
      };
      component.opportunitySubscriptionDetails = data;
      const simpleChange: any = {
        opportunitySubscriptionDetails: {
          currentValue: data
        }
      };
      component.ngOnChanges(simpleChange);
      expect(component.opportunitySubscriptionDetails.accessDetails[0].accessLevel).toBe(component.accessLevelsNameEnum.CI);
    });

    it('should set input and call ngOnChanges, unpublished Oppor', () => {
      const data: IOpportunitySubscription = {
        vendorId: 'sdgdf',
        subscriptionId: 'dsgdfgdr',
        subscriptionRequestId: 'sub-34234',
        opportunityId: 'op-465fdgf-fdgfd',
        opportunityName: 'OppName',
        opportunityStatus: OpportunityStatus.Unpublished,
        requestedOn: '08-05-2022 05:22 AM',
        status: 'Approved',
        approvedBy: 'Mogli',
        approvedOn: '10-05-2022 05:22 AM',
        accessDetails: [
          {
            accessLevel: 'Details',
            startDate: '23-05-2022 05:22 AM',
            endDate: '30-05-2022 05:22 AM',
            status: 'Approved'
          }
        ]
      };
      component.opportunitySubscriptionDetails = data;
      const simpleChange: any = {
        opportunitySubscriptionDetails: {
          currentValue: data
        }
      };
      component.ngOnChanges(simpleChange);
      expect(component.opportunitySubscriptionDetails.accessDetails[0].accessLevel).toBe(component.accessLevelsNameEnum.CI);
    });

    it('should set input and call ngOnChanges, no VDR no CI access details', () => {
      const data: IOpportunitySubscription = {
        vendorId: 'sdgdf',
        subscriptionId: 'dsgdfgdr',
        subscriptionRequestId: 'sub-34234',
        opportunityId: 'op-465fdgf-fdgfd',
        opportunityName: 'OppName',
        requestedOn: '08-05-2022 05:22 AM',
        status: 'Approved',
        approvedBy: 'Mogli',
        approvedOn: '10-05-2022 05:22 AM',
        accessDetails: [
          {
            accessLevel: 'Other',
            startDate: '23-05-2022 05:22 AM',
            endDate: '30-05-2022 05:22 AM',
            status: 'Approved'
          }
        ]
      };
      component.opportunitySubscriptionDetails = data;
      const simpleChange: any = {
        opportunitySubscriptionDetails: {
          currentValue: data
        }
      };
      component.ngOnChanges(simpleChange);
      expect(component.opportunitySubscriptionDetails.accessDetails[0].accessLevel).toBe(component.accessLevelsNameEnum.CI);
    });
  });
});
