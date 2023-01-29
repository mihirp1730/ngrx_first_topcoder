import * as opportunityActions from '../../opportunity/state/actions/opportunity.actions';
import * as opportunityCatalogActions from '../state/actions/opportunity-catalog.actions';
import * as opportunityCatalogSelector from '../state/selectors/opportunity-catalog.selectors';

import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { MediaDownload, MediaDownloadService } from '@apollo/app/services/media-download';
import { distinctUntilChanged, filter, take } from 'rxjs';

import { Store } from '@ngrx/store';

@Component({
  selector: 'apollo-opportunity-catalog',
  templateUrl: './opportunity-catalog.component.html',
  styleUrls: ['./opportunity-catalog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OpportunityCatalogComponent implements OnInit, OnDestroy {
  opportunityList$ = this.store.select(opportunityCatalogSelector.deduceOpportunities);
  selectDataObjectsFetched$ = this.store.select(opportunityCatalogSelector.selectDataObjectsFetched);
  showLoader$ = this.store.select(opportunityCatalogSelector.selectIsLoadingWhileGetting);
  private opporMediaField = [];

  constructor(public readonly store: Store, private mediaDownloadService: MediaDownloadService) {}

  ngOnInit() {
    //get opportunities API call
    this.store.dispatch(opportunityCatalogActions.getOpportunities({ isLoading: true }));
    this.store.dispatch(opportunityActions.getOpportunitySubscriptions());
    this.store.dispatch(opportunityActions.getOpportunityRequestList());

    this.store
      .select(opportunityCatalogSelector.selectOpportunities)
      .pipe(
        distinctUntilChanged(),
        filter((opporData) => opporData.length > 0),
        take(1)
      )
      .subscribe((opportunityDetails) => {
        opportunityDetails.forEach((opportunityDetail) => {
          const mediaField = opportunityDetail?.opportunityProfile?.media[0]?.fileId;
          mediaField && this.opporMediaField.push(mediaField);
        });

        this.mediaDownloadService.downloadMultipleMedia(this.opporMediaField).subscribe((signedUrls: MediaDownload[]) => {
          this.store.dispatch(opportunityCatalogActions.updateMedia({ catalogMedia: signedUrls }));
        });
      });
  }

  public trackBy(index: number): number {
    return index;
  }

  ngOnDestroy() {
    this.store.dispatch(opportunityCatalogActions.userLeavesCatalogPage());
  }
}
