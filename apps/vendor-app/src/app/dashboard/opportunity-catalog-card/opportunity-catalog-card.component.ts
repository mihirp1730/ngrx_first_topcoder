import * as opportunityActions from '../../opportunity/state/actions/opportunity.actions';
import * as opportunityCatalogActions from '../state/actions/opportunity-catalog.actions';
import * as opportunityCatalogSelector from '../state/selectors/opportunity-catalog.selectors';
import * as opportunitySelectors from '../../opportunity/state/selectors/opportunity.selectors';

import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import {
  IOppSubscription,
  IOpportunity,
  IOpportunityRequest,
  IOpportunitySubscription,
  OpportunityStatus,
  OpportunityType
} from '@apollo/app/services/opportunity';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MessageService, SlbMessage, SlbSeverity } from '@slb-dls/angular-material/notification';
import { Subscription, filter, map } from 'rxjs';

import { AddInviteUserModelComponent } from '../../add-invite-user-model/add-invite-user-model.component';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

const NO_VALUE_ALT_TEXT = 'Not available';

@Component({
  selector: 'apollo-opportunity-catalog-card',
  templateUrl: './opportunity-catalog-card.component.html',
  styleUrls: ['./opportunity-catalog-card.component.scss'],
  providers: [MessageService]
})
export class OpportunityCatalogCardComponent implements OnInit, OnChanges, OnDestroy {
  readonly opportunityTypeEnum = OpportunityType;
  readonly opportunityStatusEnum = OpportunityStatus;
  public opportunitySubscriptions: IOppSubscription[] = [];
  showMedia$ = this.store.select(opportunityCatalogSelector.selectMedia);
  invitationSubscriptionsCreated$ = this.store
    .select(opportunityCatalogSelector.selectAttendeeSubscriptionsCreated)
    .pipe(map((value) => (value?.length > 0 ? true : false)));

  @Input() opportunityDetails: IOpportunity;
  imgPlaceHolderSrc = 'assets/images/no-image-placeholder-light.png';
  mediaUrl: string;
  signedUrl: string = this.imgPlaceHolderSrc;
  opportunityName: string;
  isPendingRequests: boolean;
  isApprovedRequests: boolean;
  isSubscribedViaInvitation: boolean;
  noValueAltText = NO_VALUE_ALT_TEXT;
  maxObjectsToShow = 6;

  subscriptions = new Subscription();

  constructor(public readonly store: Store, public dialog: MatDialog, private route: Router, public messageService: MessageService) {}

  public dataObjects = [];
  private warningMessages = {
    delete: {
      pendingAndApproved: `There are pending access requests and existing subscribers of this opportunity whose access was on hold while <b style="word-break: break-all;">"$$"</b> unpublished. They will permanently lose access if it is deleted and this action cannot be undone. Continue anyway?`,
      pendingOnly: `There are open pending request for opportunity <b style="word-break: break-all;">"$$"</b>. You will no longer be able to approve them once deleted. This action can't be undone. Continue anyway?`,
      approveOnly: `There are existing subscribers of this opportunity whose access was on hold while <b style="word-break: break-all;">"$$"</b> unpublished. They will permanently lose access if it is deleted and this action cannot be undone. Continue anyway?`,
      default: `If you Delete the <b style="word-break: break-all;">"$$"</b>, You will no longer be able to search or view it. This action can't be undone. Do you want to continue?`
    },
    unPublish: {
      pendingAndApproved: `There are pending access requests and existing subscribers of this opportunity who will lose access if <b style="word-break: break-all;">"$$"</b> is unpublished. Access will be resumed once the opportunity is published again. Do you want to continue?`,
      pendingOnly: `There are pending access requests for this opportunity -<b style="word-break: break-all;">"$$"</b>. Do you want to continue?`,
      approveOnly: `There are existing subscribers of this opportunity who will lose access if <b style="word-break: break-all;">"$$"</b> is unpublished. Access will be resumed once the opportunity is published again. Do you want to continue?`,
      default: `If you Unpublish the <b style="word-break: break-all;">"$$"</b>, consumers will no longer be able to search or view it. Do you want to continue?`
    }
  };

  ngOnInit(): void {
    this.subscriptions.add(
      this.store.select(opportunitySelectors.selectOpportunitySubscriptions).subscribe((subscriptions: IOppSubscription[]) => {
        subscriptions = subscriptions.map((item) => {
          item.accessDetails?.map((accessDetail) => {
            if (accessDetail?.accessLevel?.toLowerCase() === 'confidential_information') {
              item = { ...item, isConfInfo: true };
            } else if (accessDetail?.accessLevel?.toLowerCase() === 'vdr') {
              item = { ...item, isVDR: true };
            }
          });
          return item;
        });
        this.opportunitySubscriptions = subscriptions;
        this.isSubscribedViaInvitation =
          subscriptions
            .map((subscription: IOppSubscription) => {
              return subscription.opportunityId;
            })
            .filter((id) => this.opportunityDetails?.opportunityId === id).length > 0
            ? true
            : false;
      })
    );
    this.subscriptions.add(
      this.store.select(opportunitySelectors.selectPendingOpportunityRequests).subscribe((pendingRequests: IOpportunityRequest[]) => {
        this.isPendingRequests =
          pendingRequests
            .map((pendingRequest) => {
              return pendingRequest.opportunityId;
            })
            .filter((id) => this.opportunityDetails?.opportunityId === id).length > 0
            ? true
            : false;
      })
    );
    this.subscriptions.add(
      this.store.select(opportunitySelectors.selectApprovedOpportunityRequests).subscribe((approvedRequests: IOpportunityRequest[]) => {
        this.isApprovedRequests =
          approvedRequests
            .map((approvedRequest) => {
              return approvedRequest.opportunityId;
            })
            .filter((id) => this.opportunityDetails?.opportunityId === id).length > 0
            ? true
            : false;
      })
    );
  }

  ngOnChanges(simpleChanges: SimpleChanges) {
    if (simpleChanges?.opportunityDetails?.currentValue) {
      this.opportunityName = this.opportunityDetails.opportunityName || 'No Value!';
      this.dataObjects = this.opportunityDetails.dataObjects;

      this.subscriptions.add(
        this.showMedia$.pipe(filter((catalogMedia) => catalogMedia?.length > 0)).subscribe((catalogMedia) => {
          this.signedUrl =
            catalogMedia.find((mediaEle) => mediaEle.fileId == this.opportunityDetails?.opportunityProfile?.media[0]?.fileId)?.signedUrl ||
            this.imgPlaceHolderSrc;
        })
      );
    }
  }

  unPublishOpportunity(opportunityId: string) {
    const detail = this.getConfirmationMessage('unPublish');
    const confirmationUnPublish: SlbMessage = {
      severity: SlbSeverity.Warning,
      target: 'modal',
      summary: 'Unpublish Opportunity',
      detail: detail,
      asHtml: true,
      data: {
        opportunityId
      },
      config: {
        primaryAction: 'Yes',
        secondaryAction: 'No',
        primaryActionCallback: (data) => {
          this.confirmationForUnPublish(data.opportunityId);
        }
      }
    };
    this.messageService.add(confirmationUnPublish);
  }

  confirmationForUnPublish(id: string) {
    this.store.dispatch(opportunityCatalogActions.unPublishOpportunity({ id: id, isLoading: true }));
  }

  deleteOpportunity(opportunityId: string) {
    const detail = this.getConfirmationMessage('delete');
    const confirmationUnPublish: SlbMessage = {
      severity: SlbSeverity.Warning,
      target: 'modal',
      summary: 'Delete Opportunity',
      detail: detail,
      asHtml: true,
      data: {
        opportunityId
      },
      config: {
        primaryAction: 'Yes',
        secondaryAction: 'No',
        primaryActionCallback: (data) => {
          this.confirmationForDelete(data.opportunityId);
        }
      }
    };
    this.messageService.add(confirmationUnPublish);
  }

  confirmationForDelete(id: string) {
    this.store.dispatch(opportunityCatalogActions.deleteOpportunity({ id }));
  }

  inviteAttendees() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.panelClass = 'invite-attendees-modal-panel';
    dialogConfig.disableClose = true;
    dialogConfig.data = {
      component: 'invite_attendee',
      title: 'Invite Attendees',
      saveText: 'Send Invite',
      item: this.opportunitySubscriptions,
      opportunityName: this.opportunityDetails.opportunityName,
      opportunityId: this.opportunityDetails.opportunityId,
      confirmButtonText: 'Send Invites',
      cancelButtonText: 'Cancel',
      displayObject: true,
      closeModal: this.invitationSubscriptionsCreated$
    };
    const dialogRef = this.dialog.open(AddInviteUserModelComponent, dialogConfig);
    this.subscriptions.add(
      dialogRef.componentInstance.createSubscriptionClickEvent.subscribe((payload: IOpportunitySubscription) => {
        this.store.dispatch(opportunityCatalogActions.inviteAttendees({ opportunitySubscription: payload }));
      })
    );
    this.subscriptions.add(
      dialogRef.componentInstance.getSubscriptionsEvent.subscribe(() => {
        this.store.dispatch(opportunityActions.getOpportunitySubscriptions());
      })
    );
  }

  getConfirmationMessage(type) {
    let message;
    switch (type) {
      case 'delete':
        if (this.isPendingRequests && this.isApprovedOrInvitation()) {
          message = this.warningMessages.delete.pendingAndApproved;
        } else if (this.isPendingRequests) {
          message = this.warningMessages.delete.pendingOnly;
        } else if (this.isApprovedOrInvitation()) {
          message = this.warningMessages.delete.approveOnly;
        } else {
          message = this.warningMessages.delete.default;
        }
        break;
      case 'unPublish':
        if (this.isPendingRequests && this.isApprovedOrInvitation()) {
          message = this.warningMessages.unPublish.pendingAndApproved;
        } else if (this.isPendingRequests) {
          message = this.warningMessages.unPublish.pendingOnly;
        } else if (this.isApprovedOrInvitation()) {
          message = this.warningMessages.unPublish.approveOnly;
        } else {
          message = this.warningMessages.unPublish.default;
        }
        break;
    }
    return message.replace('$$', this.opportunityDetails?.opportunityName);
  }

  private isApprovedOrInvitation(): boolean {
    return this.isApprovedRequests || this.isSubscribedViaInvitation;
  }

  iconSelector(type: string) {
    switch (type) {
      case 'PUBLIC':
        return 'earth';
      case 'PRIVATE':
        return 'locked';
    }
  }

  editOpportunity() {
    this.route.navigateByUrl(`vendor/edit/${this.opportunityDetails.opportunityId}`);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
