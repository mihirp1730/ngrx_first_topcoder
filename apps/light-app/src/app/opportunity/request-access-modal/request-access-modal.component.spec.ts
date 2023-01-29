import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthCodeFlowService } from '@apollo/app/auth-codeflow';

import { RequestAccessModalComponent } from './request-access-modal.component';
import { mockAuthCodeFlowService, mockMatDialogRefModal } from '../../shared/services.mock';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

export const mockMatDialogData = {
  data: {
    title: 'test',
    confirmButtonText: 'test',
    displayObject: true
  }
};

describe('RequestAccessModalComponent', () => {
  let component: RequestAccessModalComponent;
  let fixture: ComponentFixture<RequestAccessModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RequestAccessModalComponent],
      imports: [FormsModule, ReactiveFormsModule, MatInputModule, NoopAnimationsModule],
      providers: [
        {
          provide: MatDialogRef,
          useValue: mockMatDialogRefModal
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: mockMatDialogData
        },
        {
          provide: AuthCodeFlowService,
          useValue: mockAuthCodeFlowService
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestAccessModalComponent);
    component = fixture.componentInstance;

    component.requestAccessForm = new FormGroup({
      attendeeEmail: new FormControl(''),
      message: new FormControl(''),
      company: new FormControl(''),
      accessLevels: new FormArray([])
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close modal when clicking cancel button', () => {
    component.closeModal();
    expect(component.dialogRef).toBeTruthy();
  });

  it('should request access', () => {
    const spy = jest.spyOn(component.requestAccessClickEvent, 'emit');
    component.requestAccess();
    expect(spy).toHaveBeenCalled();
  });

  describe('onCheckboxChange', () => {
    it('should add new value to form', () => {
      const fieldValue = 'test';
      const evt = { checked: true, source: { value: fieldValue } };
      component.onCheckboxChange(evt);
      expect(component.requestAccessForm.controls.accessLevels.value[0]).toEqual(fieldValue);
    });
    it('should remove existing value from form', () => {
      const fieldValue = 'test';
      const evt = { checked: false, source: { fieldValue } };
      component.onCheckboxChange(evt);
      expect(component.requestAccessForm.controls.accessLevels.value.length).toBe(0);
    });
  });
});
