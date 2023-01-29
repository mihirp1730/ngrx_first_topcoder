import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PackageCardComponent } from './package-card.component';

describe('PackageCardComponent', () => {
  let component: PackageCardComponent;
  let fixture: ComponentFixture<PackageCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PackageCardComponent],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PackageCardComponent);
    component = fixture.componentInstance;
    component.package = {
      id: '123-123',
      name: 'Test',
      vendor: 'Western Test',
      dataType: 'test',
      region: '',
      modifiedOn: new Date(),
      status: 'active',
      description: 'Test description'
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
