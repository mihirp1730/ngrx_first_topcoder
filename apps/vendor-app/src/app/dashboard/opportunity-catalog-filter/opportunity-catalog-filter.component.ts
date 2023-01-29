import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { MetadataService } from '@apollo/app/metadata';
import { OpportunityStatus } from '@apollo/app/services/opportunity';
import { Store } from '@ngrx/store';
import { SlbDropdownOption } from '@slb-dls/angular-material/dropdown';
import { uniqBy } from 'lodash';
import { Observable, of } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';

import * as opportunityCatalogActions from '../state/actions/opportunity-catalog.actions';
import * as opportunityCatalogSelector from '../state/selectors/opportunity-catalog.selectors';

@Component({
  selector: 'apollo-opportunity-catalog-filter',
  templateUrl: './opportunity-catalog-filter.component.html',
  styleUrls: ['./opportunity-catalog-filter.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class OpportunityCatalogFilterComponent implements OnInit {
  allSelectedAsset = false;
  @ViewChild('selectAsset') public selectAsset: MatSelect;
  @ViewChild('allSelectAsset') public allSelectAsset: MatOption;

  allSelectedOfferType = false;
  @ViewChild('selectOfferType') public selectOfferType: MatSelect;
  @ViewChild('allSelectOfferType') public allSelectOfferType: MatOption;

  allSelectedDeliveryType = false;
  @ViewChild('selectDeliveryType') public selectDeliveryType: MatSelect;
  @ViewChild('allSelectDeliveryType') public allSelectDeliveryType: MatOption;

  allSelectedStatus = false;
  @ViewChild('selectStatus') public selectStatus: MatSelect;
  @ViewChild('allSelectStatus') public allSelectStatus: MatOption;

  notAvailableSelectedAsset = false;
  @ViewChild('notAvailableSelectAsset') public notAvailableSelectAsset: MatOption;

  notAvailableSelectedOfferType = false;
  @ViewChild('notAvailableSelectOfferType') public notAvailableSelectOfferType: MatOption;

  notAvailableSelectedDeliveryType = false;
  @ViewChild('notAvailableSelectDeliveryType') public notAvailableSelectDeliveryType: MatOption;

  filtersForm: FormGroup;
  opportunityList$ = this.store.select(opportunityCatalogSelector.selectOpportunities);
  assetTypeFilter$: Observable<SlbDropdownOption[]>;
  offerTypeFilter$: Observable<SlbDropdownOption[]>;
  deliveryFilter$: Observable<SlbDropdownOption[]>;
  statusFilter$: Observable<SlbDropdownOption[]>;
  opportunityNames: string[];

  constructor(private fb: FormBuilder, public readonly store: Store, private metadataService: MetadataService) {
    this.filtersForm = this.fb.group({
      opportunityName: [],
      assetType: [],
      offerType: [],
      deliveryType: [],
      status: []
    });
  }

  ngOnInit() {
    this.populateFilters();
    this.setFormListeners();
  }

  // populateFilters method will generate values in different filters
  populateFilters() {
    // Need to move this code to Selector and deduce
    this.opportunityList$.subscribe((res) => {
      this.opportunityNames = uniqBy(res, 'opportunityName')
        .map((item) => item.opportunityName)
        .sort();
    });

    this.assetTypeFilter$ = this.metadataService.assetTypesMetadata$.pipe(map(this.generateOptions));
    this.offerTypeFilter$ = this.metadataService.offerTypesMetadata$.pipe(map(this.generateOptions));
    this.deliveryFilter$ = this.metadataService.deliveryTypesMetadata$.pipe(map(this.generateOptions));
    this.statusFilter$ = of([OpportunityStatus.Draft, OpportunityStatus.Published, OpportunityStatus.Unpublished, OpportunityStatus.Expired]).pipe(
      map(this.generateOptions)
    );
  }

  generateOptions(response): SlbDropdownOption[] {
    response.sort();
    response.push(response.splice(response.indexOf('Other'), 1)[0]);
    return response.map((item) => ({
      value: item,
      viewText: item
    }));
  }

  setFormListeners(): void {
    this.filtersForm.valueChanges.pipe(debounceTime(300)).subscribe((filters) => {
      this.store.dispatch(opportunityCatalogActions.userChangesCatalogFilter(filters));
    });
  }

  toggleAllSelection(matSelect: string) {
    let allSelectFlag = false;
    let selectDynamic: MatSelect;
    switch (matSelect) {
      case 'assetType':
        allSelectFlag = !this.allSelectedAsset;
        this.allSelectedAsset = allSelectFlag;
        selectDynamic = this.selectAsset;
        break;
      case 'offerType':
        allSelectFlag = !this.allSelectedOfferType;
        this.allSelectedOfferType = allSelectFlag;
        selectDynamic = this.selectOfferType;
        break;
      case 'deliveryType':
        allSelectFlag = !this.allSelectedDeliveryType;
        this.allSelectedDeliveryType = allSelectFlag;
        selectDynamic = this.selectDeliveryType;
        break;
      case 'status':
        allSelectFlag = !this.allSelectedStatus;
        this.allSelectedStatus = allSelectFlag;
        selectDynamic = this.selectStatus;
        break;
    }
    selectDynamic.options.forEach((item: MatOption) => (allSelectFlag ? item.select() : item.deselect()));
  }

  togglePerOne(matSelect: string) {
    let selectDynamic: MatSelect;
    let allSelectDynamic: MatOption;

    switch (matSelect) {
      case 'assetType':
        selectDynamic = this.selectAsset;
        allSelectDynamic = this.allSelectAsset;
        break;
      case 'offerType':
        selectDynamic = this.selectOfferType;
        allSelectDynamic = this.allSelectOfferType;
        break;
      case 'deliveryType':
        selectDynamic = this.selectDeliveryType;
        allSelectDynamic = this.allSelectDeliveryType;
        break;
      case 'status':
        selectDynamic = this.selectStatus;
        allSelectDynamic = this.allSelectStatus;
        break;
    }

    if (allSelectDynamic.selected) {
      allSelectDynamic.deselect();
      return false;
    }

    const allOptions = selectDynamic.options.reduce((acc: number, { selected }): number => {
      if (selected) {
        acc += 1;
      }
      return acc;
    }, 1);

    if (selectDynamic.options.length == allOptions) {
      allSelectDynamic.select();
    }
  }
}
