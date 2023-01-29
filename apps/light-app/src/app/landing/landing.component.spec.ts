import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthCodeFlowService } from '@apollo/app/auth-codeflow';
import { DocumentRef, WindowRef } from '@apollo/app/ref';
import { GoogleAnalyticsService } from 'ngx-google-analytics';
import { of } from 'rxjs';

import { mockAuthCodeFlowService, mockGoogleAnalyticsService } from '../shared/services.mock';
import { LandingComponent } from './landing.component';

const mockDocumentRef = {
  nativeDocument: {
    querySelector: jest.fn().mockReturnValue({ scrollIntoView: jest.fn() })
  }
};

const mockWindowRef = {
  nativeWindow: {
    location: {
      assign: jest.fn()
    }
  }
};

describe('LandingComponent', () => {
  let component: LandingComponent;
  let fixture: ComponentFixture<LandingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LandingComponent],
      providers: [
        {
          provide: AuthCodeFlowService,
          useValue: mockAuthCodeFlowService
        },
        {
          provide: GoogleAnalyticsService,
          useValue: mockGoogleAnalyticsService
        },
        {
          provide: DocumentRef,
          useValue: mockDocumentRef
        },
        {
          provide: WindowRef,
          useValue: mockWindowRef
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect to login page', () => {
    component.redirectToLogin();
    expect(mockAuthCodeFlowService.signIn).toHaveBeenCalled();
  });

  it('should call the scroll function', () => {
    component.onScrollClick();
    expect(mockDocumentRef.nativeDocument.querySelector).toHaveBeenCalledWith('apollo-icon-card');
  });

  it('should redirect to map', () => {
    component.redirectToGuestMap();
    expect(mockWindowRef.nativeWindow.location.assign).toHaveBeenCalledWith('/map');
  });

  it('should redirect to landing page if guest login disabled', () => {
    mockAuthCodeFlowService.isSignedIn.mockReturnValue(of(false));
    component.redirectToGuestMap();
    expect(mockAuthCodeFlowService.signIn).toHaveBeenCalled();
  });
});
