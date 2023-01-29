import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';

import { HomeComponent } from './home.component';
import { mockGoogleAnalyticsService, mockRouter } from '../shared/services.mock';
import { GoogleAnalyticsService } from 'ngx-google-analytics';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HomeComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
      providers: [
        {
          provide: Router,
          useValue: mockRouter
        },
        {
          provide: GoogleAnalyticsService,
          useValue: mockGoogleAnalyticsService
        }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to package create', () => {
    component.createNewPackage();
    expect(component.isNewPackageLoaded).toBe(true);
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('vendor/package/create');
  });

  it('should disable buttons', () => {
    component.disableButtons(true);
    expect(component.isDisabled).toBe(true);
  });
});
