import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Store } from '@ngrx/store';
import { GisMapLargeService } from '@slb-innersource/gis-canvas';
import { uniq } from 'lodash';
import { Subscription } from 'rxjs';
import * as opportunityPanelActions from '../state/actions/opportunity-panel.actions';

@Component({
  selector: 'apollo-layer-filter',
  templateUrl: './layer-filter.component.html',
  styleUrls: ['./layer-filter.component.scss']
})
export class LayerFilterComponent implements OnInit, OnDestroy {
  @Output() isfilterChanged: EventEmitter<boolean> = new EventEmitter<boolean>();
  subscription: Subscription = new Subscription();
  selectedLayers = new FormControl();
  items = [];
  filterChanged = false;
  itemSelected = false;

  constructor(private mapLargeService: GisMapLargeService, public readonly store: Store) {}

  ngOnInit() {
    uniq(this.mapLargeService.map.layers).map((layer) => {
      if (layer['originalOptions'].visible) {
        this.items.push({['value']: layer['originalTableName'].split('/')[1], ['viewText']: (layer['entityType'] ?? layer['originalTableName'].split('/')[1]) === "Opportunity" ? "Asset": (layer['entityType'] ?? layer['originalTableName'].split('/')[1])});
      }
    });
    this.items.sort((a, b) => (a.viewText > b.viewText ? 1 : -1));
    const layers = this.items.map((layer) => layer.value)
    this.store.dispatch(opportunityPanelActions.setLayers({ selectedLayers: layers, filterSelected: this.itemSelected }));

    this.subscription.add(
      this.selectedLayers.valueChanges.pipe().subscribe((value) => {
        if (value.length) {
          this.itemSelected = true;
        }
        if (!value.length) {
          this.itemSelected = false;
          value = layers;
        }
        if (this.items.length) {
          this.isfilterChanged.emit(!this.itemSelected);
        }
        this.store.dispatch(opportunityPanelActions.setSelectedLayers({ selectedLayers: value, filterSelected: this.itemSelected }));
        uniq(this.mapLargeService.map.layers).forEach((layer: any) => {
          if (value.indexOf(layer['originalTableName'].split('/')[1]) < 0) {
            layer.hide();
          } else {
            layer.show();
          }
        });
      })
    );
  }

  clearFilter() {
    this.selectedLayers.setValue([]);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
