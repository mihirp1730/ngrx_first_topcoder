import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { RenderableDocument } from '@apollo/app/components/documents';
import { FeatureFlagService, FeaturesEnum } from '@apollo/app/feature-flag';
import { DocumentRef, WindowRef } from '@apollo/app/ref';
import { MediaDocumentUploaderService } from '@apollo/app/services/media-document-uploader';
import { MediaDownloadService } from '@apollo/app/services/media-download';
import {
  ATTENDEE_FILE_DOWNLOAD_SERVICE,
  IAccessDetails,
  IOpportunitiesDetails,
  IOpportunityRequest,
  IOpportunitySubscription,
  IOpportunitySubscriptionRequestsPayload,
  OpportunityAttendeeService,
  opportunitySubscriptionStatus
} from '@apollo/app/services/opportunity-attendee';
import { OpportunityStatus } from '@apollo/app/services/opportunity';
import { NotificationService } from '@apollo/app/ui/notification';
import { Store } from '@ngrx/store';
import { ThemeService } from '@slb-dls/angular-material/core';
import * as moment from 'moment';
import { Observable, Subscription } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';

import { Themes } from '../../themes/theme.config';
import { accessLevelsName, accessStatus, tagForAccess } from '../opportunity-consumer.interface';
import * as opportunityAttendeeActions from '../state/actions/opportunity-attendee.actions';
import * as opportunityAttendeeSelector from '../state/selectors/opportunity-attendee.selectors';
import { RequestAccessModalComponent } from './../request-access-modal/request-access-modal.component';
import { IVendorProfile } from '@apollo/app/vendor';

@Component({
  selector: 'apollo-opportunity-details',
  templateUrl: './opportunity-details.component.html',
  styleUrls: ['./opportunity-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OpportunityDetailsComponent implements OnInit, OnDestroy {
  private _opportunityId;
  isRouteFlow: boolean;
  showTooltip = false;
  subscription = new Subscription();
  signedUrl: string;
  readonly opportunityStatusEnum = OpportunityStatus;
  @Input() isOpportunityExpanded;

  @Input()
  set opportunityId(opportunityId: string) {
    this._opportunityId = opportunityId;
    this.store.dispatch(opportunityAttendeeActions.getOpportunityById({ opportunityId }));
  }

  get opportunityId() {
    return this._opportunityId;
  }

  @Output() opportunityDetailsBack = new EventEmitter<void>();

  opportunity$: Observable<IOpportunitiesDetails>;
  showLoader$ = this.store.select(opportunityAttendeeSelector.selectIsLoading);
  renderableConfidentialDocuments$: Observable<RenderableDocument[]>;
  renderableOpenDocuments$: Observable<RenderableDocument[]>;
  opportunityRequest$: Observable<Array<IOpportunityRequest>>;
  opportunitiesDetails: IOpportunitiesDetails;
  requestDetails;
  profileAttributes;
  convertedValidatedDate;
  isRequestBtnDisabled = false;
  accessTag: string;
  isVDRDisabled = false;
  isCIDisabled = false;
  isDataOpportunityWorkflow = false;
  pendingCIStatus: string;
  approvedCIStatus: string;
  accessStatus = accessStatus;
  showMore = true;

  constructor(
    public readonly store: Store,
    public dialog: MatDialog,
    private mediaDocumentUploaderService: MediaDocumentUploaderService,
    private documentRef: DocumentRef,
    private windowRef: WindowRef,
    private themeService: ThemeService,
    public readonly opportunityAttendeeService: OpportunityAttendeeService,
    public readonly notificationService: NotificationService,
    private changeDetectorRef: ChangeDetectorRef,
    private route: ActivatedRoute,
    public readonly router: Router,
    private featureFlagService: FeatureFlagService,
    private mediaDownloadService: MediaDownloadService,
    @Inject(ATTENDEE_FILE_DOWNLOAD_SERVICE) private readonly contentServiceURL: string
  ) {
    this.themeService.switchTheme(Themes.Light);
  }

  ngOnInit() {
    this.subscription.add(
      this.featureFlagService.featureEnabled(FeaturesEnum.dataOpportunityWorkflow).subscribe((flag) => {
        if (flag) {
          this.isDataOpportunityWorkflow = true;
        }
      })
    );

    this.route.paramMap.subscribe((params) => {
      if (params.get('id')) {
        this.opportunityId = params.get('id');
        this.isRouteFlow = true;
      }
    });
    this.opportunity$ = this.store.select(opportunityAttendeeSelector.selectOpportunityById({ opportunityId: this.opportunityId })).pipe(
      map((details) => {
        this.profileAttributes = this.getOpportunityAttributes(details);
        this.checkRequest(details?.requests, details.opportunityId, details.subscriptions);
        this.downloadLogoSrc(details?.vendorProfile);
        return (this.opportunitiesDetails = details);
      })
    );
    this.renderableConfidentialDocuments$ = this.opportunity$.pipe(
      map((opportunity) => opportunity.confidentialOpportunityProfile.documents),
      map((documents) => {
        // We want to look up an actual image url, whenever that is available. Until then, use a placeholder:
        const imgUrl = '/assets/example-document-preview.png';
        return documents.map(({ caption, fileId, fileName, fileType }) => {
          return { caption, fileId, fileName, fileType, imgUrl };
        });
      })
    );
    this.renderableOpenDocuments$ = this.opportunity$.pipe(
      map((opportunity) => opportunity.opportunityProfile.documents),
      map((documents) => {
        // We want to look up an actual image url, whenever that is available. Until then, use a placeholder:
        const imgUrl = '/assets/example-document-preview.png';
        return documents.map(({ caption, fileId, fileName, fileType }) => {
          return { caption, fileId, fileName, fileType, imgUrl };
        });
      })
    );
    this.store
      .select(opportunityAttendeeSelector.selectOpportunityCIRequest({ opportunityId: this.opportunityId }))
      .pipe(
        tap((opportunityCIRequests) => {
          this.pendingCIStatus = opportunityCIRequests?.[0]?.requestStatus;
          this.requestDetails = opportunityCIRequests?.[0];
        })
      )
      .subscribe();

    this.store
      .select(opportunityAttendeeSelector.selectOpportunityCISubscription({ opportunityId: this.opportunityId }))
      .pipe(
        tap((opportunityCISubscription) => {
          const accessDetailInfo = opportunityCISubscription?.[0]?.accessDetails.filter((accessDetail) => {
            return accessDetail.status === opportunitySubscriptionStatus.Approved && accessDetail.accessLevel === accessLevelsName.CI;
          });
          this.approvedCIStatus = accessDetailInfo?.[0]?.status;
        })
      )
      .subscribe();
  }

  downloadLogoSrc(vendorProfile: IVendorProfile) {
    this.mediaDownloadService.downloadLogoImageSrc(vendorProfile).subscribe((signedUrl: string) => {
      this.signedUrl = signedUrl;
    });
  }

  checkRequest(requests, oppId, subscriptions) {
    const accessRequestTypesData: any = {};
    const accessSubscriptionsTypeData: any = {};
    const accessLevelTypes = [accessLevelsName.CI, accessLevelsName.VDR];
    const filteredRequests = requests.filter((request: IOpportunityRequest) => request.opportunityId === oppId);
    const filteredSubscriptions = subscriptions.filter((subscription: IOpportunitySubscription) => subscription.opportunityId === oppId);
    accessLevelTypes.forEach((accessLevelType) => {
      let isSubscribed = false;
      let isSubscribedVDR = false;
      filteredSubscriptions.filter((subscription: IOpportunitySubscription) => {
        filteredRequests.filter((request: IOpportunityRequest) => {
          isSubscribed = subscription.subscriptionRequestIds.indexOf(request.subscriptionRequestId) > -1;
          isSubscribedVDR = accessLevelType === accessLevelsName.VDR ?? isSubscribedVDR;
          if (!isSubscribed) {
            this.filteredRequestFunction(filteredRequests, accessRequestTypesData, accessLevelType);
          }
        });
      });
      filteredSubscriptions.forEach((subscription: IOpportunitySubscription) => {
        subscription.accessDetails.forEach((accessDetail: IAccessDetails) => {
          if (accessDetail.accessLevel === accessLevelType && accessDetail.status?.toLowerCase() === accessStatus.Approved) {
            accessSubscriptionsTypeData[accessLevelType] = this.getRaisedSubscriptionAccesses(accessDetail);
          }
        });
      });
      if (!isSubscribed || isSubscribedVDR) {
        this.filteredRequestFunction(filteredRequests, accessRequestTypesData, accessLevelType);
      }
    });
    this.setRequestModalFlags(accessRequestTypesData, accessSubscriptionsTypeData); // modal options.
    this.setRequestBtn(); //Request button
  }

  filteredRequestFunction(filteredRequests, accessRequestTypesData, accessLevelType) {
    filteredRequests.forEach((request: IOpportunityRequest) => {
      request.accessLevels.forEach((accessLevel) => {
        if (request.requestStatus?.toLowerCase() === accessStatus.Pending && accessLevel === accessLevelType) {
          accessRequestTypesData[accessLevelType] = this.getRaisedRequestAccesses(request);
        }
      });
    });
  }

  setRequestModalFlags(accessRequestTypesData, accessSubscriptionsTypeData) {
    this.accessTag =
      accessSubscriptionsTypeData[accessLevelsName.VDR]?._accessTag ||
      accessSubscriptionsTypeData[accessLevelsName.CI]?._accessTag ||
      accessRequestTypesData[accessLevelsName.VDR]?._accessTag ||
      accessRequestTypesData[accessLevelsName.CI]?._accessTag;

    this.isVDRDisabled =
      accessSubscriptionsTypeData[accessLevelsName.VDR]?._accessTag === tagForAccess.Live ||
      accessRequestTypesData[accessLevelsName.VDR]?._accessTag === tagForAccess.Requested ||
      accessRequestTypesData[accessLevelsName.VDR]?._accessTag === tagForAccess.Live;

    this.isCIDisabled =
      accessSubscriptionsTypeData[accessLevelsName.CI]?._accessTag === tagForAccess.Live ||
      accessRequestTypesData[accessLevelsName.CI]?._accessTag === tagForAccess.Requested ||
      accessRequestTypesData[accessLevelsName.CI]?._accessTag === tagForAccess.Live;
  }

  setRequestBtn() {
    this.isRequestBtnDisabled = this.isVDRDisabled && this.isCIDisabled;
  }

  //Can move getRaisedRequestAccesses(), getRaisedSubscriptionAccesses() to the services for better component cleanliness.
  getRaisedRequestAccesses(request) {
    let isRequestPending: boolean;
    let isApproved: boolean;
    let _accessTag = '';
    if (request.requestStatus?.toLowerCase() === accessStatus.Pending) {
      _accessTag = tagForAccess.Requested;
      isRequestPending = true;
    } else {
      _accessTag = '';
    }
    return { isRequestPending, isApproved, _accessTag };
  }

  getRaisedSubscriptionAccesses(accessDetail) {
    let isApproved: boolean;
    let _accessTag = '';
    if (accessDetail.status?.toLowerCase() === accessStatus.Approved) {
      _accessTag = tagForAccess.Live;
      isApproved = true;
    } else {
      _accessTag = '';
    }
    return { isApproved, _accessTag };
  }

  public onOpportunityDetailsBack() {
    if (this.isRouteFlow) {
      this.router.navigateByUrl('/map');
    } else {
      this.opportunityDetailsBack.emit();
    }
  }

  public getOpportunityAttributes(opportunityDetails) {
    return [
      {
        label: opportunityDetails?.countries[0],
        icon: 'geotag',
        tooltip: 'Country'
      },
      {
        label: opportunityDetails?.assetType[0],
        icon: 'cloud-neutron',
        tooltip: 'Asset Type'
      },
      {
        label: opportunityDetails?.offerType[0],
        icon: 'feedback',
        tooltip: 'Offer Type'
      },
      {
        label: opportunityDetails?.contractType[0],
        icon: 'report',
        tooltip: 'Contract Type'
      },
      {
        label: opportunityDetails?.deliveryType[0],
        icon: 'logistics',
        tooltip: 'Delivery Type'
      },
      {
        label: opportunityDetails?.phase[0],
        icon: 'production-history',
        tooltip: 'Phase Type'
      }
    ];
  }

  onOpenMsgPanel() {
    if (this.isRouteFlow) {
      this.router.navigateByUrl(`communication/${this.opportunityId}`);
      return;
    }
    this.store.dispatch(opportunityAttendeeActions.openModularChatPanel({ openModularChat: true }));
  }

  public downloadAllDoc(type: string) {
    if (type == 'confidential') {
      this.renderableConfidentialDocuments$.pipe(take(1)).subscribe((data) => {
        data.forEach((item) => {
          this.downloadDocument(item);
        });
      });
    } else {
      this.renderableOpenDocuments$.pipe(take(1)).subscribe((data) => {
        data.forEach((item) => {
          this.downloadDocument(item);
        });
      });
    }
  }

  public openDocument(event: RenderableDocument) {
    this.mediaDocumentUploaderService.downloadMedia(event.fileId).subscribe((signedUrl) => {
      if (!signedUrl) {
        this.notificationService.send({
          severity: 'Error',
          title: 'Something went wrong',
          message: 'An error occurred while opening the file'
        });
        return;
      }
      if (event.fileType == 'pdf' || event.fileType == 'txt') {
        this.windowRef.nativeWindow.open(signedUrl);
      } else {
        const frame = this.documentRef.nativeDocument.createElement('iframe');
        frame.setAttribute('src', `${signedUrl}`);
        this.documentRef.nativeDocument.body.appendChild(frame);
        setTimeout(() => this.documentRef.nativeDocument.body.removeChild(frame), 10000);
      }
    });
  }

  public downloadDocument(item) {
    this.mediaDocumentUploaderService.downloadMedia(item.fileId).subscribe((signedUrl) => {
      if (!signedUrl) {
        this.notificationService.send({
          severity: 'Error',
          title: 'Something went wrong',
          message: 'An error occurred while downloading the file'
        });
        return;
      }
      const url = `${this.contentServiceURL}/opportunity/consumer/download/${item.fileName}?signedUrl=` + encodeURIComponent(signedUrl);
      const frame = this.documentRef.nativeDocument.createElement('iframe');
      frame.setAttribute('src', `${url}`);
      this.documentRef.nativeDocument.body.appendChild(frame);
      setTimeout(() => this.documentRef.nativeDocument.body.removeChild(frame), 30000);
    });
  }

  requestAccess() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.panelClass = 'request-access-modal-panel';
    dialogConfig.disableClose = true;
    dialogConfig.data = {
      title: 'Request Access',
      confirmButtonText: 'Submit',
      cancelButtonText: 'Cancel',
      displayObject: true,
      opportunityName: this.opportunitiesDetails?.opportunityName,
      accessTag: this.accessTag,
      isVDRDisabled: this.isVDRDisabled,
      isCIDisabled: this.isCIDisabled
    };
    const dialogRef = this.dialog.open(RequestAccessModalComponent, dialogConfig);
    dialogRef.componentInstance.requestAccessClickEvent.subscribe((formValue) => {
      dialogRef.componentInstance.showloader = true;
      const payload: IOpportunitySubscriptionRequestsPayload = {
        opportunityId: this.opportunitiesDetails?.opportunityId,
        comment: formValue.message,
        companyName: formValue.company,
        requesterId: formValue.attendeeEmail,
        accessLevels: formValue.accessLevels
      };
      this.opportunityAttendeeService
        .createRequestAccess(payload)
        .pipe()
        .subscribe(
          () => {
            const opportunityId = this.opportunitiesDetails?.opportunityId;
            this.store.dispatch(opportunityAttendeeActions.getOpportunityById({ opportunityId }));
            this.notificationService.send({
              severity: 'Success',
              title: 'Request Access',
              message: 'A request have been created succssfully.'
            });
            dialogRef.componentInstance.closeModal();
            dialogRef.componentInstance.showloader = false;
          },
          () => {
            dialogRef.componentInstance.closeModal();
            dialogRef.componentInstance.showloader = false;
            this.notificationService.send({
              severity: 'Error',
              title: 'Something went wrong',
              message: 'An error occurred while creating a request'
            });
          }
        );
    });
  }

  getValidatedDate(date) {
    this.convertedValidatedDate = moment(date).format('DD-MMM-YYYY');
    return this.convertedValidatedDate;
  }

  detailsPage() {
    const url = `/opportunity/${this._opportunityId}`;
    const link = location.origin.concat(url);
    navigator.clipboard.writeText(link);
    this.showTooltip = true;
    setTimeout(() => {
      this.showTooltip = false;
      this.changeDetectorRef.detectChanges();
    }, 2000);
  }

  onShowMoreClick() {
    this.showMore = !this.showMore;
  }

  ngOnDestroy() {
    if (!this.isDataOpportunityWorkflow) {
      this.themeService.switchTheme(Themes.Dark);
    }
    // closes modular chat window once you move out of the details panel
    this.store.dispatch(opportunityAttendeeActions.openModularChatPanel({ openModularChat: false }));
    this.subscription.unsubscribe();
  }
}
