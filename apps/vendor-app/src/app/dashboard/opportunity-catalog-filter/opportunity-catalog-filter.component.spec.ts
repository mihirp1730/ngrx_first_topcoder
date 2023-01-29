import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { MetadataService } from '@apollo/app/metadata';
import { Store } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { of, take } from 'rxjs';

import { mockMetadataService } from '../../shared/services.mock';
import { OpportunityCatalogFilterComponent } from './opportunity-catalog-filter.component';

class MockMatOption {
  constructor(private value: string, private label: string, private selected = false) {}
  select = () => (this.selected = true);
  deselect = () => (this.selected = false);
}
describe('OpportunityCatalogFilterComponent', () => {
  let component: OpportunityCatalogFilterComponent;
  let fixture: ComponentFixture<OpportunityCatalogFilterComponent>;
  let mockStore: MockStore;
  let metadataService: MetadataService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OpportunityCatalogFilterComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore(),
        {
          provide: MetadataService,
          useValue: mockMetadataService
        },
        FormBuilder
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OpportunityCatalogFilterComponent);
    mockStore = TestBed.inject(Store) as MockStore;
    metadataService = TestBed.inject(MetadataService);
    component = fixture.componentInstance;
    fixture.detectChanges();

    jest.spyOn(mockStore, 'dispatch').mockReturnValue();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('setFormListeners', () => {
    it('should dispatch filters', fakeAsync(() => {
      component.opportunityNames = ['test'];
      const spy = jest.spyOn(mockStore, 'dispatch').mockImplementation();
      const newFormValue = {
        opportunityName: 'test',
        assetType: ['assetType 1'],
        offerType: ['offer type 1'],
        deliveryType: ['deliveryType 1'],
        status: ['status 1']
      };
      (component as any).setFormListeners();
      jest.spyOn(mockStore, 'dispatch').mockImplementation();
      component.filtersForm.patchValue(newFormValue);
      tick(300);

      expect(spy).toHaveBeenCalled();
    }));
  });

  describe('populateFilters', () => {
    it('should set assetTypesFilter and offerType Filter observables', async () => {
      const assetTypeFilter = ['Wind', 'Solar'];
      const offerTypeFilter = ['Farm-in', 'Direct Negotiation'];

      metadataService.assetTypesMetadata$ = of(assetTypeFilter);
      metadataService.offerTypesMetadata$ = of(offerTypeFilter);
      component.populateFilters();
      const assetTypeVal = await component.assetTypeFilter$.pipe(take(1)).toPromise();
      const offerTypeVal = await component.offerTypeFilter$.pipe(take(1)).toPromise();
      expect(assetTypeVal).toEqual(
        assetTypeFilter.sort().map((item) => ({
          viewText: item,
          value: item
        }))
      );
      expect(offerTypeVal).toEqual(
        offerTypeFilter.sort().map((item) => ({
          viewText: item,
          value: item
        }))
      );
    });
  });

  describe('toggleAllSelection', () => {
    it('should select all asset options', () => {
      component.allSelectedAsset = false;
      component.selectAsset.options = [new MockMatOption('Wind', 'Wind'), new MockMatOption('Solar', 'Solar')] as any;
      component.toggleAllSelection('assetType');
      expect((component.selectAsset.options as any).every((option) => option.selected)).toBeTruthy();
    });
    it('should select all offer type options', () => {
      component.allSelectedOfferType = false;
      component.selectOfferType.options = [
        new MockMatOption('Farm-in', 'Farm-in'),
        new MockMatOption('Direct Negotiation', 'Direct Negotiation')
      ] as any;
      component.toggleAllSelection('offerType');
      expect((component.selectOfferType.options as any).every((option) => option.selected)).toBeTruthy();
    });
    it('should select all deliver type options', () => {
      component.allSelectedDeliveryType = false;
      component.selectDeliveryType.options = [new MockMatOption('VDR', 'VDR'), new MockMatOption('DDR', 'DDR')] as any;
      component.toggleAllSelection('deliveryType');
      expect((component.selectDeliveryType.options as any).every((option) => option.selected)).toBeTruthy();
    });
    it('should select all status type options', () => {
      component.allSelectedStatus = false;
      component.selectStatus.options = [
        new MockMatOption('Draft', 'Draft'),
        new MockMatOption('Published', 'Published'),
        new MockMatOption('Unpublished', 'Unpublished')
      ] as any;
      component.toggleAllSelection('status');
      expect((component.selectStatus.options as any).every((option) => option.selected)).toBeTruthy();
    });
  });

  describe('togglePerOne', () => {
    it('should deselect "all" option on asset filter', async () => {
      const assetTypeOptions = [
        new MockMatOption(null, 'All', true),
        new MockMatOption('Wind', 'Wind', true),
        new MockMatOption('Solar', 'Solar', true)
      ] as any;
      component.selectAsset.options = assetTypeOptions;
      component.allSelectAsset = assetTypeOptions[0];
      component.togglePerOne('assetType');
      expect(component.allSelectAsset.selected).toBeFalsy();
    });

    it('should select "all" option on asset filter when all others selected', async () => {
      const regionOptions = [
        new MockMatOption(null, 'All', false),
        new MockMatOption('Wind', 'Wind', true),
        new MockMatOption('Solar', 'Solar', true)
      ] as any;
      component.selectAsset.options = regionOptions;
      component.allSelectAsset = regionOptions[0];
      component.togglePerOne('assetType');
      expect(component.allSelectAsset.selected).toBeTruthy();
    });

    it('should deselect "all" option on offer types filter', async () => {
      const offerTypeOptions = [
        new MockMatOption(null, 'All', true),
        new MockMatOption('offer types 1', 'offer types 1', true),
        new MockMatOption('offer types 2', 'offer types 2', true)
      ] as any;
      component.selectOfferType.options = offerTypeOptions;
      component.allSelectOfferType = offerTypeOptions[0];
      component.togglePerOne('offerType');
      expect(component.allSelectAsset.selected).toBeFalsy();
    });
    it('should deselect "all" on delivery types filter', async () => {
      const deliveryTypeOptions = [
        new MockMatOption(null, 'All', true),
        new MockMatOption('delivery types 1', 'delivery types 1', true),
        new MockMatOption('delivery types 2', 'delivery types 2', true)
      ] as any;
      component.selectDeliveryType.options = deliveryTypeOptions;
      component.allSelectDeliveryType = deliveryTypeOptions[0];
      component.togglePerOne('deliveryType');
      expect(component.allSelectDeliveryType.selected).toBeFalsy();
    });

    it('should deselect "all" status on offer types filter', async () => {
      const statusOptions = [
        new MockMatOption(null, 'All', true),
        new MockMatOption('status types 1', 'status types 1', true),
        new MockMatOption('status types 2', 'status types 2', true)
      ] as any;
      component.selectStatus.options = statusOptions;
      component.allSelectStatus = statusOptions[0];
      component.togglePerOne('status');
      expect(component.allSelectStatus.selected).toBeFalsy();
    });
  });
});
