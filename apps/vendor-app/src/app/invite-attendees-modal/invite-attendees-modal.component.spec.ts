import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as moment from 'moment';

import { mockMatDialogData, mockMatDialogRefModal } from '../shared/services.mock';
import { InviteAttendeesModalComponent } from './invite-attendees-modal.component';

describe('InviteAttendeesModalComponent', () => {
  let component: InviteAttendeesModalComponent;
  let fixture: ComponentFixture<InviteAttendeesModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InviteAttendeesModalComponent ],
      imports: [
        FormsModule,
        ReactiveFormsModule,
      ],
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
    fixture = TestBed.createComponent(InviteAttendeesModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.ngOnInit();
    expect(mockMatDialogData.data).toHaveProperty("packageName", "Wells");
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit Send Invite button click event', () => {
    const sendInviteClickEvent = jest.spyOn(component.sendInviteClickEvent, 'emit');
    component.sendInvite();
    expect(sendInviteClickEvent).toHaveBeenCalled();
  });

  it('should close modal when clicking cancel button', () => {
    component.closeModal();
    expect(component.dialogRef).toBeTruthy();
  });

  it('should set confidential Info startdate', () => {
    const startDate = moment(moment()).isSame(moment(), 'day') ? moment(new Date()) : moment(moment()).utc();
    const endDate = moment(startDate).add(1, 'days').utc();
    const evt = { startDate, endDate };
    component.dateSelected(evt as any);
    expect(component.attendeesForm.get(`startDate`).value.utc().format('YYYY-MM-DD')).toStrictEqual(startDate.utc().format('YYYY-MM-DD'));
  });

  describe('onCheckboxChange', () => {
    it('should add new value to form', () => {
      const fieldValue = 'test';
      const evt = { checked: true, source: { value: fieldValue } };
      component.onCheckboxChange(evt);
      expect(component.attendeesForm.controls.accessLevels.value[0]).toEqual(fieldValue);
    });
    it('should remove existing value from form', () => {
      const fieldValue = 'test';
      const evt = { checked: false, source: { fieldValue } };
      component.onCheckboxChange(evt);
      expect(component.attendeesForm.controls.accessLevels.value.length).toBe(0);
    });
  });
});
