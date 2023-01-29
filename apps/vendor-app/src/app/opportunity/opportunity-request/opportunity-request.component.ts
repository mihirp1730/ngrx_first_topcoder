import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Store } from '@ngrx/store';

import * as opportunityActions from '../state/actions/opportunity.actions';
import * as opportunitySelectors from '../state/selectors/opportunity.selectors';

@Component({
  selector: 'apollo-opportunity-request',
  templateUrl: './opportunity-request.component.html',
  styleUrls: ['./opportunity-request.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class OpportunityRequestComponent implements OnInit {
  pendingRequests$ = this.store.select(opportunitySelectors.selectPendingOpportunityRequests);
  approvedRequests$ = this.store.select(opportunitySelectors.selectApprovedOpportunityRequests);
  rejectedRequests$ = this.store.select(opportunitySelectors.selectRejectedOpportunityRequests);
  showLoader$ = this.store.select(opportunitySelectors.selectShowLoader);
  
  constructor(public readonly store: Store) { }

  ngOnInit(): void {
    this.store.dispatch(opportunityActions.getOpportunityRequestList());
  }
}
