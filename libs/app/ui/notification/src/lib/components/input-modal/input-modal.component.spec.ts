import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { InputModalComponent } from './input-modal.component';

const mockMatDialogRefModal = {
  close: jest.fn()
};

const mockMatDialogData = {
  data: {
    options: {
      modalType: 'chat'
    }
  }
};

describe('InputModalComponent', () => {
  let component: InputModalComponent;
  let fixture: ComponentFixture<InputModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        {
          provide: MatDialogRef,
          useValue: mockMatDialogRefModal
        },
        {
          provide: MAT_DIALOG_DATA, 
          useValue: mockMatDialogData
        }
      ],
      imports: [
        NoopAnimationsModule,
        MatFormFieldModule,
        MatInputModule,
        FormsModule
      ],
      declarations: [ InputModalComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InputModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return value on confirm', () => {
    const modalInputs = [
      {
        name: 'Test name',
        type: 'text',
        value: 'Some value'
      }
    ];
    const inputsDictionary = Object.assign({}, ...modalInputs.map(mInput => ({[mInput.name]: mInput.value})));
    component.options = {
      ...component.options,
      modalInputs
    } as any;
    component.onConfirm();
    expect(mockMatDialogRefModal.close).toBeCalledWith(inputsDictionary);
  });

  it('should close modal when with no value', () => {
    component.closeModal();
    expect(mockMatDialogRefModal.close).toBeCalled();
  });
});
