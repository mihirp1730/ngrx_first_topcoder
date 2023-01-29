import { Component, EventEmitter, Inject, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SlbDateTimeFormats } from '@slb-dls/angular-material/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { IOpportunitySubscription } from '@apollo/app/services/opportunity';

export const SLB_MOMENT_DATE_FORMATS: SlbDateTimeFormats = {
  parse: {
    dateInput: 'DD-MMM-YYYY',
    dateTimeInput: 'DD-MMM-YYYY HH:mm:ss'
  },
  display: {
    dateInput: 'DD-MMM-YYYY',
    dateTimeInput: 'DD-MMM-YYYY HH:mm:ss',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'DD-MMM-YYYY',
    monthYearA11yLabel: 'MMMM YYYY'
  }
};

@Component({
  selector: 'apollo-invite-attendees-modal',
  templateUrl: './invite-attendees-modal.component.html',
  styleUrls: ['./invite-attendees-modal.component.scss'],
  providers: [{ provide: MAT_DATE_FORMATS, useValue: SLB_MOMENT_DATE_FORMATS }],
  encapsulation: ViewEncapsulation.None,
})

export class InviteAttendeesModalComponent implements OnInit {
  title = '';
  opportunityName: '';
  confirmButtonText = '';
  cancelButtonText = '';
  opportunityId= '';
  displayObject: boolean;
  attendeeEmail: string;
  inviteeMessage: string [];
  selectedStartDate: Date;
  selectedEndDate: Date;
  minDate: moment.Moment;

  inviteOptions: Array<any> = [
    {name: 'Open Information', value: 'openInformation'},
    {name: 'Confidential Information', value: 'confidentialInformation'},
    {name: 'Virtual Data Room (VDR)', value: 'VDR'},
  ]

  @Output()
  sendInviteClickEvent: EventEmitter<IOpportunitySubscription> = new EventEmitter<IOpportunitySubscription>();

  attendeesForm: FormGroup = new FormGroup({
    attendeeEmail: new FormControl('', [Validators.email]),
    inviteeMessage: new FormControl(''),
    startDate: new FormControl(''),
    endDate: new FormControl(''),
    accessLevels:  new FormArray([]),
  });

  constructor(
    public dialogRef: MatDialogRef<InviteAttendeesModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(){
    this.minDate = moment(new Date());
    if (this.data) {
      this.title = this.data.title ?? this.title;
      this.opportunityId = this.data.opportunityId ?? this.opportunityId;
      this.opportunityName = this.data.opportunityName ?? this.opportunityName;
      this.confirmButtonText = this.data.confirmButtonText ?? this.confirmButtonText;
      this.cancelButtonText = this.data.cancelButtonText ?? this.cancelButtonText;
      this.displayObject = this.data.displayObject ?? this.displayObject;
    }
  }

  onCheckboxChange(event: any) {
    const selectedAccessLevels = (this.attendeesForm.controls.accessLevels as FormArray);
    if (event.checked) {
      selectedAccessLevels.push(new FormControl(event.source.value));
    } else {
      const index = selectedAccessLevels.controls
      .findIndex(x => x.value === event.source.value);
      selectedAccessLevels.removeAt(index);
    }
  }

  dateSelected(evt) {
    if (evt.endDate && evt.startDate) {
      const addDay = moment(evt.endDate).utc().add(1, 'days').subtract(1, 'minutes').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
      evt.endDate = moment(addDay);
      const startingDate = moment(evt.startDate).isSame(moment(), 'day') ? moment(new Date()) : evt.startDate;
      this.attendeesForm.get('startDate').setValue(startingDate);
      this.attendeesForm.get('endDate').setValue(evt.endDate);
    }
  }

  sendInvite() {
    const sendInvitePayload: IOpportunitySubscription = {
      opportunityId: this.opportunityId,
      subscriptionRequestId: '',
      attendeeId: this.attendeesForm.controls.attendeeEmail.value,
      accessLevels: this.attendeesForm.controls.accessLevels.value,
      startDate: this.attendeesForm.controls.startDate.value,
      endDate: this.attendeesForm.controls.endDate.value,
      description: this.attendeesForm.controls.inviteeMessage.value
    }   
    this.sendInviteClickEvent.emit(sendInvitePayload);
    this.closeModal();
  }

  closeModal() {
    this.dialogRef.close(true);
  }
}
