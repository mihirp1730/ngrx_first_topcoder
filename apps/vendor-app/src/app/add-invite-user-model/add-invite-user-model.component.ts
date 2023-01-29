import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { DateRange } from '@angular/material/datepicker';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { OpportunityService } from '@apollo/app/services/opportunity';
import { SlbDateTimeFormats } from '@slb-dls/angular-material/core';
import * as moment from 'moment';

import { dateRangeValidator } from '../opportunity/helpers/date-picker-range.helper';

interface IDateRange {
  endDate: moment.Moment;
  startDate: moment.Moment;
}

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

interface SlbDropdownOption {
  viewText: string;
  value: any;
  descriptionText?: string;
  isDisabled?: boolean;
  endDate?: string;
}

@Component({
  selector: 'apollo-add-invite-user-model',
  templateUrl: './add-invite-user-model.component.html',
  styleUrls: ['./add-invite-user-model.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: MAT_DATE_FORMATS, useValue: SLB_MOMENT_DATE_FORMATS }]
})
export class AddInviteUserModelComponent implements OnInit {
  public addUserDetails: FormGroup;
  confidentialInfoDateRangeDisabled = true;
  vdrInfoDateRangeDisabled = true;
  confidentialDateControl: FormControl = new FormControl('', [Validators.required, dateRangeValidator()]);
  vdrDateControl: FormControl = new FormControl('', [Validators.required, dateRangeValidator()]);
  confidentialDateRange: DateRange<moment.Moment>;
  vdrDateRange: DateRange<moment.Moment>;
  minDate: moment.Moment;
  opportunityNameList: SlbDropdownOption[];
  opportunityName: string;
  showLoader = false;
  context: string;
  opportunityId: string;
  opportunityUrl: string;
  title: string;
  saveText: string;
  opportunityMaxDate: moment.Moment;

  @Output()
  createSubscriptionClickEvent: EventEmitter<any> = new EventEmitter<any>();

  @Output()
  getSubscriptionsEvent: EventEmitter<any> = new EventEmitter<any>();
  showTooltip: boolean;

  constructor(
    private form: FormBuilder,
    public opportunityService: OpportunityService,
    public dialogRef: MatDialogRef<AddInviteUserModelComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.opportunityNameList = this.data?.opportunityNameList;
    this.opportunityName = this.data?.opportunityName;
    this.context = this.data?.component;
    this.opportunityId = this.data?.opportunityId;
    this.title = this.data?.title;
    this.saveText = this.data?.saveText || 'Save';
    this.minDate = moment(new Date());
    if (this.data?.component === 'invite_attendee') {
      this.opportunityService.getOpportunityById(this.opportunityId).subscribe((detail) => {
        this.opportunityMaxDate = moment(detail.offerEndDate);
        this.changeDetectorRef.detectChanges();
      });
    }
    this.addUserDetails = this.form.group({
      opportunityName: new FormControl(),
      opportunityUrl: new FormControl(this.getOpportunityUrl(this.data?.opportunityId || '')),
      userDetails: this.form.array([this.newUser()]),
      confidentialInfo: this.form.group({
        isChecked: new FormControl(),
        startDate: new FormControl(),
        endDate: new FormControl(),
        dateRange: this.confidentialDateControl
      }),
      vdrInfo: this.form.group({
        isChecked: new FormControl(),
        startDate: new FormControl(),
        endDate: new FormControl(),
        dateRange: this.vdrDateControl
      }),
      message: ''
    });
  }

  get users(): FormArray {
    return this.addUserDetails.get('userDetails') as FormArray;
  }

  newUser(): FormGroup {
    return this.form.group({
      attendeeId: ['', [Validators.required, Validators.email]],
      firstName: ['', [Validators.required, Validators.pattern('[^ ][a-zA-Z ]*')]],
      lastName: ['', [Validators.required, Validators.pattern('[^ ][a-zA-Z ]*')]],
      companyName: ['', [Validators.required, Validators.pattern('[^ ].*')]]
    });
  }

  addUser() {
    this.users.push(this.newUser());
    // adding this as the new formgroup will remain untouched as on creation we don't fill any value
    this.users.controls[this.users.length - 1].markAsUntouched();
  }

  removeUser(i: number) {
    if (this.users.length > 1) {
      this.users.removeAt(i);
    }
  }

  onCheckboxChange(evt: any, type: string) {
    if (type === 'confidentialInfo') {
      this.confidentialInfoDateRangeDisabled = !this.confidentialInfoDateRangeDisabled;
      this.confidentialDateControl.reset();
    }
    if (type === 'vdrInfo') {
      this.vdrInfoDateRangeDisabled = !this.vdrInfoDateRangeDisabled;
      this.vdrDateControl.reset();
    }
  }

  accessLevelCheck() {
    const confidentialInfo = this.addUserDetails.get('confidentialInfo').value;
    const vdrInfo = this.addUserDetails.get('vdrInfo').value;
    return (confidentialInfo.isChecked && confidentialInfo.endDate) || (vdrInfo.isChecked && vdrInfo.endDate);
  }

  save() {
    this.addUserDetails.markAllAsTouched();
    if (this.addUserDetails.valid && this.accessLevelCheck()) {
      this.showLoader = true;
      this.createSubscriptionClickEvent.emit(this.generatePayload());
      this.data.closeModal.subscribe((flag) => {
        if (flag) {
          this.showLoader = false;
          this.closeModal();
          this.getSubscriptionsEvent.emit();
        }
      });
    }
  }

  closeModal() {
    this.dialogRef.close(true);
  }

  dateSelected(evt: IDateRange, type: string) {
    if (evt.endDate && evt.startDate) {
      const addDay = moment(evt.endDate).utc().add(1, 'days').subtract(1, 'minutes').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
      evt.endDate = moment(addDay);
      const startingDate = moment(evt.startDate).isSame(moment(), 'day') ? moment(new Date()) : evt.startDate;
      this.addUserDetails.get(`${type}.startDate`).setValue(startingDate);
      this.addUserDetails.get(`${type}.endDate`).setValue(evt.endDate);
    }
  }

  isSubscriptionAvailable(email: string, index: number) {
    const attendeeId = this.users.controls[index].get('attendeeId');
    if (this.data && !attendeeId.hasError('email') && !attendeeId.hasError('required')) {
      const opportunityNameObj = this.addUserDetails.get('opportunityName').value;
      if (opportunityNameObj?.value || this.opportunityId) {
        const subscriptionIndex = this.data.item.findIndex((subscription) => {
          return (
            subscription.attendeeId.toLowerCase() === email.toLowerCase() &&
            (subscription.opportunityId === opportunityNameObj?.value || subscription.opportunityId === this.opportunityId)
          );
        });
        if (subscriptionIndex > -1) {
          attendeeId.setErrors({ subscriptionAvailable: true });
        } else {
          attendeeId.setErrors({ subscriptionAvailable: null });
          attendeeId.updateValueAndValidity();
        }
        return subscriptionIndex > -1 ? true : false;
      }
    }
  }

  generatePayload() {
    const accessDetails = [];
    if (this.addUserDetails.get('confidentialInfo.isChecked').value) {
      accessDetails.push({
        accessLevel: 'CONFIDENTIAL_INFORMATION',
        startDate: this.addUserDetails.get('confidentialInfo.startDate').value,
        endDate: this.addUserDetails.get('confidentialInfo.endDate').value
      });
    }
    if (this.addUserDetails.get('vdrInfo.isChecked').value) {
      accessDetails.push({
        accessLevel: 'VDR',
        startDate: this.addUserDetails.get('vdrInfo.startDate').value,
        endDate: this.addUserDetails.get('vdrInfo.endDate').value
      });
    }

    this.users.value.map((item) => {
      item.attendeeId = item.attendeeId.toLowerCase();
      return item;
    });

    return {
      opportunityId: this.data?.opportunityId || this.addUserDetails.get('opportunityName').value.value,
      description: this.addUserDetails.get('message').value,
      attendeeDetails: this.users.value,
      accessDetails
    };
  }

  getOpportunityUrl(id) {
    return this.opportunityService.getOpportunityConsumerUrl(id);
  }

  copyToClipBoard() {
    const url = this.addUserDetails.get('opportunityUrl').value;
    navigator.clipboard.writeText(url);
    this.showTooltip = true;
    setTimeout(() => {
      this.showTooltip = false;
      this.changeDetectorRef.detectChanges();
    }, 2000);
  }

  onOpportunitySelectionChanged(event: SlbDropdownOption) {
    this.opportunityMaxDate = moment(event.endDate);
  }
}
