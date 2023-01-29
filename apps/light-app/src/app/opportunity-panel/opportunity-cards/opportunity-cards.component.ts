import * as opportunityPanelActions from '../state/actions/opportunity-panel.actions';

import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';

import { MediaDownloadService } from '@apollo/app/services/media-download';
import { OpportunityPanelService } from '../services/opportunity-panel.service';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';

const NO_VALUE_ALT_TEXT = 'Not available';

@Component({
  selector: 'apollo-opportunity-cards',
  templateUrl: './opportunity-cards.component.html',
  styleUrls: ['./opportunity-cards.component.scss']
})
export class OpportunityCardsComponent implements OnDestroy, OnChanges {
  subscription = new Subscription();
  _cardInfo: any;

  @Input() set cardInfo(value) {
    this._cardInfo = { ...value };
  }

  public imgPlaceHolderSrc = 'assets/images/no-image-placeholder.png';
  public noValueAltText = NO_VALUE_ALT_TEXT;
  public signedUrl: string;
  public totalCount = 0;
  public maxObjectsToShow = 3;

  constructor(
    private mediaDownloadService: MediaDownloadService,
    public readonly store: Store,
    private opportunityPanelService: OpportunityPanelService
  ) {}

  ngOnChanges(simpleChanges: SimpleChanges) {
    const element = simpleChanges?.cardInfo?.currentValue;
    if (element?.dataObjects) {
      this._cardInfo.dataObjects = this.sortDataObjects(this._cardInfo.dataObjects);
    }
    if (element?.profileImage) {
      this.subscription.add(
        this.mediaDownloadService
          .downloadMedia(this._cardInfo.profileImage)
          .pipe()
          .subscribe((signedUrl: string) => {
            this.signedUrl = signedUrl;
          })
      );
    }
  }

  sortDataObjects(dataObjects) {
    return dataObjects?.slice().sort((a, b) => {
      return b.count - a.count;
    });
  }

  selectOpportunity() {
    this.store.dispatch(opportunityPanelActions.setSelectedOpportunityId({ opportunityId: this._cardInfo?.opportunityId }));
  }

  zoomToExtent(event: any) {
    event?.stopPropagation();
    this.opportunityPanelService.zoomToExtents(this._cardInfo?.opportunityId);
  }

  getTotalCount(startIndex = 0): number {
    let count = 0;
    this._cardInfo?.dataObjects.forEach((object, index) => {
      if (index >= startIndex) {
        count = count + object.count;
      }
    });
    this.totalCount = count;
    return this.totalCount;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
