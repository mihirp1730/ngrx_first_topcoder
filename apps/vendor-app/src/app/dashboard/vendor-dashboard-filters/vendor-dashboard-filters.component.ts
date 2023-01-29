import { ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { MetadataService } from '@apollo/app/metadata';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { debounceTime, map, take } from 'rxjs/operators';

import { EStatus } from '../../shared/interfaces';
import * as dashboardActions from '../state/actions/dashboard.actions';

@Component({
  selector: 'apollo-vendor-dashboard-filter',
  templateUrl: './vendor-dashboard-filters.component.html',
  styleUrls: ['./vendor-dashboard-filters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VendorDashboardFiltersComponent implements OnInit {
  public filtersForm: FormGroup;
  public allSelectedRegion = false;
  public allSelectedStatus = false;
  public allDataTypesSelected = false;

  @ViewChild('selectRegion') public selectRegion: MatSelect;
  @ViewChild('selectStatus') public selectStatus: MatSelect;
  @ViewChild('allSelectRegion') public allSelectRegion: MatOption;
  @ViewChild('allSelectStatus') public allSelectStatus: MatOption;
  @ViewChild('dataTypesSelect') public dataTypesSelect: MatSelect;
  @ViewChild('allDataTypesSelect') public allDataTypesSelect: MatOption;
  @Output() filterChange: EventEmitter<any> = new EventEmitter<any>();

  public statusFilter: Array<any> = [
    { label: 'Draft', value: EStatus.Draft },
    { label: 'Publishing', value: EStatus.Publishing },
    { label: 'Published', value: EStatus.Published },
    { label: 'Unpublished', value: EStatus.Unpublished }
  ];

  public dataTypes$: Observable<string[]>;
  public regionFilter$: Observable<{ label: string; value: string }[]>;

  constructor(public readonly store: Store, private fb: FormBuilder, private metadataService: MetadataService) {
    this.filtersForm = this.fb.group({
      status: [],
      regions: [],
      dataType: []
    });
  }

  public async ngOnInit(): Promise<void> {
    this.populateFilters();
    this.setFormListeners();

    const regions = await this.regionFilter$
      .pipe(
        take(1),
        map((response) => {
          return response.map((v) => v.value);
        })
      )
      .toPromise();

    const dataTypes = await this.dataTypes$.pipe(take(1)).toPromise();

    const status = this.statusFilter.map((s) => s.value);

    this.filtersForm.patchValue(
      {
        regions: [0, ...regions],
        status: [0, ...status],
        dataType: [0, ...dataTypes]
      },
      { emitEvent: true }
    );
  }

  toggleAllSelection(matSelect: string) {
    let allSelectFlag = false;
    let selectDynamic: MatSelect;

    switch (matSelect) {
      case 'Status':
        allSelectFlag = !this.allSelectedStatus;
        this.allSelectedStatus = allSelectFlag;
        selectDynamic = this.selectStatus;
        break;
      case 'Region':
        allSelectFlag = !this.allSelectedRegion;
        this.allSelectedRegion = allSelectFlag;
        selectDynamic = this.selectRegion;
        break;
      case 'DataType':
        allSelectFlag = this.allDataTypesSelected = !this.allDataTypesSelected;
        selectDynamic = this.dataTypesSelect;
        break;
    }
    selectDynamic.options.forEach((item: MatOption) => (allSelectFlag ? item.select() : item.deselect()));
  }

  togglePerOne(matSelect: string) {
    let selectDynamic: MatSelect;
    let allSelectDynamic: MatOption;

    switch (matSelect) {
      case 'Status':
        selectDynamic = this.selectStatus;
        allSelectDynamic = this.allSelectStatus;
        break;
      case 'Region':
        selectDynamic = this.selectRegion;
        allSelectDynamic = this.allSelectRegion;
        break;
      case 'DataType':
        selectDynamic = this.dataTypesSelect;
        allSelectDynamic = this.allDataTypesSelect;
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

  private setFormListeners(): void {
    this.filtersForm.valueChanges.pipe(debounceTime(300)).subscribe((filters) => {
      this.store.dispatch(dashboardActions.userChangedFilters({ filters }));
      this.filterChange.emit(filters);
    });
  }

  private populateFilters(): void {
    this.regionFilter$ = this.metadataService.regions$.pipe(
      map((response) =>
        [...response].sort().map((item) => ({
          label: item,
          value: item
        }))
      )
    );
    this.dataTypes$ = this.metadataService.metadata$.pipe(
      map((dataTypes) => [...dataTypes].sort(this.sortByDisplaySequence)),
      map((dataTypes) => dataTypes.map((dataType) => dataType.name))
    );
  }

  private sortByDisplaySequence(dataTypeA, dataTypeB) {
    return dataTypeA.displaySequence > dataTypeB.displaySequence ? 1 : -1;
  }
}
