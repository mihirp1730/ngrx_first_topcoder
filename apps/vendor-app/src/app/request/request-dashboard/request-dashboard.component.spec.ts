import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataSubscriptionService } from '@apollo/app/services/data-subscription';

import { mockDataSubscriptionService, mockGoogleAnalyticsService, mockNotificationService } from '../../shared/services.mock';
import { RequestDashboardComponent } from './request-dashboard.component';
import { NotificationService } from '@apollo/app/ui/notification';
import { GoogleAnalyticsService } from 'ngx-google-analytics';

describe('RequestDashboardComponent', () => {
  let component: RequestDashboardComponent;
  let fixture: ComponentFixture<RequestDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RequestDashboardComponent],
      providers: [
        {
          provide: DataSubscriptionService,
          useValue: mockDataSubscriptionService
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
    fixture = TestBed.createComponent(RequestDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('cellRendererSelector', () => {
    it('Should call pendingCellRenderer if Pending requestStatus', () => {
      const params = {
        data: {
          requestStatus: 'Pending'
        }
      } as any;
      const value = component.columnDefinition.find((c) => c.headerName === 'Actions').cellRendererSelector(params);
      expect(value).toEqual({
        component: 'pendingCellRenderer'
      });
    });

    it('Should call pendingCellRenderer if null requestStatus', () => {
      const params = {
        data: {
          requestStatus: null
        }
      } as any;
      const value = component.columnDefinition.find((c) => c.headerName === 'Actions').cellRendererSelector(params);
      expect(value).toEqual({
        component: 'pendingCellRenderer'
      });
    });

    it('Should call pendingCellRenderer if Approved requestStatus', () => {
      const params = {
        data: {
          requestStatus: 'Approved'
        }
      } as any;
      const value = component.columnDefinition.find((c) => c.headerName === 'Actions').cellRendererSelector(params);
      expect(value).toEqual({
        component: 'approvedCellRenderer'
      });
    });

    it('Should call pendingCellRenderer if Rejected requestStatus', () => {
      const params = {
        data: {
          requestStatus: 'Rejected'
        }
      } as any;
      const value = component.columnDefinition.find((c) => c.headerName === 'Actions').cellRendererSelector(params);
      expect(value).toEqual({
        component: 'rejectedCellRenderer'
      });
    });
  });
});
