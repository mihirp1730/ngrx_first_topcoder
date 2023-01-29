import * as opportunityActions from '../state/actions/opportunity.actions';
import * as opportunitySelectors from '../state/selectors/opportunity.selectors';

import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import {
  IOpportunityConfidentialProfile,
  IOpportunityDetails,
  IOpportunityProfile,
  IOpportunityVDRPayload,
  OpportunityStatus,
  OpportunityType
} from '@apollo/app/services/opportunity';
import { Subscription, combineLatest, distinctUntilChanged, filter, map, take } from 'rxjs';
import { animate, state, style, transition, trigger } from '@angular/animations';

import { MatTabChangeEvent } from '@angular/material/tabs';
import { Store } from '@ngrx/store';

@Component({
  selector: 'apollo-opportunity-creator',
  templateUrl: './opportunity-creator.component.html',
  styleUrls: ['./opportunity-creator.component.scss'],
  animations: [
    trigger('gisCanvasTrigger', [
      state(
        'hideGisCanvas',
        style({
          width: '0%',
          display: 'none'
        })
      ),
      state(
        'showGisCanvas',
        style({
          width: '100%',
          display: 'block'
        })
      ),
      transition('* => *', animate(500))
    ])
  ],
  encapsulation: ViewEncapsulation.None
})
export class OpportunityCreatorComponent implements OnInit, OnDestroy {
  readonly opportunityTypeEnum = OpportunityType;
  readonly opportunityStatusEnum = OpportunityStatus;
  showLoader$ = this.store.select(opportunitySelectors.selectIsLoadingWhileCreating);
  isOpportunitySaved$ = this.store.select(opportunitySelectors.selectIsOpportunitySaved);
  selectedOpportunity$ = this.store.select(opportunitySelectors.selectOpportunity);

  savedOpportunityTimeStamp$ = this.store.select(opportunitySelectors.selectSavedOpportunityTimeStamp);

  lastModifiedlTimeStamp$ = this.store.select(opportunitySelectors.lastModifiedTimeStamp);
  oppDetailsIsValid$ = this.store.select(opportunitySelectors.selectCreationIsDetailsValid);
  openInfoIsValid$ = this.store.select(opportunitySelectors.selectCreationIsOpenInfoValid);
  confidentialInfoIsValid$ = this.store.select(opportunitySelectors.selectCreationIsConfidentialInfoValid);
  assetShapeIsValid$ = this.store.select(opportunitySelectors.selectCreationIsAssetShapeValid);
  opportunityDetails$ = this.store.select(opportunitySelectors.selectCreationDetails);
  isOpportunityPublished$ = this.store.select(opportunitySelectors.selectIsOpportunityPublished);
  isOpportunityReadyToPublish$ = this.store.select(opportunitySelectors.selectIsOpportunityReadyToPublish);
  isOpportunityChanged$ = this.store.select(opportunitySelectors.deduceIsOpportunityChanged);
  animationState = 'hideGisCanvas';
  selectedIndex: number;
  public subscriptions: Subscription = new Subscription();
  public opportunityId: string;
  public editMode: boolean;
  public isPublished: boolean;
  public isCreateOppFormUpdated: boolean;
  showGlobeOption = false;
  isOpenInfoDirty = false;
  isAdditionalServEqual = true;
  isConfidentialInfoDirty = false;
  isOpportunityDetailsEqual = true;
  isOppPublished = false;

  constructor(private router: Router, private route: ActivatedRoute, public readonly store: Store) {}

  publishCheck$ = combineLatest([
    this.oppDetailsIsValid$,
    this.openInfoIsValid$,
    this.isOpportunitySaved$,
    this.assetShapeIsValid$,
    this.selectedOpportunity$
  ]).pipe(
    map(([oppDetail, openInfoValid, isOppSaved, assetShapeValid, OppDetailsData]) => {
      return (
        (oppDetail && openInfoValid) === false ||
        isOppSaved === false ||
        (assetShapeValid === false && OppDetailsData?.opportunityType !== this.opportunityTypeEnum.Private)
      );
    })
  );
  alreadyPublished$ = this.store.select(opportunitySelectors.selectOpportunity).pipe(
    map((opportunity) => {
      this.isPublished = opportunity?.opportunityStatus === this.opportunityStatusEnum.Published;
      return this.isPublished;
    })
  );
  saveCheck$ = this.selectedOpportunity$.pipe(
    map((opportunity) => {
      return !opportunity?.opportunityName;
    })
  );
  ngOnInit() {
    this.subscriptions.add(
      this.isOpportunityPublished$.subscribe((isOpportunityPublished) => {
        this.isOppPublished = isOpportunityPublished;
        if (isOpportunityPublished) {
          this.onGoHome();
        }
      })
    );
    this.subscriptions.add(
      this.store.select(opportunitySelectors.selectCreatedOpportunityId).subscribe((value) => {
        this.opportunityId = value;
      })
    );
    this.subscriptions.add(
      this.route.data.subscribe((data) => {
        this.editMode = data.editMode || false;
      })
    );

    this.store
      .select(opportunitySelectors.selectOpportunity)
      .pipe(filter((opportunity) => !!opportunity && !!opportunity.opportunityProfile && !!opportunity.confidentialOpportunityProfile))
      .subscribe((opportunity) => {
        this.store.dispatch(opportunityActions.updateOpportunityProfileChanged({ profile: opportunity.opportunityProfile }));
        this.store.dispatch(
          opportunityActions.updateOpportunityConfidentialInfoChanged({ confidentialProfile: opportunity.confidentialOpportunityProfile })
        );
        if (opportunity.opportunityProfile?.media.length > 0 && !!opportunity.opportunityProfile?.overview) {
          this.store.dispatch(opportunityActions.createIsOpenInfoValidChanged({ isOpenInfoValid: true }));
        }
      });
  }

  public onGoHome() {
    this.router.navigateByUrl('/vendor');
  }

  // Handler for save package as draft
  public saveAsDraft() {
    if (this.opportunityId) {
      if (!this.isCreateOppFormUpdated) this.updateOpportunityNameNType();
      else {
        this.isCreateOppFormUpdated = false;
      }
      this.store.dispatch(opportunityActions.editOpportunity());
    } else {
      this.store.dispatch(opportunityActions.createOpportunity());
    }
  }

  public detailsFormIsValid(isDetailsValid: boolean) {
    this.store.dispatch(opportunityActions.createIsDetailsValidChanged({ isDetailsValid }));
  }

  public opportunityDetailsFormIsDirty(isEqual: boolean) {
    this.isOpportunityDetailsEqual = isEqual;
  }

  public openInformationFormIsValid(isOpenInfoValid: boolean) {
    this.store.dispatch(opportunityActions.createIsOpenInfoValidChanged({ isOpenInfoValid }));
  }

  public openInformationIsDirty(isDirty: boolean) {
    this.isOpenInfoDirty = isDirty;
  }

  public confidentialInfoFormIsValid(isConfidentialInfoValid: boolean) {
    this.store.dispatch(opportunityActions.createIsConfidentialInfoValidChanged({ isConfidentialInfoValid }));
  }

  public additionalServicesInfoFormIsValid(isAdditionalServicesInfoValid: boolean) {
    this.store.dispatch(opportunityActions.createIsAdditionalServicesInfoValidChanged({ isAdditionalServicesInfoValid }));
  }

  public additionalServicesIsDirty(isDirty: boolean) {
    this.isAdditionalServEqual = isDirty;
  }

  public opportunityNameChanged(opportunityName: string) {
    this.store.dispatch(opportunityActions.createOpportunityNameChanged({ opportunityName }));
  }

  public opportunityTypeChanged(opportunityType: OpportunityType) {
    this.store.dispatch(opportunityActions.createOpportunityTypeChanged({ opportunityType }));
  }
  public opportunityOpenInformation(profile: IOpportunityProfile) {
    this.store.dispatch(opportunityActions.updateOpportunityProfileChanged({ profile }));
  }

  public opportunityConfidentialInformation(confidentialProfile: IOpportunityConfidentialProfile) {
    this.store.dispatch(opportunityActions.updateOpportunityConfidentialInfoChanged({ confidentialProfile }));
  }

  public confidentialInformationIsDirty(isDirty: boolean) {
    this.isConfidentialInfoDirty = isDirty;
  }

  public opportunityAdditionalServices(opportunityVDR: IOpportunityVDRPayload) {
    this.store.dispatch(opportunityActions.updateAdditionalServicesChanged({ opportunityVDR }));
  }

  public assetShapeIsValid(isAssetShapeValid: boolean) {
    this.store.dispatch(opportunityActions.createIsAssetShapeValidChanged({ isAssetShapeValid }));
  }

  public canLeave(): boolean {
    if (this.isOppPublished) return true;
    return !(this.isOpenInfoDirty || !this.isAdditionalServEqual || this.isConfidentialInfoDirty || !this.isOpportunityDetailsEqual);
  }

  public publishOpportunity() {
    this.subscriptions.add(
      this.isOpportunityChanged$.pipe(take(1)).subscribe((changed) => {
        if (changed) {
          this.saveAsDraft();
          this.subscriptions.add(
            this.isOpportunityReadyToPublish$.subscribe((data) => {
              if (data) {
                this.store.dispatch(opportunityActions.publishOpportunity());
              }
            })
          );
        } else {
          this.store.dispatch(opportunityActions.publishOpportunity());
        }
      })
    );
  }

  public selectedTabChange({ index }: MatTabChangeEvent) {
    this.animationState = index === 2 ? 'showGisCanvas' : 'hideGisCanvas';
    this.showGlobeOption = index === 2;
    this.selectedIndex = index;
  }

  public createOpportunityFormChanged(values): void {
    this.isCreateOppFormUpdated = true;
    this.store
      .select(opportunitySelectors.selectOpportunityDetails)
      .pipe(take(1), distinctUntilChanged())
      .subscribe((details) => {
        let updatedOpporDetails = details;
        updatedOpporDetails = { ...updatedOpporDetails, opportunityName: values.opportunityName, opportunityType: values.opportunityType };
        this.opportunityNameChanged(updatedOpporDetails.opportunityName);
        this.opportunityTypeChanged(updatedOpporDetails.opportunityType);
        this.store.dispatch(opportunityActions.updateOpportunityDetails({ opportunityDetails: updatedOpporDetails }));
        this.saveAsDraft();
      });
  }

  public updateOpportunityNameNType() {
    combineLatest([
      this.store.select(opportunitySelectors.selectOpportunityDetails),
      this.store.select(opportunitySelectors.selectOpportunity)
    ])
      .pipe(take(1), distinctUntilChanged())
      .subscribe(([opportunityDetails, selectedOpportunity]) => {
        let updatedOpporDetails = opportunityDetails;
        updatedOpporDetails = {
          ...updatedOpporDetails,
          opportunityName: selectedOpportunity.opportunityName,
          opportunityType: selectedOpportunity.opportunityType
        };
        this.store.dispatch(opportunityActions.updateOpportunityDetails({ opportunityDetails: updatedOpporDetails }));
      });
  }

  public opportunityDetailsChanged(opportunityDetails: IOpportunityDetails) {
    const details = {
      ...opportunityDetails,
      countries: opportunityDetails.countries
    };
    if (opportunityDetails?.assetType?.indexOf('Carbon Trading') > -1) {
      details.ccusAttributes = {
        expectedSequestration: opportunityDetails['expectedSequestration'],
        costOfCarbonAbated: opportunityDetails['costOfCarbonAbated'],
        certifier: opportunityDetails['certifier'],
        lastValidatedOrVerified: opportunityDetails['lastValidatedOrVerified']
      };
    } else {
      details.ccusAttributes = null;
    }
    this.store.dispatch(opportunityActions.updateOpportunityDetails({ opportunityDetails: details }));
  }

  ngOnDestroy(): void {
    this.store.dispatch(opportunityActions.resetOpportunitySaveStatus());
    this.subscriptions.unsubscribe();
  }
}
