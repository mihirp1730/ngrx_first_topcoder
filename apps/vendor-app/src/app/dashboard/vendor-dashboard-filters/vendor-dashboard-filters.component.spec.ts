import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { MetadataService } from '@apollo/app/metadata';
import { Store } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';
import { take } from 'rxjs/operators';
import { EStatus } from '../../shared/interfaces';

import { mockMetadataService } from '../../shared/services.mock';
import { VendorDashboardFiltersComponent } from './vendor-dashboard-filters.component';

class MockMatOption {
  constructor(private value: string, private label: string, private selected = false) {}
  select = () => this.selected = true;
  deselect = () => this.selected = false;
}

describe('VendorDashboardFiltersComponent', () => {
  let component: VendorDashboardFiltersComponent;
  let fixture: ComponentFixture<VendorDashboardFiltersComponent>;
  let metadataService: MetadataService;
  let mockStore: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VendorDashboardFiltersComponent],
      providers: [
        provideMockStore(),
        FormBuilder,
        {
          provide: MetadataService,
          useValue: mockMetadataService
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VendorDashboardFiltersComponent);
    metadataService = TestBed.inject(MetadataService);
    component = fixture.componentInstance;
    fixture.detectChanges();
    mockStore = TestBed.inject(Store) as MockStore;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('toggleAllSelection', () => {
    it('should select all region options', () => {
      component.allSelectedRegion = false;
      component.selectRegion.options = [
        new MockMatOption('region1', 'region1'),
        new MockMatOption('region2', 'region2')
      ] as any;
      component.toggleAllSelection('Region');
      expect((component.selectRegion.options as any).every(option => option.selected)).toBeTruthy();
    });
  
    it('should deselect all region options', () => {
      component.allSelectedRegion = true;
      component.selectRegion.options = [
        new MockMatOption('region1', 'region1', true),
        new MockMatOption('region2', 'region2', true)
      ] as any;
      component.toggleAllSelection('Region');
      expect((component.selectRegion.options as any).some(option => option.selected)).toBeFalsy();
    });
  
    it('should select all status options', () => {
      component.allSelectedStatus = false;
      component.selectStatus.options = [
        new MockMatOption(EStatus.Draft, 'Draft'),
        new MockMatOption(EStatus.Publishing, 'Publishing')
      ] as any;
      component.toggleAllSelection('Status');
      expect((component.selectStatus.options as any).every(option => option.selected)).toBeTruthy();
    });
  
    it('should deselect all status options', () => {
      component.allSelectedStatus = true;
      component.selectStatus.options = [
        new MockMatOption(EStatus.Draft, 'Draft', true),
        new MockMatOption(EStatus.Publishing, 'Publishing', true)
      ] as any;
      component.toggleAllSelection('Status');
      expect((component.selectStatus.options as any).some(option => option.selected)).toBeFalsy();
    });

   it('should select all dataType options', () => {
      component.allDataTypesSelected = false;
      component.dataTypesSelect.options = [
        new MockMatOption('Well', 'Well'),
        new MockMatOption('Survey3d', 'Survey3d')
      ] as any;
      component.toggleAllSelection('DataType');
      expect((component.dataTypesSelect.options as any).every(option => option.selected)).toBeTruthy();
    });
  
    it('should deselect all dataType options', () => {
      component.allDataTypesSelected = true;
      component.dataTypesSelect.options = [
        new MockMatOption('Well', 'Well', true),
        new MockMatOption('Survey3d', 'Survey3d', true)
      ] as any;
      component.toggleAllSelection('DataType');
      expect((component.dataTypesSelect.options as any).some(option => option.selected)).toBeFalsy();
    });
  });

  describe('togglePerOne', () => {

    it('should deselect "all" option on region filter', async () => {
      const regionOptions = [
        new MockMatOption(null, 'All', true),
        new MockMatOption('Asia', 'Asia', true),
        new MockMatOption('Africa', 'Africa', true)
      ] as any;
      component.selectRegion.options = regionOptions;
      component.allSelectRegion = regionOptions[0];
      component.togglePerOne('Region');
      expect(component.allSelectRegion.selected).toBeFalsy();
    });

    it('should select "all" option on region filter when all others selected', async () => {
      const regionOptions = [
        new MockMatOption(null, 'All', false),
        new MockMatOption('Asia', 'Asia', true),
        new MockMatOption('Africa', 'Africa', true)
      ] as any;
      component.selectRegion.options = regionOptions;
      component.allSelectRegion = regionOptions[0];
      component.togglePerOne('Region');
      expect(component.allSelectRegion.selected).toBeTruthy();
    });

    it('should deselect "all" option on status filter', () => {
      const statusOptions = [
        new MockMatOption(null, 'All', true),
        new MockMatOption(EStatus.Draft, 'Draft', true),
        new MockMatOption(EStatus.Publishing, 'Publishing', true)
      ] as any;
      component.selectStatus.options = statusOptions;
      component.allSelectStatus = statusOptions[0];
      component.togglePerOne('Status');
      expect(component.allSelectStatus.selected).toBeFalsy();
    });

    it('should select "all" option on status filter when all others selected', async () => {
      const statusOptions = [
        new MockMatOption(null, 'All', false),
        new MockMatOption(EStatus.Draft, 'Draft', true),
        new MockMatOption(EStatus.Publishing, 'Publishing', true)
      ] as any;
      component.selectStatus.options = statusOptions;
      component.allSelectStatus = statusOptions[0];
      component.togglePerOne('Status');
      expect(component.allSelectStatus.selected).toBeTruthy();
    });

    it('should deselect "all" option on dataType filter', () => {
      const dataTypeOptions = [
        new MockMatOption(null, 'All', true),
        new MockMatOption('Well', 'Well', true),
        new MockMatOption('Survey3d', 'Survey3d', true)
      ] as any;
      component.dataTypesSelect.options = dataTypeOptions;
      component.allDataTypesSelect = dataTypeOptions[0];
      component.togglePerOne('DataType');
      expect(component.allDataTypesSelect.selected).toBeFalsy();
    });

    it('should select "all" option on dataType filter when all others selected', async () => {
      const dataTypeOptions = [
        new MockMatOption(null, 'All', false),
        new MockMatOption('Well', 'Well', true),
        new MockMatOption('Survey3d', 'Survey3d', true)
      ] as any;
      component.dataTypesSelect.options = dataTypeOptions;
      component.allDataTypesSelect = dataTypeOptions[0];
      component.togglePerOne('DataType');
      expect(component.allDataTypesSelect.selected).toBeTruthy();
    });  
    
  });

  describe('populateFilters', () => {
    it('should set region and dataTypes observables', async () => {
      const regions = ['Asia', 'Africa'];
      const metadata = [{name: 'A name', displaySequence: 4}, {name: 'B Name', displaySequence: 2}];
      const sortedMetadata = [...metadata]
        .sort((a, b) => (a.displaySequence > b.displaySequence) ? 1 : -1)
        .map(dataType => dataType.name);
      // jest.spyOn(metadataService, 'regions$', 'get').mockReturnValue(of(regions));
      (metadataService as any).regions$ = of(regions);
      (metadataService as any).metadata$ = of(metadata);
      (component as any).populateFilters();
      const regionsVal = await component.regionFilter$.pipe(take(1)).toPromise();
      const dataTypesVal = await component.dataTypes$.pipe(take(1)).toPromise();
      expect(regionsVal).toEqual(regions.sort()
        .map((item) => (
          {
            label: item,
            value: item
          }
        ))
      );
      expect(dataTypesVal).toEqual(sortedMetadata);
    });
  });

  describe('setFormListeners', () => {
    it('should emit new form value', fakeAsync(() => {
      const filterChangeSpy = jest.spyOn(component.filterChange, 'emit').mockImplementation();
      const newFormValue = {
        regions: ['Asia'],
        dataType: ['Well'],
        status: ['Draft']
      };
      (component as any).setFormListeners();
      jest.spyOn(mockStore, 'dispatch').mockImplementation();
      component.filtersForm.patchValue(newFormValue);
      tick(300);
      expect(filterChangeSpy).toHaveBeenCalledWith(newFormValue);
    }));
  });

});
