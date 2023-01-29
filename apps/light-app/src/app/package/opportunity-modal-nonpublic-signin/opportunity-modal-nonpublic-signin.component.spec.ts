import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { AuthCodeFlowService } from '@apollo/app/auth-codeflow';

import { OpportunityModalNonpublicSigninComponent } from './opportunity-modal-nonpublic-signin.component';
import { mockAuthCodeFlowService, mockMatDialogRefModal } from '../../shared/services.mock';

describe('OpportunityModalNonpublicSigninComponent', () => {
  let component: OpportunityModalNonpublicSigninComponent;
  let fixture: ComponentFixture<OpportunityModalNonpublicSigninComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthCodeFlowService,
          useValue: mockAuthCodeFlowService
        },
        {
          provide: MatDialogRef,
          useValue: mockMatDialogRefModal
        }
      ],
      declarations: [OpportunityModalNonpublicSigninComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OpportunityModalNonpublicSigninComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('signin', () => {
    it('should call the authCodeFlowService.signIn method', () => {
      component.signin();
      expect(mockAuthCodeFlowService.signIn).toHaveBeenCalled();
    });
  });
});
