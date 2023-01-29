import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CookieService } from 'ngx-cookie-service';

import { NavigationEnd, Router, RouterEvent } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthCodeFlowService } from '@apollo/app/auth-codeflow';
import { FeatureFlagService } from '@apollo/app/feature-flag';
import { SecureEnvironmentService } from '@apollo/app/secure-environment';
import { CommunicationService } from '@apollo/app/services/communication';
import { GoogleAnalyticsService } from 'ngx-google-analytics';
import { ReplaySubject } from 'rxjs';
import { ENV } from '../environments/environment.provider';
import { AppComponent, HOST_APP_URL } from './app.component';
import {
  mockAuthCodeFlowService,
  mockCommunicationService,
  mockCookieService,
  mockFeatureFlagService,
  mockGoogleAnalyticsService,
  mockMatDialogModal,
  mockMatDialogRefModal,
  mockSecureEnvironmentService
} from './shared/services.mock';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let authCodeFlowService: AuthCodeFlowService;
  let router;
  const routerEvent$ = new ReplaySubject<RouterEvent>(1);

  beforeEach(async () => {
    const env = { production: false };

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        {
          provide: ENV,
          useValue: env
        },
        {
          provide: FeatureFlagService,
          useValue: mockFeatureFlagService
        },
        {
          provide: SecureEnvironmentService,
          useValue: mockSecureEnvironmentService
        },
        {
          provide: AuthCodeFlowService,
          useValue: mockAuthCodeFlowService
        },
        {
          provide: GoogleAnalyticsService,
          useValue: mockGoogleAnalyticsService
        },
        {
          provide: CommunicationService,
          useValue: mockCommunicationService
        },
        {
          provide: MatDialogRef,
          useValue: mockMatDialogRefModal
        },
        {
          provide: CookieService,
          useValue: mockCookieService
        },
        {
          provide: MatDialog,
          useValue: mockMatDialogModal
        },
        {
          provide: HOST_APP_URL,
          useValue: 'http://vendorAppUr/'
        }
      ],
      declarations: [AppComponent],

      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    router = TestBed.inject(Router);
    (<any>router).events = routerEvent$.asObservable();
    authCodeFlowService = TestBed.inject(AuthCodeFlowService);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should set hasSideNav flag as true', () => {
    routerEvent$.next(new NavigationEnd(1, '/someroute', '/'));
    expect(component.hasSidenav).toBeTruthy();
  });

  it('should set hasSideNav flag as false', () => {
    routerEvent$.next(new NavigationEnd(1, '/', '/'));
    expect(component.hasSidenav).toBeFalsy();
  });

  it('should signout', () => {
    const authCodeFlowServiceSpy = jest.spyOn(authCodeFlowService, 'signOut');
    component.signout();

    expect(authCodeFlowServiceSpy).toHaveBeenCalled();
  });
});
