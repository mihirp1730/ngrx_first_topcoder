import { Component, OnDestroy, OnInit } from '@angular/core';
import { IFilteredValues, IOpportunityRequest } from '@apollo/app/services/opportunity';
import { Store } from '@ngrx/store';
import { distinctUntilChanged, Subscription } from 'rxjs';

import * as opportunitySelectors from '../../state/selectors/opportunity.selectors';

@Component({
  selector: 'apollo-rejected-requests',
  templateUrl: './rejected-requests.component.html'
})
export class RejectedRequestsComponent implements OnInit, OnDestroy {
  public subscriptions = new Subscription();
  public opportunityNames: string[] = [];
  public showLoader = true;
  public tableData: IOpportunityRequest[];

  public filteredValues: IFilteredValues = { fullName: '', opportunityName: '', companyName: '' };
  public displayedColumns: string[] = ['requester', 'company', 'opportunity', 'requestedFor', 'requestedOn', 'rejectedOn'];
  public displayedColumnsClass = {
    requester: 'width-15',
    company: 'width-15',
    opportunity: 'width-18',
    requestedFor: 'width-20',
    requestedOn: 'width-18',
    rejectedOn: 'width-20'
  };

  constructor(public readonly store: Store) {}
  ngOnInit(): void {
    this.subscriptions.add(
      this.store
        .select(opportunitySelectors.selectRejectedOpportunityRequests)
        .pipe(distinctUntilChanged())
        .subscribe((rejectedRequests: IOpportunityRequest[]) => {
          let fullName;
          rejectedRequests = rejectedRequests.map((request) => {
            fullName = `${request.firstName} ${request.lastName}`;
            const levels = request.accessLevels.map((value) => {
              if (value.toLowerCase().search('confidential') > -1) {
                value = 'Details';
              }
              return value;
            });
            request = { ...request, accessLevels: [...levels].sort(), fullName };
            return request;
          });
          this.tableData = rejectedRequests;
          this.showLoader = false;
        })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
