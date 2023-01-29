import { Component, OnDestroy, OnInit } from '@angular/core';
import { FeatureFlagService, FeaturesEnum } from '@apollo/app/feature-flag';
import { Store } from '@ngrx/store';
import { ThemeService } from '@slb-dls/angular-material/core';
import { Subscription } from 'rxjs';

import { Themes } from '../../themes/theme.config';
import * as opportunityAttendeeActions from '../state/actions/opportunity-attendee.actions';
import * as opportunityAttendeeSelectors from '../state/selectors/opportunity-attendee.selectors';

@Component({
  selector: 'apollo-opportunity-requests-subscriptions',
  templateUrl: './opportunity-requests-subscriptions.component.html',
  styleUrls: ['./opportunity-requests-subscriptions.component.scss']
})
export class OpportunityRequestsSubscriptionsComponent implements OnInit, OnDestroy {
  opportunitySubscriptions$ = this.store.select(opportunityAttendeeSelectors.selectOpportunitySubscriptions);
  opportunityRequests$ = this.store.select(opportunityAttendeeSelectors.selectOpportunityRequests);
  showRequestLoader$ = this.store.select(opportunityAttendeeSelectors.selectShowRequestLoader);
  showSubscriptionLoader$ = this.store.select(opportunityAttendeeSelectors.selectShowSubscriptionLoader);
  subscription = new Subscription();
  isDataOpportunityWorkflow = false;

  constructor(private themeService: ThemeService, public readonly store: Store, public featureFlagService: FeatureFlagService) {
    this.themeService.switchTheme(Themes.Light);
  }

  ngOnInit(): void {
    this.subscription.add(
      this.featureFlagService.featureEnabled(FeaturesEnum.dataOpportunityWorkflow).subscribe((flag) => {
        if (flag) {
          this.isDataOpportunityWorkflow = true;
        }
      })
    );
    this.store.dispatch(opportunityAttendeeActions.getOpportunitySubscriptions());
    this.store.dispatch(opportunityAttendeeActions.getOpportunityRequests());
  }

  ngOnDestroy(): void {
    if (!this.isDataOpportunityWorkflow) {
      this.themeService.switchTheme(Themes.Dark);
    }
    this.subscription.unsubscribe();
  }
}
