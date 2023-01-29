import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

import { SubscriptionFilterComponent } from './subscription-filter.component';

describe('SubscriptionFilterComponent', () => {
  let component: SubscriptionFilterComponent;
  let fixture: ComponentFixture<SubscriptionFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SubscriptionFilterComponent],
      imports: [NoopAnimationsModule, MatFormFieldModule, MatSelectModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubscriptionFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('search', () => {
    it('should emit the value after 1s', fakeAsync(() => {
      const searchEmitSpy = jest.spyOn(component.subscriptionSearch, 'emit').mockImplementation();
      component.onSearch('test-term');
      tick(1000);
      expect(searchEmitSpy).toHaveBeenCalledWith('test-term');
    }));
  });

  describe('filter', () => {
    it('should emit the filter value (All)', () => {
      const filterEmitSpy = jest.spyOn(component.filterChange, 'emit').mockImplementation();
      component.onFilterSelectionChange('test', 'All');
      expect(filterEmitSpy).toHaveBeenCalledWith({
        type: 'test',
        value: null
      });
    });

    it('should emit the filter value (Value)', () => {
      const filterEmitSpy = jest.spyOn(component.filterChange, 'emit').mockImplementation();
      component.onFilterSelectionChange('test', 'Value1');
      expect(filterEmitSpy).toHaveBeenCalledWith({
        type: 'test',
        value: 'Value1'
      });
    });
  });

  describe('filter', () => {
    it('should emit the sort value', () => {
      const sortEmitSpy = jest.spyOn(component.sort, 'emit').mockImplementation();
      component.onSort({ value: 'test-asc' });
      expect(sortEmitSpy).toHaveBeenCalledWith({
        field: 'test',
        order: 'asc'
      });
    });
  });
});
