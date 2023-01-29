import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AuthCodeFlowService } from '@apollo/app/auth-codeflow';
import { provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';

import { mockAuthCodeFlowService } from '../../shared/services.mock';
import { PackageRequestComponent } from './package-request.component';

describe('PackageRequestComponent', () => {
  let component: PackageRequestComponent;
  let fixture: ComponentFixture<PackageRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthCodeFlowService,
          useValue: mockAuthCodeFlowService
        },
        provideMockStore()
      ],
      declarations: [PackageRequestComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PackageRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect to sign in', () => {
    component.selectedProfileId$ = of('package-test');
    component.redirectToSignIn();
    expect(mockAuthCodeFlowService.signIn).toHaveBeenCalledWith(`packages/package-test`);
  });
});
