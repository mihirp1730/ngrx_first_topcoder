import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { OpportunityService } from '@apollo/app/services/opportunity';
import { VendorAppService } from '@apollo/app/vendor';
import { provideMockStore } from '@ngrx/store/testing';
import { SlbPaginationControlModule } from '@slb-dls/angular-material/pagination-control';
import { of } from 'rxjs';

import { mockOpportunityService } from '../../shared/services.mock';
import * as opportunitySelectors from '../state/selectors/opportunity.selectors';
import { ManageAccessComponent } from './manage-access.component';

describe('ManageAccessComponent', () => {
  let component: ManageAccessComponent;
  let fixture: ComponentFixture<ManageAccessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManageAccessComponent],
      imports: [MatTableModule, MatSortModule, SlbPaginationControlModule, NoopAnimationsModule],
      providers: [
        {
          provide: OpportunityService,
          useValue: mockOpportunityService
        },
        provideMockStore({
          selectors: [
            {
              selector: opportunitySelectors.selectOpportunitySubscriptions,
              value: [
                {
                  opportunityId: 'test 1',
                  username: 'user 1',
                  opportunityStatus: 'Expired',
                  opportunityName: 'opp_name_1',
                  accessDetails: [
                    {
                      accessLevel: 'confidential_information'
                    },
                    {
                      accessLevel: 'xyz'
                    }
                  ]
                },
                {
                  opportunityId: 'test 2',
                  opportunityStatus: 'Unpublished',
                  username: 'user 2',
                  opportunityName: 'opp_name_2',
                  accessDetails: [
                    {
                      accessLevel: 'vdr'
                    }
                  ]
                },
                {
                  opportunityId: 'test 3',
                  username: 'user 2',
                  opportunityName: 'opp_name_2',
                  accessDetails: [
                    {
                      accessLevel: 'vdr'
                    }
                  ]
                }
              ]
            },
            {
              selector: opportunitySelectors.selectPublicPublishedOpportunities,
              value: [
                {
                  opportunityId: 'test 1',
                  opportunityName: 'test 1'
                }
              ]
            }
          ]
        }),
        {
          provide: MatDialog,
          useValue: {
            open: () => {
              return {
                componentInstance: {
                  createSubscriptionClickEvent: of({}),
                  getSubscriptionsEvent: of({})
                }
              };
            }
          }
        },
        {
          provide: VendorAppService,
          useValue: {
            dataVendors: [
              {
                dataVendorId: 'test_id',
                name: 'Test Data Vendor'
              }
            ]
          }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageAccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should trigger value change requester name', (done) => {
    const newValue = 'Test 1';
    component.userName.valueChanges.subscribe((value) => {
      component.filteredValues.fullName = value;
      expect(value).toBe(newValue);
      done();
    });
    component.userName.setValue(newValue);
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
    component.userName.setValue('');
    component.reset();
    expect(component.filteredValues.companyName).toBe('');
    expect(component.filteredValues.opportunityName).toBe('');
    done();
  });

  it('should open dialog', () => {
    component.manageAccess({} as any);
    expect(component.dialog).toBeTruthy();
  });

  it('should open add user dialog', () => {
    component.addUserModal();
    expect(component.dialog).toBeTruthy();
  });
});
