import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DELFI_USER_CONTEXT } from '@apollo/app/delfi-gui-auth-config';
import { NotificationService } from '@apollo/app/ui/notification';
import { VendorAppService } from '@apollo/app/vendor';
import { of } from 'rxjs';

import { mockSubscriptionService, mockNotificationService, mockVendorAppService } from '../../shared/services.mock';
import { SubscriptionService } from '../services/subscription.service';
import { SubscriptionTableComponent } from './subscription-table.component';

describe('SubscriptionTableComponent', () => {
  let component: SubscriptionTableComponent;
  let fixture: ComponentFixture<SubscriptionTableComponent>;
  let vendorAppService: VendorAppService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      declarations: [SubscriptionTableComponent],
      providers: [
        {
          provide: SubscriptionService,
          useValue: mockSubscriptionService
        },
        {
          provide: NotificationService,
          useValue: mockNotificationService
        },
        {
          provide: DELFI_USER_CONTEXT,
          useValue: {}
        },
        {
          provide: VendorAppService,
          useValue: mockVendorAppService
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubscriptionTableComponent);
    component = fixture.componentInstance;
    component.subscription = {
      dataSubscriptionId: '123-123',
      billingAccountId: 'test',
      dataPackageId: 'Test',
      vendorId: 'Western Test',
      dataSubscriptionStatus: 'Expired',
      subscriptionRequestId: '2232444test',
      subscriptionPrice: 200,
      subscriptionDuration: 6,
      startDate: new Date().toString(),
      endDate: new Date().toString(),
      requestedBy: 'JaneDoe@test.com',
      status: 'PENDING',
      transactionId: '324jkksjksa-test-saa9982',
      subscriptionFor: 'JoeDoe@test.com',
      dataItems: []
    };
    vendorAppService = TestBed.inject(VendorAppService);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get data package and vendor profile', () => {
    mockSubscriptionService.getPackage.mockReturnValue(
      of({
        dataPackageProfile: {
          profile: {
            media: [
              {
                fileid: 'file-id-1'
              }
            ]
          },
          vendorId: 'vendorId'
        }
      })
    );
    const vendorAppServiceSpy = mockVendorAppService.retrieveDataVendors.mockReturnValue(of());
    component.getDataVendorById('vendorId');
    expect(vendorAppServiceSpy).toHaveBeenCalled();
  });
});
