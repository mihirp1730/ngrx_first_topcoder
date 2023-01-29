import * as moment from 'moment';
import * as opportunitySelectors from '../../state/selectors/opportunity.selectors';

import { ChangeDetectionStrategy, Component, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  IOpportunity,
  IOpportunityDetails,
  IOpportunityDuration,
  OpportunityStatus,
  OpportunityType
} from '@apollo/app/services/opportunity';
import { distinctUntilChanged, filter, map, startWith } from 'rxjs/operators';

import { MAT_DATE_FORMATS } from '@angular/material/core';
import { MetadataService } from '@apollo/app/metadata';
import { SlbDateTimeFormats } from '@slb-dls/angular-material/core';
import { SlbDropdownOption } from '@slb-dls/angular-material/dropdown';
import { Store } from '@ngrx/store';
import { combineLatest } from 'rxjs';
import { durationDropdownValues } from './opportunity-details.constants';
import { isEqual } from 'lodash';

export const SLB_MOMENT_DATE_FORMATS: SlbDateTimeFormats = {
  parse: {
    dateInput: 'DD-MMM-YYYY',
    dateTimeInput: 'DD-MMM-YYYY HH:mm:SSS'
  },
  display: {
    dateInput: 'DD-MMM-YYYY',
    dateTimeInput: 'DD-MMM-YYYY HH:mm:SSS',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'DD-MMM-YYYY',
    monthYearA11yLabel: 'MMMM YYYY'
  }
};

@Component({
  selector: 'apollo-opportunity-details',
  templateUrl: './opportunity-details.component.html',
  styleUrls: ['./opportunity-details.component.scss'],
  providers: [{ provide: MAT_DATE_FORMATS, useValue: SLB_MOMENT_DATE_FORMATS }],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OpportunityDetailsComponent implements OnInit {
  readonly opportunityTypeEnum = OpportunityType;
  readonly opportunityStatusEnum = OpportunityStatus;
  readonly assetType$ = this.metadataService.assetTypesMetadata$.pipe(map(this.generateOptions));
  readonly offerType$ = this.metadataService.offerTypesMetadata$.pipe(map(this.generateOptions));
  readonly contractType$ = this.metadataService.contractTypesMetadata$.pipe(map(this.generateOptions));
  readonly deliveryType$ = this.metadataService.deliveryTypesMetadata$.pipe(map(this.generateOptions));
  readonly phaseType$ = this.metadataService.phaseTypesMetadata$.pipe(map(this.generateOptions));
  readonly countryName$ = this.metadataService.countryList$.pipe(map(this.generateOptions));

  minDate = moment(new Date()).utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');

  readonly INITIAL_FORM_VALUE = {
    countries: [],
    phase: [],
    assetType: [],
    offerType: [],
    contractType: [],
    deliveryType: [],
    offerStartDate: this.minDate,
    offerEndDate: '',
    duration: {
      viewText: 'Unlimited',
      value: 1188
    },
    expectedSequestration: '',
    costOfCarbonAbated: '',
    certifier: '',
    lastValidatedOrVerified: ''
  };

  startDate: FormControl = new FormControl(this.minDate, [Validators.required]);
  endDate: FormControl = new FormControl('', [Validators.required]);
  readonly opportunityDetails = new FormGroup({
    countries: new FormControl([], Validators.required),
    phase: new FormControl([], Validators.required),
    assetType: new FormControl([], Validators.required),
    offerType: new FormControl([], Validators.required),
    contractType: new FormControl([], Validators.required),
    deliveryType: new FormControl([], Validators.required),
    offerStartDate: this.startDate,
    offerEndDate: this.endDate,
    duration: new FormControl({ viewText: 'Unlimited', value: 99 * 12 }, Validators.required),
    expectedSequestration: new FormControl(''),
    costOfCarbonAbated: new FormControl(''),
    certifier: new FormControl(''),
    lastValidatedOrVerified: new FormControl('')
  });

  public readonly durationValues = durationDropdownValues;

  public endDateDisabled = true;
  public isExpiredEndDate = false;
  public opporEndMinDate = moment(new Date()).utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');

  public readonly selectOpportunity$ = this.store
    .select(opportunitySelectors.selectOpportunity)
    .pipe(filter((opportunity) => !!opportunity));

  public readonly startDate$ = this.selectOpportunity$.pipe(
    map((opportunity) => {
      if (opportunity.offerStartDate) {
        this.opportunityDetails.get('offerStartDate').markAsTouched();
        this.minDate =
          moment(new Date()).diff(moment(opportunity.offerStartDate), 'days') < 0
            ? moment(new Date()).utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]')
            : moment(opportunity.offerStartDate).utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
      }
      return opportunity.offerStartDate ? moment(opportunity.offerStartDate) : '';
    })
  );

  public readonly initialFormData$ = combineLatest([
    this.selectOpportunity$,
    // Wait for these to finish before we initialize our form with data:
    this.assetType$,
    this.offerType$,
    this.contractType$,
    this.deliveryType$,
    this.phaseType$,
    this.countryName$
  ]).pipe(
    filter(([opportunity]) => !!opportunity.countries),
    distinctUntilChanged(),
    map(([opportunity]) => {
      // enable disable the control to emit the value on load during edit flow
      this.opportunityDetails.get('offerEndDate').enable();
      this.opportunityDetails.get('offerEndDate').disable();
      if (opportunity.offerStartDate) {
        this.opporEndMinDate = moment(opportunity.offerStartDate).endOf('day').utc().add(1, 'days').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
      }
      return {
        countries: opportunity.countries,
        phase: opportunity.phase,
        assetType: opportunity.assetType,
        offerType: opportunity.offerType,
        contractType: opportunity.contractType,
        deliveryType: opportunity.deliveryType,
        offerStartDate: opportunity.offerStartDate,
        offerEndDate: opportunity.offerEndDate,
        expectedSequestration: opportunity.ccusAttributes?.expectedSequestration,
        costOfCarbonAbated: opportunity.ccusAttributes?.costOfCarbonAbated,
        certifier: opportunity.ccusAttributes?.certifier,
        lastValidatedOrVerified: opportunity.ccusAttributes?.lastValidatedOrVerified,
        duration: this.setDurationInitialValue(opportunity)
      };
    })
  );

  @Output() formIsValid = this.opportunityDetails.statusChanges.pipe(
    map((status) => status === 'VALID'),
    distinctUntilChanged()
  );

  @Output() opportunityDetailsChanged = this.opportunityDetails.valueChanges.pipe(distinctUntilChanged());

  @Output() isOpportunityDetailsFormDirty = combineLatest([
    this.opportunityDetails.valueChanges.pipe(startWith(this.opportunityDetails.value)),
    this.initialFormData$
  ]).pipe(
    map(([formValue, initialFormData]) => {
      // cover dates into required formats
      formValue.offerStartDate = moment(formValue.offerStartDate).utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
      //As offerEndDate is disabled so value is getting from getRawValue
      formValue.offerEndDate = moment(this.opportunityDetails.getRawValue()?.offerEndDate).utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
      initialFormData.offerStartDate = moment(initialFormData.offerStartDate).utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
      return isEqual(formValue, initialFormData);
    })
  );

  constructor(private metadataService: MetadataService, public readonly store: Store) {}

  ngOnInit(): void {
    const opporEndDate = moment()
      .add(durationDropdownValues[0].value, 'M')
      .subtract(1, 'day')
      .endOf('day')
      .utc()
      .format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
    this.opportunityDetails.get('offerEndDate').setValue(opporEndDate);
    this.disableEndDateControl();
  }

  compareValues(option: string[], value: string[]) {
    return option[0] === value[0];
  }

  public compareWith(object1: any, object2: any) {
    return object1 && object2 && object1.value === object2.value;
  }

  generateOptions(response: any[]): SlbDropdownOption[] {
    response.sort();
    response.push(response.splice(response.indexOf('Other'), 1)[0]);
    return response.map((item: any) => ({
      value: item,
      viewText: item
    }));
  }

  public setDurationInitialValue(opportunity: IOpportunity | IOpportunityDetails): IOpportunityDuration {
    if (!opportunity.offerStartDate) {
      this.enableEndDateControl();
      return this.durationValues[0];
    }
    const opporDurationMonths = moment(opportunity.offerEndDate).diff(moment(opportunity.offerStartDate), 'M') + 1;
    const durationObj = this.durationValues.find((duration) => duration.value === opporDurationMonths);
    if (durationObj) {
      this.disableEndDateControl();
      return durationObj;
    }
    this.enableEndDateControl();
    return this.durationValues[4];
  }

  dateSelected(type: string, evt) {
    if (type === 'startDate') {
      //If start date is today's than it should take with the current time as well instead of end of the day.
      const startDateVal = moment(this.opportunityDetails.get('offerStartDate').value).isSame(moment(), 'day')
        ? moment(new Date()).utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]')
        : this.opportunityDetails.get('offerStartDate').value;
      this.opportunityDetails.get('offerStartDate').setValue(startDateVal);
      const endDateVal =
        moment(this.opportunityDetails.get('offerEndDate').value).isSame(moment(), 'day') ||
        moment(this.opportunityDetails.get('offerEndDate').value).isBefore(startDateVal)
          ? this.opportunityDetails
              .get('offerEndDate')
              .setValue(moment(startDateVal).endOf('day').utc().add(1, 'days').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'))
          : this.opportunityDetails.get('offerEndDate').value;
      this.opporEndMinDate = moment(startDateVal).endOf('day').utc().add(1, 'days').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
      const durationValue = this.opportunityDetails.get('duration').value;
      if (durationValue.value !== -1) {
        // change the form end date if duration dropdown is selected
        this.opportunityDetails.get('offerEndDate').enable();
        this.opportunityDetails
          .get('offerEndDate')
          .setValue(moment(evt).endOf('day').utc().add(durationValue.value, 'M').subtract(1, 'day').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'));
        this.disableEndDateControl();
      } else if (!endDateVal) {
        this.opportunityDetails
          .get('offerEndDate')
          .setValue(moment(startDateVal).endOf('day').utc().add(1, 'days').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'));
      }
      this.opportunityDetails.get('offerEndDate').markAsTouched();
    } else {
      this.opportunityDetails.get('offerEndDate').setValue(moment(evt).endOf('day').utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'));
    }
  }

  durationChange(event) {
    const durationValue = event.value.value;
    //If start date is today's than it should take with the current time as well instead of end of the day.
    const offerStartDate = moment(this.opportunityDetails.get('offerStartDate').value);
    this.opportunityDetails.get('offerStartDate').setValue(offerStartDate);
    this.opporEndMinDate = moment(offerStartDate).endOf('day').utc().add(1, 'days').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
    if (durationValue !== -1) {
      // enable the field and then disable after updating the value
      this.enableEndDateControl();
      this.opportunityDetails
        .get('offerEndDate')
        .setValue(
          moment(offerStartDate).endOf('day').utc().add(durationValue, 'M').subtract(1, 'day').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]')
        );
      this.disableEndDateControl();
    } else {
      this.enableEndDateControl();
      this.opportunityDetails
        .get('offerEndDate')
        .setValue(moment(offerStartDate).endOf('day').utc().add(1, 'days').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'));
    }
  }

  enableEndDateControl() {
    this.endDateDisabled = false;
    this.opportunityDetails.get('offerEndDate').enable();
  }

  disableEndDateControl() {
    this.endDateDisabled = true;
    this.opportunityDetails.get('offerEndDate').disable();
  }
}
