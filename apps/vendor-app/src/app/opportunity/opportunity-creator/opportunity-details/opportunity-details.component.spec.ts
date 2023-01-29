import * as moment from 'moment';
import * as opportunitySelectors from '../../state/selectors/opportunity.selectors';

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ApolloFormPatcherModule } from '@apollo/app/directives/form-patcher';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MetadataService } from '@apollo/app/metadata';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { OpportunityDetailsComponent } from './opportunity-details.component';
import { OpportunityType } from '@apollo/app/services/opportunity';
import { RouterTestingModule } from '@angular/router/testing';
import { SlbAutocompleteModule } from '@slb-dls/angular-material/autocomplete';
import { durationDropdownValues } from './opportunity-details.constants';
import { mockMetadataService } from '../../../shared/services.mock';
import { provideMockStore } from '@ngrx/store/testing';

describe('OpportunityDetailsComponent', () => {
  let component: OpportunityDetailsComponent;
  let fixture: ComponentFixture<OpportunityDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OpportunityDetailsComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule,
        MatSelectModule,
        MatFormFieldModule,
        MatInputModule,
        NoopAnimationsModule,
        SlbAutocompleteModule,
        ApolloFormPatcherModule
      ],
      providers: [
        {
          provide: MetadataService,
          useValue: mockMetadataService
        },
        provideMockStore({
          selectors: [
            {
              selector: opportunitySelectors.selectOpportunity,
              value: {
                opportunityId: '123',
                opportunityName: 'test',
                opportunityType: 'test',
                countries: ['Test'],
                phase: ['test'],
                offerStartDate: '2022-08-25T00:00:00+05:30'
              }
            }
          ]
        })
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OpportunityDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should trigger form valid change', (done) => {
    component.formIsValid.subscribe((value) => {
      expect(value).toBeFalsy();
      done();
    });
    component.opportunityDetails.patchValue({
      countries: 'test',
      phase: null,
      assetType: null,
      offerType: null,
      contractType: null,
      deliveryType: null,
      offerStartDate: 'testdate',
      offerEndDate: 'testDate',
      dateRange: 'testDate'
    });
  });

  it('should trigger equality check', (done) => {
    const changedValue = 'Test 1';
    let val = true;
    component.isOpportunityDetailsFormDirty.subscribe((value) => {
      val = value;
    });

    component.opportunityDetails.patchValue({
      opportunityName: changedValue
    });

    expect(val).toBeFalsy();
    done();
  });

  it('should trigger value change opportunity', (done) => {
    const newValue = 'assetType1';
    component.opportunityDetailsChanged.subscribe((value) => {
      expect(value.assetType).toBe(newValue);
      done();
    });

    component.opportunityDetails.patchValue({
      assetType: newValue
    });
  });
  it('should trigger date change selection, disable the end date', () => {
    component.opportunityDetails.patchValue({
      offerStartDate: moment('2022-08-25T00:00:00+05:30'),
      offerEndDate: moment('2022-08-28T00:00:00+05:30'),
      duration: { viewText: '3 months', value: 90 }
    });
    component.dateSelected('startDate', moment('2022-08-25T00:00:00+05:30'));
    expect(component.opportunityDetails.get('offerEndDate').disabled).toBeTruthy();
  });

  it('should trigger date change selection, end date selected, End date is undefined', () => {
    component.opportunityDetails.patchValue({
      offerStartDate: moment('2022-08-25T00:00:00+05:30').add(1, 'days').utc().format(),
      duration: { viewText: 'Custom', value: -1 },
      offerEndDate: undefined
    });
    component.dateSelected('startDate', moment('2022-08-29T00:00:00+05:30').endOf('day').utc().format());
    expect(component.opportunityDetails.get('offerEndDate').value).toEqual(
      moment('2022-08-27T00:00:00+05:30').endOf('day').utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]')
    );
  });

  it('should trigger date change selection, end date selected', () => {
    component.opportunityDetails.patchValue({
      offerStartDate: moment().utc(),
      offerEndDate: moment().endOf('day').utc().add(1, 'days'),
      duration: { viewText: 'Custom', value: -1 }
    });
    component.dateSelected('endDate', moment().endOf('day').utc().format());
    expect(component.opportunityDetails.get('offerEndDate').value).toEqual(
      moment().endOf('day').utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]')
    );
  });

  it('should trigger duration dropdown change, enable the end date 6 months value selected', () => {
    component.opportunityDetails.patchValue({
      offerStartDate: moment('2022-08-25T00:00:00+05:30'),
      offerEndDate: moment('2022-08-28T00:00:00+05:30'),
      duration: { viewText: '3 months', value: 90 }
    });
    component.durationChange({ value: { viewText: '6 months', value: 180 } });
    expect(component.opportunityDetails.get('offerEndDate').disabled).toBeTruthy();
  });

  it('should trigger duration dropdown change, enable the dropdown custom option', () => {
    component.opportunityDetails.patchValue({
      offerStartDate: moment('2022-08-25T00:00:00+05:30'),
      offerEndDate: moment('2022-08-28T00:00:00+05:30'),
      duration: { viewText: '3 months', value: 90 }
    });
    component.durationChange({ value: { viewText: 'Custom', value: -1 } });
    expect(component.opportunityDetails.get('offerEndDate').disabled).toBeFalsy();
  });

  it('should trigger setDurationInitialValue to set initial value as 90 days', () => {
    const opportunity = {
      opportunityId: '123',
      opportunityName: 'test',
      opportunityType: OpportunityType.Partial,
      countries: ['Test'],
      phase: ['test'],
      offerStartDate: '2022-09-24T00:00:00+05:30',
      offerEndDate: '2022-12-23T00:00:00+05:30'
    };
    const durationData = component.setDurationInitialValue(opportunity);
    expect(durationData).toEqual(durationDropdownValues[3]);
  });

  it('should trigger setDurationInitialValue to set initial value as Custom', () => {
    const opportunity = {
      opportunityId: '123',
      opportunityName: 'test',
      opportunityType: OpportunityType.Partial,
      countries: ['Test'],
      phase: ['test'],
      offerStartDate: '2022-08-25T00:00:00+05:30',
      offerEndDate: '2022-08-26T00:00:00+05:30'
    };
    const durationData = component.setDurationInitialValue(opportunity);
    expect(durationData).toEqual(durationDropdownValues[4]);
  });

  it('should trigger setDurationInitialValue to set initial value as Unlimited during edit flow', () => {
    const opportunity = {
      opportunityId: '123',
      opportunityName: 'test',
      opportunityType: OpportunityType.Partial,
      countries: ['Test'],
      phase: ['test'],
      offerStartDate: '',
      offerEndDate: ''
    };
    const durationData = component.setDurationInitialValue(opportunity);
    expect(durationData).toEqual(durationDropdownValues[0]);
  });
});
