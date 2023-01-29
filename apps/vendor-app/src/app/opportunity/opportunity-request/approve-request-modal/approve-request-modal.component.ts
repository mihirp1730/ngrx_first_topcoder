import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IOpportunityRequest, IOpportunitySubscription, OpportunityService } from '@apollo/app/services/opportunity';
import { Store } from '@ngrx/store';
import { SlbDateTimeFormats } from '@slb-dls/angular-material/core';
import * as moment from 'moment';

import { dateRangeValidator } from '../../helpers/date-picker-range.helper';
import * as opportunityActions from '../../state/actions/opportunity.actions';
import * as opportunitySelectors from '../../state/selectors/opportunity.selectors';

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

interface IDateRange {
  endDate: moment.Moment;
  startDate: moment.Moment;
}

@Component({
  selector: 'apollo-approve-request-modal',
  templateUrl: './approve-request-modal.component.html',
  styleUrls: ['./approve-request-modal.component.scss'],
  providers: [{ provide: MAT_DATE_FORMATS, useValue: SLB_MOMENT_DATE_FORMATS }]
})
export class ApproveRequestModalComponent implements OnInit {
  item: IOpportunityRequest;
  minDate: moment.Moment;
  confidentialInfoDisabled = true;
  vdrInfoDisabled = true;
  showLoader$ = this.store.select(opportunitySelectors.selectIsLoadingWhileCreatingSubscription);
  vdrDateControl: FormControl = new FormControl('', [Validators.required, dateRangeValidator()]);
  confidentialDateControl: FormControl = new FormControl('', [Validators.required, dateRangeValidator()]);
  opportunityMaxDate: moment.Moment;

  requestApproval = new FormGroup({
    confidentialInfo: new FormGroup({
      isChecked: new FormControl(false),
      startDate: new FormControl(),
      endDate: new FormControl(),
      dateRange: this.confidentialDateControl
    }),
    vdrInfo: new FormGroup({
      isChecked: new FormControl(false),
      startDate: new FormControl(),
      endDate: new FormControl(),
      dateRange: this.vdrDateControl
    })
  });

  constructor(
    public dialogRef: MatDialogRef<ApproveRequestModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public readonly store: Store,
    public opportunityService: OpportunityService
  ) {}

  ngOnInit(): void {
    if (this.data) {
      this.item = this.data.item;
      this.opportunityService.getOpportunityById(this.item.opportunityId).subscribe((detail) => {
        this.minDate = moment(new Date());
        this.opportunityMaxDate = moment(detail.offerEndDate);
      });
      this.item.accessLevels.forEach((access) => {
        if (access.toLowerCase().search('details') > -1) {
          this.requestApproval.get('confidentialInfo.isChecked').setValue(true);
          this.confidentialInfoDisabled = false;
        }
        if (access.toLowerCase().search('vdr') > -1) {
          this.requestApproval.get('vdrInfo.isChecked').setValue(true);
          this.vdrInfoDisabled = false;
        }
      });

      if (this.vdrInfoDisabled) {
        this.requestApproval.get('vdrInfo').disable();
      }
      if (this.confidentialInfoDisabled) {
        this.requestApproval.get('confidentialInfo').disable();
      }
    }
  }

  closeModal() {
    this.dialogRef.close(true);
  }

  approve() {
    if (this.requestApproval.valid) {
      const payload = this.generatePayload();
      if (this.item.opportunitySubscriptionId) {
        payload.subscriptionId = this.item.opportunitySubscriptionId;
        this.store.dispatch(opportunityActions.updateOpportunitySubscription({ payload }));
      } else {
        this.store.dispatch(opportunityActions.createOpportunitySubscription({ payload }));
      }
      this.store.select(opportunitySelectors.selectOpportunitySubscriptionId).subscribe((ids) => {
        if (ids?.length > 0) {
          this.closeModal();
          this.store.dispatch(opportunityActions.getOpportunitySubscriptions());
          this.store.dispatch(opportunityActions.removeSubscriptionId());
          this.store.dispatch(opportunityActions.getOpportunityRequestList());
        }
      });
    } else {
      if (this.requestApproval.get('confidentialInfo.isChecked').value) {
        this.confidentialDateControl.markAsTouched();
      }
      if (this.requestApproval.get('vdrInfo.isChecked').value) {
        this.vdrDateControl.markAsTouched();
      }
    }
  }

  generatePayload(): IOpportunitySubscription {
    const accessDetails = [];
    if (this.requestApproval.get('confidentialInfo.isChecked').value) {
      accessDetails.push({
        accessLevel: 'CONFIDENTIAL_INFORMATION',
        startDate: this.requestApproval.get('confidentialInfo.startDate').value,
        endDate: this.requestApproval.get('confidentialInfo.endDate').value
      });
    }
    if (this.requestApproval.get('vdrInfo.isChecked').value) {
      accessDetails.push({
        accessLevel: 'VDR',
        startDate: this.requestApproval.get('vdrInfo.startDate').value,
        endDate: this.requestApproval.get('vdrInfo.endDate').value
      });
    }
    const attendeeDetails = [
      {
        attendeeId: this.item.requestedBy,
        firstName: this.item.firstName,
        lastName: this.item.lastName,
        companyName: this.item.companyName
      }
    ];
    const sendInvitePayload: IOpportunitySubscription = {
      opportunityId: this.item.opportunityId,
      description: this.item.comment,
      attendeeDetails,
      subscriptionRequestId: this.item.subscriptionRequestId,
      accessDetails
    };
    const sendUpdateSubscriptionPayload = {
      opportunityId: this.item.opportunityId,
      subscriptionId: this.item.opportunitySubscriptionId,
      statusChangeComment: '',
      attendeeId: this.item.requestedBy,
      companyName: this.item.companyName,
      firstName: this.item.firstName,
      lastName: this.item.lastName,
      subscriptionRequestId: this.item.subscriptionRequestId,
      accessDetails
    };
    return this.item.opportunitySubscriptionId ? sendUpdateSubscriptionPayload : sendInvitePayload;
  }

  levelCheckChange(evt: MatCheckboxChange, type: string) {
    if (type === 'confInfo') {
      this.confidentialInfoDisabled = !evt.checked;
      this.confidentialDateControl.reset();
    }
    if (type === 'vdrInfo') {
      this.vdrInfoDisabled = !evt.checked;
      this.vdrDateControl.reset();
    }
  }

  dateSelected(evt: IDateRange, type: string) {
    if (evt.endDate && evt.startDate) {
      const updatedNewStartDate = moment(evt.startDate).isSame(moment(), 'day')
        ? moment(new Date()).utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]')
        : moment(evt.startDate).utc();
      evt.endDate = moment(moment(evt.endDate).utc().add(1, 'days').subtract(1, 'minutes').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'));
      evt.startDate = moment(updatedNewStartDate);
      this.requestApproval.get(`${type}.startDate`).setValue(evt.startDate);
      this.requestApproval.get(`${type}.endDate`).setValue(evt.endDate);
    }
  }
}
