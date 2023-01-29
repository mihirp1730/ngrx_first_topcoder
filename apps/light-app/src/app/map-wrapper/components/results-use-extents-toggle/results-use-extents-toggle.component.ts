import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FeatureFlagService, FeaturesEnum } from '@apollo/app/feature-flag';
import { Store } from '@ngrx/store';

import * as mapWrapperActions from '../../state/actions/map-wrapper.actions';
import * as mapWrapperSelectors from '../../state/selectors/map-wrapper.selectors';

@Component({
  selector: 'apollo-results-use-extents-toggle',
  templateUrl: './results-use-extents-toggle.component.html',
  styleUrls: ['./results-use-extents-toggle.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResultsUseExtentsToggleComponent implements OnInit {
  useMapExtents$ = this.store.select(mapWrapperSelectors.selectUseMapExtents);
  isDataOpporWorkFlowEnabled: boolean;

  constructor(public readonly store: Store, private featureFlagService: FeatureFlagService) {}

  public resultsExtentsToggle() {
    this.store.dispatch(mapWrapperActions.toggleUseMapExtents({ dataOpportunityWorkflow: this.isDataOpporWorkFlowEnabled }));
  }

  ngOnInit(): void {
    this.featureFlagService.featureEnabled(FeaturesEnum.dataOpportunityWorkflow).subscribe((flag) => {
      this.isDataOpporWorkFlowEnabled = flag;
    });
  }
}
