import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { PackageModalCancelRequestComponent } from './package-modal-cancel-request.component';
import { mockMatDialogRefModal } from '../../shared/services.mock';

describe('SubscriptionContainerComponent', () => {
  let component: PackageModalCancelRequestComponent;
  let fixture: ComponentFixture<PackageModalCancelRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        {
          provide: MatDialogRef,
          useValue: mockMatDialogRefModal
        }
      ],
      declarations: [PackageModalCancelRequestComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PackageModalCancelRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close modal when clicking cancel button', () => {
    component.cancel();
    expect(component.dialogRef).toBeTruthy();
  });
});
