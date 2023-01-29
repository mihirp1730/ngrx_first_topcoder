import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { OpportunityService } from '@apollo/app/services/opportunity';
import { Store } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { mockMatDialogData, mockMatDialogRefModal, mockOpportunityService } from '../../../shared/services.mock';

import * as moment from 'moment';
import * as opportunitySelectors from '../../state/selectors/opportunity.selectors';
import { ApproveRequestModalComponent } from './approve-request-modal.component';

describe('ApproveRequestModalComponent', () => {
  let component: ApproveRequestModalComponent;
  let fixture: ComponentFixture<ApproveRequestModalComponent>;
  let mockStore: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ApproveRequestModalComponent],
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
              selector: opportunitySelectors.selectOpportunitySubscriptionId,
              value: 'test_123'
            }
          ]
        })
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApproveRequestModalComponent);
    mockStore = TestBed.inject(Store) as MockStore;
    component = fixture.componentInstance;
    component.data.item = {
      opportunityId: '123',
      opportunityName: 'test',
      accessLevels: ['vdr', 'confidential']
    };
    component.confidentialDateControl = new FormControl('', [Validators.required]);
    component.vdrDateControl = new FormControl('', [Validators.required]);

    component.requestApproval = new FormGroup({
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
      })
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('approve', () => {
    it('should approve', () => {
      component.confidentialDateControl.setValue('30-Mar-2022');
      component.vdrDateControl.setValue('30-Mar-2022');
      const spy = jest.spyOn(mockStore, 'dispatch').mockImplementation();
      component.approve();
      expect(spy).toHaveBeenCalled();
    });
    it('should trigger markAsTouch for confidentialDateControl', () => {
      const spy = jest.spyOn(component.confidentialDateControl, 'markAsTouched');
      component.requestApproval.get('confidentialInfo').patchValue({
        isChecked: true,
        startDate: 'test'
      });
      component.approve();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('levelCheckChange', () => {
    it('should set vdrInfoEndDateRequired as true', () => {
      const evt = { checked: true };
      const group = 'vdrInfo';
      component.levelCheckChange(evt as any, group);
      expect(component.vdrInfoDisabled).toBeFalsy();
    });

    it('should set confidentialInfoEndDateRequired as true', () => {
      const evt = { checked: true };
      const group = 'confInfo';
      component.levelCheckChange(evt as any, group);
      expect(component.confidentialInfoDisabled).toBeFalsy();
    });
  });

  describe('dateSelected', () => {
    it('should set confidential Info startdate', () => {
      const type = 'confidentialInfo';
      const componentValue = component.requestApproval.get(`${type}.startDate`);
      const startDate = moment(componentValue.value).isSame(moment(), 'day')
        ? moment(new Date()).utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]')
        : moment(component.requestApproval.get(`${type}.startDate`).value).utc();
      const endDate = moment(startDate).add(1, 'days').utc();
      const evt = { startDate, endDate };
      component.dateSelected(evt as any, type);
      expect(component.requestApproval.get(`${type}.startDate`).value.utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]')).toStrictEqual(
        moment(startDate).utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]')
      );
    });
  });
});
