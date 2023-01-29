import { Component } from '@angular/core';
import { Store } from '@ngrx/store';

import * as opportunityAttendeeActions from '../state/actions/opportunity-attendee.actions';
import * as opportunityAttendeeSelector from '../state/selectors/opportunity-attendee.selectors';

@Component({
  selector: 'apollo-opportunity-dashboard',
  templateUrl: './opportunity-dashboard.component.html',
  styleUrls: ['./opportunity-dashboard.component.scss']
})
export class OpportunityDashboardComponent {
  opportunityList$ = this.store.select(opportunityAttendeeSelector.selectOpportunities);
  showLoader$ = this.store.select(opportunityAttendeeSelector.selectIsLoading);

  constructor(public readonly store: Store) {}

  ngOnInit() {
    this.store.dispatch(opportunityAttendeeActions.getOpportunities());
  }
}
