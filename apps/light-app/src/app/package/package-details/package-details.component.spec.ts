import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { GoogleAnalyticsService } from 'ngx-google-analytics';
import { of } from 'rxjs';

import {
  mockActivatedRoute,
  mockGoogleAnalyticsService,
  mockPackageService,
  mockRouter,
  mockVendorAppService
} from '../../shared/services.mock';
import { mockMatDialogModal } from '../../shared/services.mock';
import { PackageDetailsComponent } from './package-details.component';

describe('PackageDetailsComponent', () => {
  let component: PackageDetailsComponent;
  let fixture: ComponentFixture<PackageDetailsComponent>;
  let mockStore: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PackageDetailsComponent],
      imports: [],
      providers: [
        provideMockStore(),
        {
          provide: MatDialog,
          useValue: mockMatDialogModal
        },
        {
          provide: GoogleAnalyticsService,
          useValue: mockGoogleAnalyticsService
        },
        {
          provide: ActivatedRoute,
          useValue: mockActivatedRoute
        },
        {
          provide: Router,
          useValue: mockRouter
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PackageDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    mockStore = TestBed.inject(Store) as MockStore;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize modal when clicking cancel request button', () => {
    component.OpenModal();
    expect(component.dialog).toBeTruthy();
  });

  it('should emit the package-details-view closing flag', () => {
    const spy = jest.spyOn(mockStore, 'dispatch').mockImplementation();
    component.closeThisPane();
    expect(spy).toHaveBeenCalled();
  });

  it('should get back to last location at closeThisPane()', () => {
    const spy = jest.spyOn(mockRouter, 'navigate').mockImplementation();
    component.closeThisPane();
    expect(spy).toHaveBeenCalled();
  });
});
