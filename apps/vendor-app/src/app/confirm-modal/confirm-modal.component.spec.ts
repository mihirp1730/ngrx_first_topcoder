import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { ConfirmModalComponent } from './confirm-modal.component';
import { mockMatDialogRefModal, mockMatDialogData } from '../shared/services.mock';

describe('ConfirmModalComponent', () => {
  let component: ConfirmModalComponent;
  let fixture: ComponentFixture<ConfirmModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfirmModalComponent ],
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
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit yes button click event', () => {
    const yesClickEvent = jest.spyOn(component.yesClickEvent, 'emit');
    component.yesBtnHandler();
    expect(yesClickEvent).toHaveBeenCalled();
  });
});
