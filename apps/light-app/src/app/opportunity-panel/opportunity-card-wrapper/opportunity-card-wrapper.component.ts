import * as opportunityPanelActions from '../state/actions/opportunity-panel.actions';
import * as opportunityPanelSelector from '../state/selectors/opportunity-panel.selectors';

import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Input, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { LassoTool, LassoToolsService } from '@apollo/app/lasso-tools';

import { LassoPersistenceService } from '@apollo/app/services/lasso-persistence';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { opportunitiesPageSize } from '../constants/opportunity-panel.constants';

@Component({
  selector: 'apollo-opportunity-card-wrapper',
  templateUrl: './opportunity-card-wrapper.component.html',
  styleUrls: ['./opportunity-card-wrapper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OpportunityCardWrapperComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChildren('theLastList', { read: ElementRef })
  theLastList: QueryList<ElementRef>;
  @Input() isOpportunityExpanded = false;
  @Input() isMapExpanded = false;
  subscriptions: Subscription = new Subscription();
  observer;

  isNextPageLoading$ = this.store.select(opportunityPanelSelector.selectLoader);
  isMapLoaded$ = this.store.select(opportunityPanelSelector.selectIsMapLoaded);
  getOpportunities$ = this.store.select(opportunityPanelSelector.selectFilteredOpportunities);
  allOpportunities$ = this.store.select(opportunityPanelSelector.selectOpportunities);
  isLassoSelected$ = this.store.select(opportunityPanelSelector.selectLassoArea);
  selectedLayers$ = this.store.select(opportunityPanelSelector.selectIsFilterSelected);
  totalOpportunities$ = this.store.select(opportunityPanelSelector.opportunitiesTotal);
  currentPage$ = this.store.select(opportunityPanelSelector.selectCurrentPageNumber);
  showLoader$ = this.store.select(opportunityPanelSelector.selectLoaderFlag);

  public totalPagesAvailable: number;
  public totalOppor = 0;
  public pageNumber = 1;
  opporData;
  paginationDisabled = false;
  isLayerSelected = false;
  totalPages: number;
  currentPage = 1;
  showLoader = false;
  pageSize = opportunitiesPageSize;

  constructor(public readonly store: Store,
    private lassoPersistenceService: LassoPersistenceService,
    private lassoToolsService: LassoToolsService) {}

  ngOnInit() {
    this.intersectionObserver();
    this.subscriptions.add(
      this.totalOpportunities$.subscribe((totalOppor) => {
        this.totalOppor = totalOppor;
        this.totalPagesAvailable =
          this.totalOppor % opportunitiesPageSize === 0
            ? this.totalOppor / opportunitiesPageSize
            : Math.round(this.totalOppor / opportunitiesPageSize) + 1;
      })
    );
    this.subscriptions.add(
      this.isLassoSelected$.subscribe((value) => {
        if (!value) {
          this.paginationDisabled = false;
        } else {
          this.paginationDisabled = true;
        }
      })
    );
    this.subscriptions.add(
      this.selectedLayers$.subscribe((value) => {
        this.isLayerSelected = value;
      })
    );
    this.currentPage$.subscribe((value) => {
      this.currentPage = value;
    });
  }

  ngAfterViewInit() {
    this.theLastList.changes.subscribe((d) => {
      if (d.last) {
        this.observer.observe(d.last.nativeElement);
      }
    });
  }

  getOpportunities() {
    this.store.dispatch(opportunityPanelActions.loadMoreOpportunities({ pageNumber: this.currentPage }));
  }

  intersectionObserver() {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5
    };

    this.observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        if (
          this.currentPage < this.totalPagesAvailable &&
          !this.paginationDisabled &&
          !this.isLayerSelected &&
          this.totalPagesAvailable > 1 && !this.isMapExpanded
        ) {
          this.currentPage++;
          this.getOpportunities();
        }
      }
    }, options);
  }

  public clearLassoSelection() {
    this.store.dispatch(opportunityPanelActions.setLassoSelection({ selectedLassoArea: '' }));
    this.store.dispatch(opportunityPanelActions.setGISMapClickSelection({ isShapeSelected: false }));
    this.lassoPersistenceService.clearLassoShape();
    this.lassoToolsService.updateCurrentLasso(LassoTool.NONE);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
