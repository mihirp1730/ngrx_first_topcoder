import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WindowRef } from '@apollo/app/ref';
import { AccessDeniedComponent, DELFI_PORTAL_APP } from './access-denied.component';

const mockWindowRef = {
  nativeWindow: {
    open: jest.fn()
  }
};

describe('AccessDeniedComponent', () => {
  let component: AccessDeniedComponent;
  let fixture: ComponentFixture<AccessDeniedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AccessDeniedComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
      providers: [
        {
          provide: WindowRef,
          useValue: mockWindowRef
        },
        {
          provide: DELFI_PORTAL_APP,
          useValue: 'http://delfi-portal'
        }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccessDeniedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open delfi portal in new tab', () => {
    component.redirectToDelfiPortal();
    expect(mockWindowRef.nativeWindow.open).toHaveBeenCalledWith('http://delfi-portal', '_blank');
  });
});
