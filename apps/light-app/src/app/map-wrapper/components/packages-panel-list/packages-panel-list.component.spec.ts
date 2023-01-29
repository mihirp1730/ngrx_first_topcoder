import { ScrollingModule } from '@angular/cdk/scrolling';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { PackagesPanelListComponent } from './packages-panel-list.component';

describe('PackagesPanelListComponent', () => {
  let component: PackagesPanelListComponent;
  let fixture: ComponentFixture<PackagesPanelListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatProgressSpinnerModule, ScrollingModule],
      declarations: [PackagesPanelListComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PackagesPanelListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('packagesIds', () => {
    it('should set the loading value', () => {
      expect(component.loading).toBe(true);
      component.packagesIds = [];
      expect(component.loading).toBe(false);
    });
  });
});
