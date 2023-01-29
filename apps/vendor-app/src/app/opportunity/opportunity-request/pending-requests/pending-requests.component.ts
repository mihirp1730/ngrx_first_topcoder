import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { IFilteredValues, IOpportunityRequest } from '@apollo/app/services/opportunity';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';

import * as opportunitySelectors from '../../state/selectors/opportunity.selectors';
import { ApproveRequestModalComponent } from '../approve-request-modal/approve-request-modal.component';
import { RejectRequestModalComponent } from '../reject-request-modal/reject-request-modal.component';

@Component({
  selector: 'apollo-pending-requests',
  templateUrl: './pending-requests.component.html',
  encapsulation: ViewEncapsulation.None
})
export class PendingRequestsComponent implements OnInit, OnDestroy {
  public subscriptions = new Subscription();
  public tableData;
  public showLoader = true;
  public filteredValues: IFilteredValues = { fullName: '', opportunityName: '', companyName: '' };

  public displayedColumns: string[] = ['requester', 'company', 'opportunity', 'requestedFor', 'requestedOn', 'actions'];
  public displayedColumnsClass = {
    requester: 'width-15',
    company: 'width-15',
    opportunity: 'width-20',
    requestedFor: 'width-20',
    requestedOn: 'width-15',
    actions: 'width-20'
  };

  constructor(public readonly store: Store, public dialog: MatDialog) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.store.select(opportunitySelectors.selectPendingOpportunityRequests).subscribe((pendingRequests: IOpportunityRequest[]) => {
        let fullName;
        pendingRequests = pendingRequests.map((request) => {
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
        this.showLoader = false;
        this.tableData = pendingRequests;
      })
    );
  }

  approveRequest(item: IOpportunityRequest) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.panelClass = 'approve-request-modal-panel';
    dialogConfig.disableClose = true;
    dialogConfig.data = {
      item
    };
    this.dialog.open(ApproveRequestModalComponent, dialogConfig);
  }

  rejectRequest(item: IOpportunityRequest) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.panelClass = 'reject-request-modal-panel';
    dialogConfig.disableClose = true;
    dialogConfig.data = {
      item
    };
    this.dialog.open(RejectRequestModalComponent, dialogConfig);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
