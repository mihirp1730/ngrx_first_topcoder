import { Component, OnDestroy, OnInit } from '@angular/core';
import { IFilteredValues, IOpportunityRequest } from '@apollo/app/services/opportunity';
import { Store } from '@ngrx/store';
import { distinctUntilChanged, Subscription } from 'rxjs';
import * as opportunitySelectors from '../../state/selectors/opportunity.selectors';

@Component({
  selector: 'apollo-approved-requests',
  templateUrl: './approved-requests.component.html'
})
export class ApprovedRequestsComponent implements OnInit, OnDestroy {
  public subscriptions = new Subscription();
  public showLoader = true;

  public filteredValues: IFilteredValues = { fullName: '', opportunityName: '', companyName: '' };

  public displayedColumns: string[] = [
    'requester',
    'company',
    'opportunity',
    'requestedFor',
    'requestedOn',
    'accessLevelsGranted',
    'approvedOn'
  ];
  public displayedColumnsClass = {
    requester: 'width-15',
    company: 'width-15',
    opportunity: 'width-18',
    requestedFor: 'width-15',
    requestedOn: 'width-12',
    actions: 'width-15'
  };
  public tableData;

  constructor(public readonly store: Store) {}
  ngOnInit(): void {
    this.subscriptions.add(
      this.store
        .select(opportunitySelectors.selectApprovedOpportunityRequests)
        .pipe(distinctUntilChanged())
        .subscribe((approvedRequests: IOpportunityRequest[]) => {
          let fullName;
          approvedRequests = approvedRequests.map((request) => {
            fullName = `${request.firstName} ${request.lastName}`;
            const levels = request.accessLevels.map((value) => {
              if (value.toLowerCase().search('confidential') > -1) {
                value = 'Details';
              }
              return value;
            });
            const accessLevelsGranted = request.accessDetails?.map((value) => {
              if (value.accessLevel.toLowerCase().search('confidential') > -1) {
                value = { ...value, accessLevel: 'Details' };
              }
              return value.accessLevel;
            });
            request = {
              ...request,
              accessLevels: [...levels].sort(),
              fullName,
              accessLevelsGranted: [...accessLevelsGranted]?.sort() ?? []
            };
            return request;
          });
          this.tableData = approvedRequests;
          this.showLoader = false;
        })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
