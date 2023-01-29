import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AccessStatus, OpportunityService } from '@apollo/app/services/opportunity';
import { Store } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { isEqual } from 'lodash';

import * as moment from 'moment';
import { mockMatDialogData, mockMatDialogRefModal, mockOpportunityService } from '../../../shared/services.mock';
import * as opportunitySelectors from '../../state/selectors/opportunity.selectors';
import { ManageSubscriptionModalComponent } from './manage-subscription-modal.component';

describe('ManageSubscriptionModalComponent', () => {
  let component: ManageSubscriptionModalComponent;
  let fixture: ComponentFixture<ManageSubscriptionModalComponent>;
  let mockStore: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManageSubscriptionModalComponent],
      schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: MatDialogRef,
          useValue: mockMatDialogRefModal
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: mockMatDialogData
        },
        {
          provide: OpportunityService,
          useValue: mockOpportunityService
        },
        provideMockStore({
          selectors: [
            {
              selector: opportunitySelectors.selectIsSubscriptionUpdated,
              value: true
            }
          ]
        })
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageSubscriptionModalComponent);
    mockStore = TestBed.inject(Store) as MockStore;
    component = fixture.componentInstance;
    component.data.item = {
      opportunityId: '123',
      opportunityName: 'test',
      accessDetails: [
        {
          accessLevel: 'vdr',
          startDate: '2022-04-27T18:30:00.000Z',
          endDate: '2022-04-28T18:30:00.000Z'
        },
        {
          accessLevel: 'confidential_information',
          startDate: '2022-04-27T18:30:00.000Z',
          endDate: '2022-04-28T18:30:00.000Z'
        },
        {
          accessLevel: 'Other',
          startDate: '2022-04-27T18:30:00.000Z',
          endDate: '2022-04-28T18:30:00.000Z'
        },
        {
          startDate: '2022-04-27T18:30:00.000Z',
          endDate: '2022-04-28T18:30:00.000Z'
        }
      ]
    };
    component.confidentialDateControl = new FormControl('', [Validators.required]);
    component.vdrDateControl = new FormControl('', [Validators.required]);

    component.manageSubscriptionForm = new FormGroup({
      confidentialInfo: new FormGroup({
        isChecked: new FormControl(),
        startDate: new FormControl(),
        endDate: new FormControl(),
        dateRange: component.confidentialDateControl
      }),
      vdrInfo: new FormGroup({
        isChecked: new FormControl(),
        startDate: new FormControl(),
        endDate: new FormControl(),
        dateRange: component.vdrDateControl
      }),
      statusChangeComment: new FormControl()
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close modal when clicking cancel button', () => {
    component.closeModal();
    expect(component.dialogRef).toBeTruthy();
  });

  describe('save', () => {
    it('should save', () => {
      component.confidentialDateControl.setValue('30-Mar-2022');
      component.vdrDateControl.setValue('31-Mar-2022');
      component.manageSubscriptionForm.get('statusChangeComment').setValue('Comments');
      const spy = jest.spyOn(mockStore, 'dispatch').mockImplementation();
      component.save();
      expect(spy).toHaveBeenCalled();
    });

    it('should trigger markAsTouch for confidentialDateControl', () => {
      const spy = jest.spyOn(component.confidentialDateControl, 'markAsTouched');
      component.manageSubscriptionForm.get('confidentialInfo').patchValue({
        isChecked: true,
        startDate: 'test'
      });
      component.save();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('toggleChange', () => {
    it('should set confidentialInfoDateRangeDisabled as false', () => {
      const evt = { checked: true };
      const type = 'confidentialInfo';
      component.toggleChange(evt as any, type);
      expect(component.confidentialInfoDateRangeDisabled).toBeFalsy();
    });

    it('should set vdrInfoDateRangeDisabled  as false', () => {
      const evt = { checked: true };
      const type = 'vdrInfo';
      component.toggleChange(evt as any, type);
      expect(component.vdrInfoDateRangeDisabled).toBeFalsy();
    });

    it('should set confidentialInfoDateRangeDisabled as true', () => {
      const evt = { checked: false };
      const type = 'confidentialInfo';
      component.toggleChange(evt as any, type);
      expect(component.confidentialInfoDateRangeDisabled).toBeTruthy;
    });

    it('should set vdrInfoDateRangeDisabled  as true', () => {
      const evt = { checked: false };
      const type = 'vdrInfo';
      component.toggleChange(evt as any, type);
      expect(component.vdrInfoDateRangeDisabled).toBeTruthy();
    });
  });

  describe('valuesForMatching', () => {
    it('should check the equality of Old and New payload should return true', () => {
      const type = 'vdrInfo';
      const detailValues = {
        endDate: '2022-04-28T18:30:00.000Z',
        startDate: '2022-04-27T18:30:00.000Z',
        isChecked: true
      };
      const formValues = {
        startDate: component.manageSubscriptionForm.get(type).get('startDate').value,
        endDate: component.manageSubscriptionForm.get(type).get('endDate').value,
        isChecked: true
      };
      component.valuesForMatching(type, detailValues);
      expect(isEqual(detailValues, formValues)).toBeTruthy;
    });
  });

  describe('isValuesInPreviousState', () => {
    it('should checke the values and based on values return true/false', () => {
      const type = 'vdrInfo';
      let equalityResult: boolean;
      const typeInfoDetails = {
        endDate: '2022-04-28T18:30:00.000Z',
        startDate: '2022-04-27T18:30:00.000Z',
        status: 'APPROVED'
      };
      const formValues = {
        startDate: component.manageSubscriptionForm.get(type).get('startDate').value,
        endDate: component.manageSubscriptionForm.get(type).get('endDate').value,
        isChecked: true
      };
      const result = component.isValuesInPreviousState(type);
      if (typeInfoDetails === undefined && formValues.isChecked) {
        expect(result).toBeTruthy;
      } else if (typeInfoDetails === undefined && !formValues.isChecked) {
        expect(result).toBeFalsy;
      }

      if (formValues.isChecked !== (typeInfoDetails.status !== AccessStatus.Approved)) {
        if (equalityResult === false) {
          expect(result).toBeTruthy;
        } else {
          expect(result).toBeFalsy;
        }
      } else if (formValues.isChecked === (typeInfoDetails.status === AccessStatus.Approved)) {
        if (equalityResult === true) {
          expect(result).toBeFalsy;
        } else {
          expect(result).toBeTruthy;
        }
      }
      expect(result).toBeFalsy;
    });
  });

  describe('isValueChanged', () => {
    it('should checke the values changed based on response true/false', () => {
      const type = 'vdrInfo';
      let checkTheChangesForButton: boolean;
      if (checkTheChangesForButton === true) {
        if (component.manageSubscriptionForm.get(type).dirty && component.manageSubscriptionForm.get(`${type}.startDate`).pristine) {
          component.manageSubscriptionForm.get('statusChangeComment').enable({
            onlySelf: false,
            emitEvent: false
          });
          component.isSaveDisabled = false;
        }
      } else {
        component.manageSubscriptionForm.get('statusChangeComment').disable({
          onlySelf: false,
          emitEvent: false
        });
        component.isSaveDisabled = true;
      }
      const result = component.isValueChanged(type);
      expect(result).toBeTruthy;
    });
  });

  describe('dateSelected', () => {
    it('should set confidential Info startdate', () => {
      const type = 'confidentialInfo';
      const componentValue = component.manageSubscriptionForm.get(`${type}.startDate`);
      const startDate = moment(componentValue.value).isSame(moment(), 'day')
        ? moment(new Date()).utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]')
        : moment(component.manageSubscriptionForm.get(`${type}.startDate`).value).utc();
      const endDate = moment(startDate).add(1, 'days').utc();
      const evt = { startDate, endDate };
      component.dateSelected(evt as any, type);
      expect(component.manageSubscriptionForm.get(`${type}.startDate`).value.utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]')).toStrictEqual(
        moment(startDate).utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]')
      );
    });
  });
});
