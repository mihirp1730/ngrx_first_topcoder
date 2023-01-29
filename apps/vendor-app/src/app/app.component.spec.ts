import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { AuthCodeFlowService } from '@apollo/app/auth-codeflow';
import { FeatureFlagService } from '@apollo/app/feature-flag';
import { SecureEnvironmentService } from '@apollo/app/secure-environment';

import { AppComponent } from './app.component';
import { mockFeatureFlagService, mockSecureEnvironmentService, mockAuthCodeFlowService, mockCommunicationService, mockVendorAppService } from './shared/services.mock';
import { ENV } from '../environments/environment.provider';
import { CommunicationService } from '@apollo/app/services/communication';
import { VendorAppService } from '@apollo/app/vendor';
import { provideMockStore } from '@ngrx/store/testing';
import { delfiAccessStatus } from './access-denied/state/selectors/user-subscription.selectors';
import { NavigationEnd, Router, RouterEvent } from '@angular/router';
import { ReplaySubject } from 'rxjs';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let mockRouter: Router;
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
          provide: AuthCodeFlowService,
          useValue: mockAuthCodeFlowService
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
          provide: CommunicationService,
          useValue: mockCommunicationService
        },
        {
          provide: AuthCodeFlowService,
          useValue: mockAuthCodeFlowService
        },
        {
          provide: VendorAppService,
          useValue: mockVendorAppService
        },
        provideMockStore({
          selectors: [
            {
              selector: delfiAccessStatus,
              value: {
                delfiAccess: true
              }
            }
          ]
        })
      ],
      declarations: [AppComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
    }).compileComponents();
  });
  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    mockRouter = TestBed.inject(Router);
    (<any>mockRouter).events = routerEvent$.asObservable();
    fixture.detectChanges();
  });
  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
  it('should set hasSideNav flag as true', () => {
    routerEvent$.next(new NavigationEnd(1, '/package', '/'));
    expect(component.hasSidenav).toBeTruthy();
  });
  it('should set hasSidenav to true', () => {
    jest.spyOn(mockRouter, 'url', 'get').mockReturnValue('/opportunity');
    component.ngOnInit();
    expect(component.hasSidenav).toBeTruthy();
  });
  it('should set hasSidenav to true', () => {
    jest.spyOn(mockRouter, 'url', 'get').mockReturnValue('/communication');
    component.ngOnInit();
    expect(component.hasSidenav).toBeTruthy();
  });
  it('should trigger the isOpportunityCatalogRouteActive method', () => {
    const spy = jest.spyOn(component, 'isOpportunityCatalogRouteActive');
    component.ngOnInit();
    expect(spy).toHaveBeenCalled();
  })
});
