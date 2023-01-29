import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessStatusLockedComponent } from './access-status-locked.component';

describe('AccessStatusLockedComponent', () => {
  let component: AccessStatusLockedComponent;
  let fixture: ComponentFixture<AccessStatusLockedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AccessStatusLockedComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccessStatusLockedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
