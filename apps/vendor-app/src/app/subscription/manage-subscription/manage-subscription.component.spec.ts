import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataSubscriptionService } from '@apollo/app/services/data-subscription';
import { RouterTestingModule } from '@angular/router/testing';

import { mockGoogleAnalyticsService, mockManageSubscriptionService, mockNotificationService } from '../../shared/services.mock';
import { ManageSubscriptionComponent } from './manage-subscription.component';
import { NotificationService } from '@apollo/app/ui/notification';
import { GoogleAnalyticsService } from 'ngx-google-analytics';

describe('ManageSubscriptionComponent', () => {
  let component: ManageSubscriptionComponent;
  let fixture: ComponentFixture<ManageSubscriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [ManageSubscriptionComponent],
      providers: [
        {
          provide: DataSubscriptionService,
          useValue: mockManageSubscriptionService
        },
        {
          provide: NotificationService,
          useValue: mockNotificationService
        },
        {
          provide: GoogleAnalyticsService,
          useValue: mockGoogleAnalyticsService
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageSubscriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Set cellSyle:color depends on the status', () => {
    it('Should set #47B280 if ACTIVE requestStatus', () => {
      const params = {
          value: 'Active'
      } as any;
      const value = component.columnDefinition.find((c) => c.field === 'dataSubscriptionStatus').cellStyle(params);
      expect(value).toEqual({
        color: '#47B280'
      });
    });

    it('Should set #FFC107 if EXPIRING SOON requestStatus', () => {
      const params = {
          value: 'Expiring soon'
      } as any;

      const value = component.columnDefinition.find((c) => c.headerName === 'Status').cellStyle(params);
      expect(value).toEqual({
        color: '#FFC107'
      });
    });

    it('Should set #FFC107 if EXPIRING SOON requestStatus', () => {
      const params = {
          value: 'Expired'
      } as any;
      const value = component.columnDefinition.find((c) => c.headerName === 'Status').cellStyle(params);
      expect(value).toEqual({
        color: '#FF5A5A'
      });
    });

    it('Should set #FFC107 if EXPIRING SOON requestStatus', () => {
      const params = {
          value: 'Approved'
      } as any;
      const value = component.columnDefinition.find((c) => c.headerName === 'Status').cellStyle(params);
      expect(value).toEqual({
        color: '#00A4A6'
      });
    });

    it('Should set White if Anything else showed as requestStatus', () => {
      const params = {
          value: 'Any other value'
      } as any;
      const value = component.columnDefinition.find((c) => c.headerName === 'Status').cellStyle(params);
      expect(value).toEqual({
        color: '#FFFFFF'
      });
    });

    it('Should call linkCellRenderer', () => {
      const value = component.columnDefinition.find((c) => c.field === 'dataPackageName').cellRendererSelector();
      expect(value).toEqual({
        component: 'linkCellRenderer'
      });
    });
  });
});
