import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatMenuModule } from '@angular/material/menu';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { OpportunityService } from '@apollo/app/services/opportunity';
import { provideMockStore } from '@ngrx/store/testing';
import { SlbPaginationControlModule } from '@slb-dls/angular-material/pagination-control';

import { mockOpportunityService } from '../../../shared/services.mock';
import { RequestTableComponent } from './request-table.component';

describe('RejectedRequestsComponent', () => {
  let component: RequestTableComponent;
  let fixture: ComponentFixture<RequestTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RequestTableComponent],
      imports: [MatTableModule, MatSortModule, SlbPaginationControlModule, NoopAnimationsModule, MatMenuModule],
      providers: [
        {
          provide: OpportunityService,
          useValue: mockOpportunityService
        },
        provideMockStore()
      ],
      schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.displayedColumns = ['requester', 'company', 'opportunity', 'requestedFor', 'requestedOn', 'actions'];
    component.filteredValues = { fullName: '', opportunityName: '', companyName: '' };

    component.tableData = [
      {
        opportunityId: 'OP-VD8-9snp8j1d2l5e-136987399965',
        opportunityName: 'duplicate chat - V12',
        opportunityStatus: 'Published',
        status: 'Published',
        firstName: 'firstName',
        lastName: 'lastName',
        requestedOn: 'requestedOn',
        requestedBy: 'requestedBy',
        comment: 'comment',
        requestedFor: [],
        accessLevels: [],
        vendorId: 'vendorId',
        companyName: 'companyName'
      }
    ];
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should trigger value change requester name', (done) => {
    const newValue = 'Test 1';
    component.requesterName.valueChanges.subscribe((value) => {
      component.filteredValues.fullName = value;
      expect(value).toBe(newValue);
      done();
    });
    component.requesterName.setValue(newValue);
  });

  it('should trigger value change opportunity name', (done) => {
    const newValue = { value: 'Test', viewText: 'Test' };
    component.opportunityName.valueChanges.subscribe((name) => {
      component.filteredValues.opportunityName = name.value;
      expect(name.value).toBe(newValue.value);
      done();
    });
    component.opportunityName.setValue(newValue);
  });

  it('should trigger value change opportunity name to All', (done) => {
    const newValue = { value: 'All', viewText: 'All' };
    component.opportunityName.valueChanges.subscribe((name) => {
      expect(component.filteredValues.opportunityName).toBe('');
      done();
    });
    component.opportunityName.setValue(newValue);
  });

  it('should trigger value change Company name', (done) => {
    const newValue = { value: 'Test', viewText: 'Test' };
    component.companyName.valueChanges.subscribe((name) => {
      component.filteredValues.companyName = name.value;
      expect(name.value).toBe(newValue.value);
      done();
    });
    component.companyName.setValue(newValue);
  });

  it('should trigger value change Company name to All', (done) => {
    const newValue = { value: 'All', viewText: 'All' };
    component.companyName.valueChanges.subscribe((name) => {
      expect(component.filteredValues.companyName).toBe('');
      done();
    });
    component.companyName.setValue(newValue);
  });

  it('should trigger Reset the all values', (done) => {
    const newValue = { value: '', viewText: '' };
    component.companyName.setValue(newValue);
    component.opportunityName.setValue(newValue);
    component.requesterName.setValue('');
    component.reset();
    expect(component.filteredValues.companyName).toBe('');
    expect(component.filteredValues.opportunityName).toBe('');
    done();
  });

  it('should unsubscribe the subscription', () => {
    jest.spyOn(component.subscriptions, 'unsubscribe');
    component.ngOnDestroy();
    expect(component.subscriptions.unsubscribe).toHaveBeenCalled();
  });

  it('should trigger ngOnChange and update company name filter', () => {
    const change: any = {
      tableData: {
        currentValue: [
          {
            opportunityId: 'OP-VD8-9snp8j1d2l5e-136987399965',
            opportunityName: 'duplicate chat - V12',
            opportunityStatus: 'Published',
            status: 'Published',
            firstName: 'firstName',
            lastName: 'lastName',
            requestedOn: 'requestedOn',
            requestedBy: 'requestedBy',
            comment: 'comment',
            requestedFor: [],
            accessLevels: [],
            vendorId: 'vendorId',
            companyName: 'companyName'
          },
          {
            opportunityId: 'OP-VD8-9snp8j1d2l5e-136987399965',
            opportunityName: 'duplicate chat - V12',
            opportunityStatus: 'Published',
            status: 'Published',
            firstName: 'firstName',
            lastName: 'lastName',
            requestedOn: 'requestedOn',
            requestedBy: 'requestedBy',
            comment: 'comment',
            requestedFor: [],
            accessLevels: [],
            vendorId: 'vendorId',
            companyName: 'companyName'
          }
        ]
      }
    };
    component.ngOnChanges(change);
    component.setDataSourceAttributes();
    expect(component.companyNames.length).toBe(2);
    expect(component.dataSource.sort).toBeDefined();
  });

  it('should trigger ngOnChange, should not change company name filter', () => {
    const change: any = {};
    component.ngOnChanges(change);
    expect(component.companyNames.length).toBe(0);
  });

  it('should trigger ngOnChange, should not change company name filter', () => {
    component.ngOnChanges(undefined);
    expect(component.companyNames.length).toBe(0);
  });

  it('should trigger approveRequest callback event', () => {
    jest.spyOn(component.approveClickHandler, 'emit');
    component.approveRequest({
      opportunityId: 'OP-VD8-9snp8j1d2l5e-136987399965',
      opportunityName: 'duplicate chat - V12',
      opportunityStatus: 'Published',
      status: 'Published',
      firstName: 'firstName',
      lastName: 'lastName',
      requestedOn: 'requestedOn',
      requestedBy: 'requestedBy',
      comment: 'comment',
      requestedFor: [],
      accessLevels: [],
      vendorId: 'vendorId',
      companyName: 'companyName'
    });
    expect(component.approveClickHandler.emit).toHaveBeenCalled();
  });

  it('should trigger rejectRequest callback event', () => {
    jest.spyOn(component.rejectClickHandler, 'emit');
    component.rejectRequest({
      opportunityId: 'OP-VD8-9snp8j1d2l5e-136987399965',
      opportunityName: 'duplicate chat - V12',
      opportunityStatus: 'Published',
      status: 'Published',
      firstName: 'firstName',
      lastName: 'lastName',
      requestedOn: 'requestedOn',
      requestedBy: 'requestedBy',
      comment: 'comment',
      requestedFor: [],
      accessLevels: [],
      vendorId: 'vendorId',
      companyName: 'companyName'
    });
    expect(component.rejectClickHandler.emit).toHaveBeenCalled();
  });
});
