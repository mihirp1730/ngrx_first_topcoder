import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { OpportunityService } from '@apollo/app/services/opportunity';
import { SlbDatePickerRangeModule } from '@slb-dls/angular-material/date-range-picker';
import { SlbDropdownModule } from '@slb-dls/angular-material/dropdown';
import { of } from 'rxjs';
import * as moment from 'moment';

import { mockMatDialogData, mockMatDialogRefModal, mockOpportunityService } from '../shared/services.mock';
import { AddInviteUserModelComponent } from './add-invite-user-model.component';

describe('AddInviteUserModelComponent', () => {
  let component: AddInviteUserModelComponent;
  let fixture: ComponentFixture<AddInviteUserModelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddInviteUserModelComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        SlbDropdownModule,
        BrowserAnimationsModule,
        MatCheckboxModule,
        SlbDatePickerRangeModule,
        MatFormFieldModule,
        MatIconModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatInputModule,
        HttpClientTestingModule
      ],
      providers: [
        FormBuilder,
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
        }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddInviteUserModelComponent);
    component = fixture.componentInstance;
    component.addUserDetails = new FormGroup({
      userDetails: new FormArray([component.newUser()]),
      opportunityName: new FormControl(),
      confidentialInfo: new FormGroup({
        isChecked: new FormControl(),
        startDate: new FormControl(),
        endDate: new FormControl(),
        dateRange: new FormControl()
      }),
      vdrInfo: new FormGroup({
        isChecked: new FormControl(),
        startDate: new FormControl(),
        endDate: new FormControl()
      })
    });
    component.confidentialInfoDateRangeDisabled = true;
    component.vdrInfoDateRangeDisabled = true;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should new element in the formArray', () => {
    component.addUser();
    expect(component.addUserDetails.get('userDetails').value.length).toBe(2);
  });

  it('should remove element in the formArray', () => {
    component.addUser();
    component.addUser();
    component.removeUser(1);
    expect(component.addUserDetails.get('userDetails').value.length).toBe(2);
  });

  it('should toggle vdr disable button', () => {
    const evt = { checked: true, source: { value: !component.vdrInfoDateRangeDisabled } };
    component.onCheckboxChange(evt, 'vdrInfo');
    expect(component.vdrInfoDateRangeDisabled).toBe(false);
  });

  it('should toggle confidential disable button', () => {
    const evt = { checked: true, source: { value: !component.confidentialInfoDateRangeDisabled } };
    component.onCheckboxChange(evt, 'confidentialInfo');
    expect(component.confidentialInfoDateRangeDisabled).toBe(false);
  });

  it('should close modal', () => {
    component.closeModal();
    expect(component.dialogRef).toBeTruthy();
  });

  it('should set confidential Info startdate', () => {
    const startDate = moment(moment()).isSame(moment(), 'day') ? moment(new Date()) : moment(moment()).utc();
    const endDate = moment(startDate).add(1, 'days').utc();
    const evt = { startDate, endDate };
    const type = 'confidentialInfo';
    component.dateSelected(evt as any, type);
    expect(component.addUserDetails.get(`${type}.startDate`).value.utc().format('YYYY-MM-DD')).toStrictEqual(startDate.utc().format('YYYY-MM-DD'));
  });

  describe('isSubscriptionAvailable', () => {
    beforeEach(() => {
      const formControl = component.addUserDetails.get('userDetails') as FormArray;
      formControl.controls[0].get('attendeeId').setValue('test@test.com');
      component.data.item = [
        {
          attendeeId: 'test@test.com',
          opportunityId: 'test'
        }
      ];
    });
    it('should return email id validation', () => {
      component.addUserDetails.get('opportunityName').setValue({
        value: 'test',
        viewText: 'test'
      });
      expect(component.isSubscriptionAvailable('test@test.com', 0)).toBeTruthy();
    });

    it('should return false for else validation', () => {
      component.addUserDetails.get('opportunityName').setValue({
        value: 'jest',
        viewText: 'test'
      });
      expect(component.isSubscriptionAvailable('test@test.com', 0)).toBeFalsy();
    });
  });

  it("should generate payload", ()=> {
    const value = {"accessDetails": [], "attendeeDetails": [{"attendeeId": "", "companyName": "", "firstName": "", "lastName": ""}], "description": "", "opportunityId": "test"}
    component.addUserDetails.get('opportunityName').setValue({
      value: 'test',
      viewText: 'test'
    });
    component.generatePayload();
    expect(component.generatePayload()).toStrictEqual(value)
  })

  describe("accessLevelCheck", ()=> {
    it("should call accessCheck function", ()=> {
      const accessControl = component.addUserDetails.get('confidentialInfo');
      accessControl.patchValue({ isChecked: true, endDate: 'test' })
      expect(component.accessLevelCheck()).toBeTruthy();
    })
  });

  describe("save", ()=> {
    it("should call save function", ()=> {
      component.data.closeModal = of(true);
      component.addUserDetails.get('opportunityName').setValue({ value: 'test', viewText: 'test' });
      const formControl = component.addUserDetails.get('userDetails') as FormArray;
      formControl.controls[0].setValue({ attendeeId: 'test@test.com', firstName: 'first', lastName: 'last', companyName: 'company'});
      const accessControl = component.addUserDetails.get('confidentialInfo');
      accessControl.patchValue({ isChecked: true, endDate: 'test' });
      const spy = jest.spyOn(component.createSubscriptionClickEvent,'emit');
      component.save();
      expect(spy).toHaveBeenCalled();
    })
  }) 
});
