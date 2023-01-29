import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthCodeFlowService } from '@apollo/app/auth-codeflow';
import { ToolbarComponent } from './toolbar.component';
import { WindowRef } from '@apollo/app/ref';
import { mockAuthCodeFlowService, mockVendorAppService } from '../shared/services.mock';
import { VendorAppService } from '@apollo/app/vendor';

const mockWindowRef = {
  nativeWindow: {
    location: {
      reload: jest.fn(),
      replace: jest.fn()
    }
  }
};
describe('ToolbarComponent', () => {
  let component: ToolbarComponent;
  let fixture: ComponentFixture<ToolbarComponent>;
  let authCodeFlowService: AuthCodeFlowService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ToolbarComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
      providers: [
        {
          provide: WindowRef,
          useValue: mockWindowRef
        },
        {
          provide: AuthCodeFlowService,
          useValue: mockAuthCodeFlowService
        },
        {
          provide: VendorAppService,
          useValue: mockVendorAppService
        }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    authCodeFlowService = TestBed.inject(AuthCodeFlowService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should reload on context change', () => {
    (component as any).windowRef = mockWindowRef;
    const spy = jest.spyOn(mockWindowRef.nativeWindow.location, 'reload');
    component.onContextChanges();
    expect(spy).toHaveBeenCalled();
  });

  it('should signout', () => {
    const authCodeFlowServiceSpy = jest.spyOn(authCodeFlowService, 'signOut');
    component.signout();

    expect(authCodeFlowServiceSpy).toHaveBeenCalled();
  });
});
