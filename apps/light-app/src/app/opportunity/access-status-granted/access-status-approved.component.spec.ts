import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessStatusApprovedComponent } from './access-status-approved.component';

describe('AccessStatusPendingComponent', () => {
  let component: AccessStatusApprovedComponent;
  let fixture: ComponentFixture<AccessStatusApprovedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AccessStatusApprovedComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccessStatusApprovedComponent);
    component = fixture.componentInstance;
    component.vdrSubscriptionInfo = {
      requestedOn: '2022-05-02T10:08:56.230Z'
    } as any;
    component.opportunityVdrDetails = {
      departmentName: 'dept-name',
      accountName: 'accnt-name'
    } as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
