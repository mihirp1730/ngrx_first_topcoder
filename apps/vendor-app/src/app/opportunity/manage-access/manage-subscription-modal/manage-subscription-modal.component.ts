import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import {
  AccessStatus,
  AccessType,
  IAccessDetails,
  IOpportunitySubscription,
  IOppSubscription,
  OpportunityService
} from '@apollo/app/services/opportunity';
import { Store } from '@ngrx/store';
import { SlbDateTimeFormats } from '@slb-dls/angular-material/core';
import { DateRange } from '@slb-dls/angular-material/date-range-picker';
import { isEqual } from 'lodash';
import * as moment from 'moment';

import { dateRangeValidator } from '../../helpers/date-picker-range.helper';
import * as opportunityActions from '../../state/actions/opportunity.actions';
import * as opportunitySelectors from '../../state/selectors/opportunity.selectors';

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

@Component({
  selector: 'apollo-manage-subscription-modal',
  templateUrl: './manage-subscription-modal.component.html',
  styleUrls: ['./manage-subscription-modal.component.scss'],
  providers: [{ provide: MAT_DATE_FORMATS, useValue: SLB_MOMENT_DATE_FORMATS }]
})
export class ManageSubscriptionModalComponent implements OnInit {
  opportunitySubscription: IOppSubscription;
  confidentialInfoDateRangeDisabled = true;
  vdrInfoDateRangeDisabled = true;
  confidentialDateControl: FormControl = new FormControl('', [Validators.required, dateRangeValidator()]);
  vdrDateControl: FormControl = new FormControl('', [Validators.required, dateRangeValidator()]);
  confidentialDateRange: DateRange<moment.Moment>;
  vdrDateRange: DateRange<moment.Moment>;
  showLoader$ = this.store.select(opportunitySelectors.selectIsLoadingWhileCreatingSubscription);
  readonly minDate = moment(new Date());
  isSaveDisabled = true;
  opportunityMaxDate: moment.Moment;
  opportunityMinDate: moment.Moment;
  confidentialInfoDetails: IAccessDetails;
  vdrInfoDetails: IAccessDetails;
  vdrEquality: boolean;
  ciEquality: boolean;
  readonly accessTypeEnum: AccessType;

  manageSubscriptionForm = new FormGroup({
    confidentialInfo: new FormGroup({
      isChecked: new FormControl(),
      startDate: new FormControl(),
      endDate: new FormControl(),
      dateRange: this.confidentialDateControl
    }),
    vdrInfo: new FormGroup({
      isChecked: new FormControl(),
      startDate: new FormControl(),
      endDate: new FormControl(),
      dateRange: this.vdrDateControl
    }),
    statusChangeComment: new FormControl({ value: '', disabled: true }, [Validators.required, Validators.pattern('^[^ ]{1}.*')])
  });

  constructor(
    public dialogRef: MatDialogRef<ManageSubscriptionModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public readonly store: Store,
    public opportunityService: OpportunityService
  ) {}

  ngOnInit(): void {
    if (this.data?.item) {
      this.opportunitySubscription = this.data.item;
      this.opportunityService.getOpportunityById(this.data.item.opportunityId).subscribe((detail) => {
        this.opportunityMaxDate = moment(detail.offerEndDate);
        this.opportunityMinDate = moment(detail.offerStartDate);
      });
      this.data.item.accessDetails.map((details) => {
        if (details.accessLevel?.toLowerCase() === 'confidential_information') {
          this.confidentialInfoDetails = details;
          this.updateAccessFormControls(details, AccessType.ci, 'confidentialInfoDateRangeDisabled');
        }
        if (details.accessLevel?.toLowerCase() === 'vdr') {
          this.vdrInfoDetails = details;
          this.updateAccessFormControls(details, AccessType.vdr, 'vdrInfoDateRangeDisabled');
        }
      });
    }
    this.manageSubscriptionForm.getRawValue();
  }

  private updateAccessFormControls(details, _type, dateRangeFlag) {
    if (details.status === AccessStatus.Revoked || details.status === AccessStatus.Expired) {
      this[dateRangeFlag] = true;
    } else {
      this[dateRangeFlag] = false;
    }
    this.patchingValues(_type, details);
  }

  patchingValues(_type, details) {
    this.manageSubscriptionForm.get(_type).patchValue(
      {
        isChecked: details.status === AccessStatus.Approved,
        startDate: details.startDate,
        endDate: details.endDate
      },
      { emitEvent: false }
    );
    if (_type === AccessType.ci) {
      this.confidentialDateRange = {
        startDate: moment(details.startDate),
        endDate: moment(details.endDate)
      };
    }
    if (_type === AccessType.vdr) {
      this.vdrDateRange = {
        startDate: moment(details.startDate),
        endDate: moment(details.endDate)
      };
    }
  }

  isValueChanged(type: string) {
    const checkTheChangesForButton = this.isValuesInPreviousState(type);
    if (checkTheChangesForButton) {
      if (this.manageSubscriptionForm.get(type).dirty || this.manageSubscriptionForm.get(`${type}.startDate`).pristine) {
        this.manageSubscriptionForm.get('statusChangeComment').enable({
          onlySelf: false,
          emitEvent: false
        });
        this.isSaveDisabled = false;
      }
    } else {
      this.manageSubscriptionForm.get('statusChangeComment').disable({
        onlySelf: false,
        emitEvent: false
      });
      this.isSaveDisabled = true;
    }
  }

  save() {
    if (this.manageSubscriptionForm.valid) {
      const payload = this.generatePayload();
      this.store.dispatch(opportunityActions.updateOpportunitySubscription({ payload }));
      this.store.select(opportunitySelectors.selectIsSubscriptionUpdated).subscribe((flag) => {
        if (flag) {
          this.closeModal();
          this.store.dispatch(opportunityActions.getOpportunitySubscriptions());
        }
      });
    } else {
      if (this.manageSubscriptionForm.get(`${AccessType.ci}.isChecked`).value) {
        this.confidentialDateControl.markAsTouched();
      }
      if (this.manageSubscriptionForm.get(`${AccessType.vdr}.isChecked`).value) {
        this.vdrDateControl.markAsTouched();
      }
    }
  }

  generatePayload(): IOpportunitySubscription {
    const accessDetails = [];
    const types = ['vdrInfo', 'confidentialInfo'];
    types.forEach((type) => {
      this.checkTheChanges(type);
      if (
        this.manageSubscriptionForm.get(`${type}.startDate`).value !== null &&
        this.manageSubscriptionForm.get(`${type}.endDate`).value !== null
      ) {
        if (type === AccessType.ci && !this.ciEquality) {
          accessDetails.push({
            accessLevel: 'CONFIDENTIAL_INFORMATION',
            startDate: this.manageSubscriptionForm.get(`${AccessType.ci}.startDate`).value,
            endDate: this.manageSubscriptionForm.get(`${AccessType.ci}.endDate`).value
          });
        }
        if (type === AccessType.vdr && !this.vdrEquality) {
          accessDetails.push({
            accessLevel: 'VDR',
            startDate: this.manageSubscriptionForm.get(`${AccessType.vdr}.startDate`).value,
            endDate: this.manageSubscriptionForm.get(`${AccessType.vdr}.endDate`).value
          });
        }
      }
    });
    return {
      opportunityId: this.opportunitySubscription.opportunityId,
      subscriptionRequestId: this.opportunitySubscription.opportunitySubscriptionRequestId,
      subscriptionId: this.opportunitySubscription.opportunitySubscriptionId,
      statusChangeComment: this.manageSubscriptionForm.get('statusChangeComment').value,
      attendeeId: this.opportunitySubscription.attendeeId,
      accessDetails
    };
  }

  checkTheChanges(type) {
    const typeInfoDetails = this.getSelectedTypeDate(type);
    if (typeInfoDetails) {
      if (typeInfoDetails.accessLevel === 'CONFIDENTIAL_INFORMATION' || type === AccessType.ci) {
        this.ciEquality = this.valuesForMatching(type, typeInfoDetails);
      }
      if (typeInfoDetails.accessLevel === 'VDR' || type === AccessType.vdr) {
        this.vdrEquality = this.valuesForMatching(type, typeInfoDetails);
      }
    }
  }

  valuesForMatching(type, details) {
    const detailValues = {
      endDate: details.endDate,
      startDate: details.startDate,
      isChecked: details.status === AccessStatus.Approved
    };
    const formValues = {
      startDate: this.manageSubscriptionForm.get(`${type}.startDate`).value,
      endDate: this.manageSubscriptionForm.get(`${type}.endDate`).value,
      isChecked: this.manageSubscriptionForm.get(`${type}.isChecked`).value
    };
    return isEqual(detailValues, formValues);
  }

  closeModal() {
    this.dialogRef.close(true);
  }

  isValuesInPreviousState(type) {
    const typeInfoDetails = this.getSelectedTypeDate(type);
    let equalityResult;
    // if data undefined.
    if (typeInfoDetails === undefined && this.manageSubscriptionForm.get(`${type}.isChecked`).value) {
      return true;
    } else if (typeInfoDetails === undefined && !this.manageSubscriptionForm.get(`${type}.isChecked`).value) {
      return false;
    } else {
      equalityResult = this.valuesForMatching(type, typeInfoDetails);
    }
    //once the toggle changed that time it will trigger.
    if (this.manageSubscriptionForm.get(`${type}.isChecked`).value !== (typeInfoDetails.status === AccessStatus.Approved)) {
      if (!equalityResult) {
        return true;
      } else {
        return false;
      }
      //once the toggle not changed but dates changed that time it will trigger.
    } else if (this.manageSubscriptionForm.get(`${type}.isChecked`).value === (typeInfoDetails.status === AccessStatus.Approved)) {
      if (equalityResult) {
        return false;
      } else {
        return true;
      }
    }
    return false;
  }

  toggleChange(evt: MatSlideToggleChange, type: string) {
    let checkForEndDate;
    if (type === AccessType.ci) {
      this.confidentialInfoDateRangeDisabled = !evt.checked;
      checkForEndDate = this.checkForEndDate(type);
      if (this.confidentialInfoDateRangeDisabled && checkForEndDate) {
        this.setDatesForRevoked(type);
      } else {
        this.setDatesForBackFromRevoked(type);
      }
    }
    if (type === AccessType.vdr) {
      this.vdrInfoDateRangeDisabled = !evt.checked;
      checkForEndDate = this.checkForEndDate(type);
      if (this.vdrInfoDateRangeDisabled && checkForEndDate) {
        this.setDatesForRevoked(type);
      } else {
        this.setDatesForBackFromRevoked(type);
      }
    }
    this.isValueChanged(type);
  }

  checkForEndDate(type: string) {
    return this.manageSubscriptionForm.get(`${type}.endDate`);
  }

  isAlreadyChecked(accessInfoDetails) {
    return (
      accessInfoDetails.status === AccessStatus.Approved ||
      accessInfoDetails.status === AccessStatus.Revoked ||
      accessInfoDetails.status === AccessStatus.Expired
    );
  }

  updateValuesBackFromRevoked(isCheckedBefore, accessInfoDetails, _type) {
    if (isCheckedBefore) {
      const dateIsToday = moment(this.manageSubscriptionForm.get(`${_type}.endDate`).value).isSame(moment(), 'day');
      if (!dateIsToday) {
        const updatedNewEndDate = moment().endOf('day').utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
        this.manageSubscriptionForm.get(`${_type}.endDate`).setValue(updatedNewEndDate);
        this.manageSubscriptionForm.get(_type).patchValue(
          {
            isChecked: true,
            startDate: accessInfoDetails?.startDate
              ? accessInfoDetails?.startDate
              : moment(new Date()).startOf('day').utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
            endDate: updatedNewEndDate
          },
          { emitEvent: false }
        );
      } else {
        this.manageSubscriptionForm.get(_type).patchValue(
          {
            isChecked: true,
            startDate: accessInfoDetails?.startDate,
            endDate: accessInfoDetails?.endDate
          },
          { emitEvent: false }
        );
      }
    } else {
      this.manageSubscriptionForm.get(_type).reset();
    }
  }

  isDateNotAvailable(_type) {
    return !this.manageSubscriptionForm.get(`${_type}.startDate`).value && !this.manageSubscriptionForm.get(`${_type}.endDate`).value;
  }

  getSelectedTypeDate(_type) {
    if (_type === AccessType.ci) {
      return this.confidentialInfoDetails;
    }
    if (_type === AccessType.vdr) {
      return this.vdrInfoDetails;
    }
  }

  setDatesForBackFromRevoked(_type: string) {
    const isDateDataNotAvailable = this.isDateNotAvailable(_type);
    if (!isDateDataNotAvailable) {
      const accessInfoDetails = this.getSelectedTypeDate(_type);
      const isCheckedBefore = this.isAlreadyChecked(accessInfoDetails);
      this.updateValuesBackFromRevoked(isCheckedBefore, accessInfoDetails, _type);
    }
  }

  isDatesAlreadySelected(accessInfoDetails) {
    return accessInfoDetails?.startDate && accessInfoDetails?.endDate;
  }

  setDatesForRevoked(type: string) {
    const accessInfoDetails = this.getSelectedTypeDate(type);
    const isDateDataNotAvailable = this.isDatesAlreadySelected(accessInfoDetails);
    if (isDateDataNotAvailable && accessInfoDetails.status === AccessStatus.Approved) {
      const newDate = moment(new Date()).utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
      const updatedNewStartDate = moment(this.manageSubscriptionForm.get(`${type}.startDate`).value).isAfter(newDate)
        ? moment(new Date()).startOf('day').utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]')
        : this.manageSubscriptionForm.get(`${type}.startDate`).value;
      const updatedNewEndDate = moment(updatedNewStartDate).isSame(moment(), 'day')
        ? moment(newDate).utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]')
        : moment(new Date()).utc().subtract(1, 'minutes').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
      this.manageSubscriptionForm.get(`${type}.startDate`).setValue(updatedNewStartDate);
      this.manageSubscriptionForm.get(`${type}.endDate`).setValue(updatedNewEndDate);
    } else if (
      isDateDataNotAvailable &&
      (accessInfoDetails.status === AccessStatus.Expired || accessInfoDetails.status === AccessStatus.Revoked)
    ) {
      this.manageSubscriptionForm.get(`${type}.startDate`).setValue(accessInfoDetails?.startDate);
      this.manageSubscriptionForm.get(`${type}.endDate`).setValue(accessInfoDetails?.endDate);
    } else {
      this.manageSubscriptionForm.get(type).reset();
    }
  }

  dateSelected(evt: IDateRange, type: string) {
    if (evt.endDate && evt.startDate) {
      const updatedNewStartDate = moment(evt.startDate).isSame(moment(), 'day')
        ? moment(new Date()).utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]')
        : moment(evt.startDate).utc();
      evt.endDate = moment(moment(evt.endDate).utc().add(1, 'days').subtract(1, 'minutes').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'));
      evt.startDate = moment(updatedNewStartDate);
      this.manageSubscriptionForm.get(`${type}.startDate`).setValue(evt.startDate);
      this.manageSubscriptionForm.get(`${type}.endDate`).setValue(evt.endDate);
      this.isValueChanged(type);
    }
  }

  getAccessStartDate(accessStartDate: moment.Moment): moment.Moment {
    if (accessStartDate) {
      if (this.opportunityMinDate > accessStartDate) {
        return accessStartDate;
      }
    } else if (moment(new Date()).utc() < this.opportunityMinDate) {
      const formattedDate = moment(new Date()).utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
      return moment(formattedDate);
    }
    return this.opportunityMinDate;
  }
}
