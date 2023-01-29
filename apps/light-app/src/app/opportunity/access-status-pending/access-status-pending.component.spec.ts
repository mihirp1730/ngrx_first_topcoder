import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessStatusPendingComponent } from './access-status-pending.component';

describe('AccessStatusPendingComponent', () => {
  let component: AccessStatusPendingComponent;
  let fixture: ComponentFixture<AccessStatusPendingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AccessStatusPendingComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccessStatusPendingComponent);
    component = fixture.componentInstance;
    component.vdrRequestInfo = {
      requestedOn: '2022-05-02T10:08:56.230Z'
    } as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
