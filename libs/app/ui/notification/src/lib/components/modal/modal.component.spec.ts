import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { ModalComponent } from './modal.component';

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

describe('ModalComponent', () => {
  let component: ModalComponent;
  let fixture: ComponentFixture<ModalComponent>;

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
      imports: [NoopAnimationsModule],
      declarations: [ ModalComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit yes click event', () => {
    const yesClickEvent = jest.spyOn(component.yesClickEvent, 'emit');
    component.confirmBtnHandler();
    expect(yesClickEvent).toHaveBeenCalled();
  });

  it('should close modal when clicking cancel button', () => {
    component.closeModal();
    expect(component.dialogRef).toBeTruthy();
  });
});
