import * as opportunityPanelActions from '../state/actions/opportunity-panel.actions';
import * as opportunityPanelSelector from '../state/selectors/opportunity-panel.selectors';

import { ChangeDetectionStrategy, Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';

import { GisHandlerService } from '../../map-wrapper/services/gis-handler.service';
import { LayerFilterComponent } from '../layer-filter/layer-filter.component';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { ThemeService } from '@slb-dls/angular-material/core';
import { Themes } from '../../themes/theme.config';

@Component({
  selector: 'apollo-opportunity-header',
  templateUrl: './opportunity-header.component.html',
  styleUrls: ['./opportunity-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OpportunityHeaderComponent implements OnInit, OnDestroy {
  @Output() filterChange = new EventEmitter<any>();

  @ViewChild(LayerFilterComponent)
  public layerFilterComponent: LayerFilterComponent;

  subscription: Subscription = new Subscription();

  public getOpportunities$ = this.store.select(opportunityPanelSelector.selectOpportunities);
  public filteredOpportunities$ = this.store.select(opportunityPanelSelector.selectFilteredOpportunities);
  public getSearchTerm$ = this.store.select(opportunityPanelSelector.selectSearchTerm);
  public isMapLoaded$ = this.store.select(opportunityPanelSelector.selectIsMapLoaded);
  public opportunityNameList;
  public dataObjectFilterChanged = false;

  constructor(private themeService: ThemeService, public readonly store: Store, public readonly gisHandlerService: GisHandlerService) {
    this.themeService.switchTheme(Themes.Light);
  }

  ngOnInit(): void {
    this.subscription.add(
      this.getOpportunities$.subscribe((opportunity) => {
        this.opportunityNameList = opportunity?.map((item) => {
          return item.opportunityName;
        });
      })
    );
  }

  onSearch(searchTerm: string): void {
    this.store.dispatch(opportunityPanelActions.setSelectedOpportunityId({ opportunityId: null }));
    this.store.dispatch(opportunityPanelActions.setSearchTerm({ searchTerm }));
    this.onFilterChange();
  }

  clearSearch(): void {
    this.store.dispatch(opportunityPanelActions.setSearchTerm({ searchTerm: '' }));
  }

  searchTermChange(searchTerm: string): void {
    if (searchTerm === '') {
      this.store.dispatch(opportunityPanelActions.setSearchTerm({ searchTerm: '' }));
      this.onFilterChange();
    }
  }

  onFilterChange() {
    const layer = this.gisHandlerService.gisLayerService.gisLayers.filter((layer) => layer.name === 'Opportunity')[0];
    const whereClause = [];
    this.getSearchTerm$.subscribe((value) => {
      if (value.length) {
        whereClause.push({
          col: '*',
          test: 'Contains',
          value
        });
      }
    });
    layer.filter.attributes.map((layers) => {
      if (layers.isFilterable && layers.values.length) {
        const selectedValues = this.checkValues(layers.values);
        if (selectedValues.length) {
          whereClause.push({
            col: layers.mapLargeAttribute,
            test: 'EqualAny',
            value: selectedValues.toString()
          });
        }
      }
    });

    this.store.dispatch(opportunityPanelActions.setLayerAttributes({ whereClause }));
    this.filterChange.emit(layer);
  }

  checkValues(values: any[]) {
    const selectedValues = [];
    values.map((item) => {
      if (item.selected === true) {
        selectedValues.push(item.name);
      }
    });
    return selectedValues;
  }

  clearDataObjectFilter() {
    this.layerFilterComponent.clearFilter();
  }

  detectDataObjectFilterChanged(filterValueChanged: boolean) {
    this.dataObjectFilterChanged = !filterValueChanged;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
