import * as opportunityPanelActions from '../state/actions/opportunity-panel.actions';
import * as opportunityPanelSelector from '../state/selectors/opportunity-panel.selectors';

import { Component, Input, OnInit } from '@angular/core';

import { Store } from '@ngrx/store';

@Component({
  selector: 'apollo-opportunity-catalogue',
  templateUrl: './opportunity-catalogue.component.html',
  styleUrls: ['./opportunity-catalogue.component.scss']
})
export class OpportunityCatalogueComponent {
  selectedOpportunityId$ = this.store.select(opportunityPanelSelector.selectedOpportunityId);

  @Input() isOpportunityExpanded;
  @Input() isMapExpanded;
  public cards = [];

  constructor(public readonly store: Store) {}

  onCloseOpportunityDetails() {
    this.store.dispatch(opportunityPanelActions.setSelectedOpportunityId({ opportunityId: null }));
  }

  public toggleOpportunity() {
    this.isOpportunityExpanded = !this.isOpportunityExpanded;
  }
}
