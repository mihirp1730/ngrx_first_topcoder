import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { WindowRef } from '@apollo/app/ref';

import { mockMatDialogRefModal } from '../../shared/services.mock';
import { VendorDashboardModalComponent } from './vendor-dashboard-modal.component';

const mockWindowRef = {
  nativeWindow: {
    location: {
      reload: jest.fn()
    }
  }
};

describe('VendorDashboardModalComponent', () => {
  let component: VendorDashboardModalComponent;
  let fixture: ComponentFixture<VendorDashboardModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [{
        provide: MatDialogRef,
        useValue: mockMatDialogRefModal
      },  {
        provide: WindowRef,
        useValue: mockWindowRef
      }],
      declarations: [ VendorDashboardModalComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VendorDashboardModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should reload on refresh button click', () => {
    component.refresh();
    expect(mockWindowRef.nativeWindow.location.reload).toHaveBeenCalled();
  });
});
