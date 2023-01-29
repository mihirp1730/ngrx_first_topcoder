import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { CookieService } from 'ngx-cookie-service';

import { mockCookieService, mockMatDialogRefModal } from '../shared/services.mock';
import { CookiesAcceptanceComponent } from './cookies-acceptance-modal.component';

describe('CookiesAcceptanceComponent', () => {
  let component: CookiesAcceptanceComponent;
  let fixture: ComponentFixture<CookiesAcceptanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CookiesAcceptanceComponent],

      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
      providers: [
        {
          provide: MatDialogRef,
          useValue: mockMatDialogRefModal
        },
        {
          provide: CookieService,
          useValue: mockCookieService
        }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CookiesAcceptanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should invoke cookiesAcceptance method, and cookie service should set the cookie', () => {
    component.cookiesAcceptance();
    const spy = jest.spyOn(mockCookieService, 'set');
    expect(spy).toHaveBeenCalled();
  });
});
