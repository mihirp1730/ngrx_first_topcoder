import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';

import { mockMatDialogData, mockMatDialogRefModal } from '../../../shared/services.mock';
import * as opportunitySelectors from '../../state/selectors/opportunity.selectors';
import { RejectRequestModalComponent } from './reject-request-modal.component';

describe('RejectRequestModalComponent', () => {
  let component: RejectRequestModalComponent;
  let fixture: ComponentFixture<RejectRequestModalComponent>;
  let mockStore: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RejectRequestModalComponent ],
      schemas: [ NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA ],
      providers: [
        {
          provide: MatDialogRef,
          useValue: mockMatDialogRefModal
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: mockMatDialogData
        },
        provideMockStore({
          selectors: [
            {
              selector: opportunitySelectors.selectIsLoadingWhileCreatingSubscription,
              value: true
            },
            {
              selector: opportunitySelectors.selectIsOpportunityRequestRejected,
              value: true
            }
          ]
        })
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RejectRequestModalComponent);
    mockStore = TestBed.inject(Store) as MockStore;
    component = fixture.componentInstance;
    component.data.item = {
      opportunityId: '123',
      opportunityName: 'test',
      accessLevels: ['vdr', 'confidential'],
      subscriptionRequestId: 'test'
    };
    component.requestApproval = new FormGroup({
      rejectionReason: new FormControl('', Validators.required)
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('rejectReason', () => {
    it('should reject', () => {
      component.requestApproval.get('rejectionReason').setValue('testing');
      const spy = jest.spyOn(mockStore, 'dispatch').mockImplementation();
      component.rejectRequest();
      expect(spy).toHaveBeenCalled();
    });
  });

});
