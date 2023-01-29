import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IOpportunityRequest } from '@apollo/app/services/opportunity';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';

import * as opportunityActions from '../../state/actions/opportunity.actions';
import * as opportunitySelectors from '../../state/selectors/opportunity.selectors';

@Component({
  selector: 'apollo-reject-request-modal',
  templateUrl: './reject-request-modal.component.html',
  styleUrls: ['./reject-request-modal.component.scss']
})
export class RejectRequestModalComponent implements OnInit, OnDestroy {
  public subscriptions = new Subscription();
  showLoader$ = this.store.select(opportunitySelectors.selectShowLoader);
  item: IOpportunityRequest;

  constructor(
    public dialogRef: MatDialogRef<RejectRequestModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public readonly store: Store
  ) { }

  requestApproval = new FormGroup({   
    rejectionReason: new FormControl('', [Validators.required, Validators.pattern('^[^ ]{1}.*')]),
  });
  
  ngOnInit(): void {
      this.item = this.data?.item;
  }
  
  closeModal() {
    this.dialogRef.close(true);
  }

  rejectRequest(): void {
    const payload = {
      rejectionReason: this.requestApproval.get('rejectionReason').value
    }
    this.store.dispatch(opportunityActions.rejectOpportunityRequest({ payload , subscriptionRequestId: this.item.subscriptionRequestId }));
    this.subscriptions.add(
      this.store.select(opportunitySelectors.selectIsOpportunityRequestRejected).subscribe((flag) => {
        if (flag) {
          this.closeModal();
          this.store.dispatch(opportunityActions.getOpportunitySubscriptions());
          this.store.dispatch(opportunityActions.getOpportunityRequestList());
        }
      })
    )
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}