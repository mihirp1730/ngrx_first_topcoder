import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { DataPackagesService } from '@apollo/app/services/data-packages';
import { DataSubscriptionService } from '@apollo/app/services/data-subscription';
import { NotificationService } from '@apollo/app/ui/notification';
import { DELFI_USER_CONTEXT } from '@apollo/app/delfi-gui-auth-config';

import { CreateSubscriptionComponent } from './create-subscription.component';
import { mockDataPackagesService, mockDataSubscriptionService, mockRouter, mockNotificationService, mockGoogleAnalyticsService } from '../../shared/services.mock';
import { GoogleAnalyticsService } from 'ngx-google-analytics';

describe('CreateSubscriptionComponent', () => {
  let component: CreateSubscriptionComponent;
  let fixture: ComponentFixture<CreateSubscriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
      ],
      providers: [
        {
          provide: Router,
          useValue: mockRouter
        },
        {
          provide: DataPackagesService,
          useValue: mockDataPackagesService
        },
        {
          provide: DataSubscriptionService,
          useValue: mockDataSubscriptionService
        },
        {
          provide: MatDialog,
          useValue: {
            open: () => {
              return {
                componentInstance: {
                  yesClickEvent: of({})
                }
              }
            }
          }
        },
        {
          provide: NotificationService,
          useValue: mockNotificationService
        },
        {
          provide: DELFI_USER_CONTEXT,
          useValue: {
            crmAccountId: 'test-account-id'
          }
        },
        {
          provide: GoogleAnalyticsService,
          useValue: mockGoogleAnalyticsService
        }
      ],
      declarations: [ CreateSubscriptionComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateSubscriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getPackage', () => {
    const packageId = 'test';
    component.getPackage(packageId);
    expect(mockDataPackagesService.getPublishedDataPackageById).toHaveBeenCalled();
  });

  it('onSelectedStartDate should setEndDate if startDate is different from selectedDate', () => {
    const today = new Date();
    component.startDate = new Date();
    component.selectedDate = new Date(2100, 0, 14);
    component.formGroup.value.durationTerm = 6;
    const spy = jest.spyOn(component, 'setEndDate').mockImplementation();
    component.onSelectedStartDate(today);
    expect(spy).toHaveBeenCalled();
  });

  it('onSelectedStartDate should set setEndDate if durationTerm from package and form are equal', () => {
    const today = new Date();
    const spy = jest.spyOn(component, 'setEndDate').mockImplementation();
    component.onSelectedStartDate(today);
    expect(spy).toHaveBeenCalled();
  });

  it('setEndDate should formatStartDate', () => {
    const startDate = new Date(1969, 11, 31);
    const durationTerm = 12;
    const spy = jest.spyOn(component, 'formatStartDate').mockReturnValue(null);
    component.setEndDate(startDate, durationTerm);
    expect(spy).toHaveBeenCalled();
  });

  it('detectChanges', () => {
    component.formGroup.value.durationTerm = 12;
    const spy = jest.spyOn(component, 'setEndDate').mockImplementation();
    component.detectChanges();
    expect(spy).toHaveBeenCalled();
  });

  it('isFileUploaded should be set to false when a file is deleted', () => {
    component.deleteFile();
    expect(component.isFileUploaded).toBe(false);
  });

  it('isFileUploaded should be set to true when a file is uploaded', () => {
    const event = {
      name: 'test.pdf'
    } as File;
    component.uploadFile(event);
    expect(component.isFileUploaded).toBe(true);
  });

  it('should catch error if no deliverable files and 412 error', () => {
    component.startDate = new Date();
    component.endDate = new Date();
    const error = {
      status: 412
    };
    mockDataSubscriptionService.createSubscription.mockReturnValue(throwError(error));
    const spy = jest.spyOn(component.dialog, 'open').mockImplementation();
    component.onCreateSubscription();
    expect(spy).toHaveBeenCalled();
  });

  it('should not open modal if error different from 412', () => {
    component.startDate = new Date();
    component.endDate = new Date();
    const error = {
      status: 400
    };
    mockDataSubscriptionService.createSubscription.mockReturnValue(throwError(error));
    const spy = jest.spyOn(component.dialog, 'open').mockImplementation();
    component.onCreateSubscription();
    expect(spy).not.toHaveBeenCalled();
  });

  it('should createSubscription and navigateByUrl', () => {
    component.startDate = new Date();
    component.endDate = new Date();
    mockDataSubscriptionService.createSubscription.mockReturnValue(of({}));
    component.onCreateSubscription();
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/vendor/package/requests');
  });

  it('should navigateByUrl if subscribe completed', () => {
    component.startDate = new Date();
    component.endDate = new Date();
    const error = {
      status: 412
    };
    mockDataSubscriptionService.createSubscription.mockReturnValue(throwError(error));
    component.onCreateSubscription();
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/vendor/package/requests');
  });

  it('should onCancel', () => {
    component.onCancel();
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/vendor/package/requests');
  });

  it('should send a notification on request', () => {
    component.showToastSubscriptionCreated('Error', 'test message');
    expect(mockNotificationService.send).toHaveBeenCalled();
  });

  it('invalidPrice should be true when price is zero', () => {
    component.formGroup.value.price = 0;
    component.validatePrice();
    expect(component.invalidPrice).toBe(true);
  });
});
