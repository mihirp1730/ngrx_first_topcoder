import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MetadataService } from '@apollo/app/metadata';
import { DataPackagesService, IDataPackagePrice, IDataPackageProfile, IMediaFile, IRegionOptions, ISavePackageProfileRequest, ISavePackageProfileResponse } from '@apollo/app/services/data-packages';
import { IDocFile } from '@apollo/app/document-upload';
import { IMediaUploadInputProps } from '@apollo/app/services/media-document-uploader';
import { NotificationService } from '@apollo/app/ui/notification';
import { IMaxFileConfig } from '@apollo/app/upload-widget';
import { IDataVendor, VendorAppService } from '@apollo/app/vendor';
import { SlbDropdownOption } from '@slb-dls/angular-material/dropdown';
import { isEqual } from 'lodash';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { ConfirmModalComponent } from '../../../app/confirm-modal/confirm-modal.component';
import { minValidator, transformPackagePayload } from '../helpers/package.helper';
import { editorConfig } from './quill-editor.config';

export interface IPackageDetail {
  profile: IDataPackageProfile;
  price: IDataPackagePrice;
}

@Component({
  selector: 'apollo-package-editor',
  templateUrl: './package-editor.component.html',
  styleUrls: ['./package-editor.component.scss']
})
export class PackageEditorComponent implements OnInit, OnDestroy {
  @Input() packageId: string;
  @Input() packageName: string;
  @Input() packageDetail: IPackageDetail;
  @Input() isPackagePublished = false;
  @Output() backTo: EventEmitter<void> = new EventEmitter<void>();
  @Output() savedValues: EventEmitter<ISavePackageProfileRequest> = new EventEmitter<ISavePackageProfileRequest>();
  public maxFileSizeDocument: IMaxFileConfig = {
    // Size -1 means we don't have size limit.
    generic: -1
  }
  public extensions = '.pdf,.doc,.txt,.zip';
  public isProfileDetailsSaved = false;
  public showLoader = false;

  public packageDetailForm: FormGroup;

  private overviewKeypointsSubject = new BehaviorSubject<Array<FormControl>>(null);
  public overviewKeypoints$ = this.overviewKeypointsSubject.asObservable();

  private featureKeypointsSubject = new BehaviorSubject<Array<FormControl>>(null);
  public featureKeypoints$ = this.featureKeypointsSubject.asObservable();

  public saveDetailsTimeStamp: string;
  public priceInputConfig = {
    align: 'left',
    allowNegative: false,
    decimal: '.',
    precision: 2,
    prefix: '',
    suffix: '',
    thousands: ',',
    typingDirection: 'integerToDecimal'
  };
  public mediaUploadoptions: IMediaUploadInputProps = {
    infoMessages: ['Upload relevant images of .JPEG/.JPG or .PNG format up to 10MB.', 'Only characters A-Z, numbers 0-9, -, _ and space are supported for the file name.', 'Please provide suitable captions.'],
    noPreviewText: 'Images that you upload would be shown here',
    dropzoneInfoText: 'Drop Here or Click',
    dropzoneErrorText: 'Package media is required. Please upload atleast one image',
    multiple: true
  };
  public regions$: Observable<IRegionOptions[]>;
  public invalidRegion: boolean;
  public isRegionDirty: boolean;
  public mediaFileList: IMediaFile[];
  public existingMediaFileList: IMediaFile[];
  public existingDocFileList: IDocFile[];
  public documentFileList: IDocFile[];
  public discarded = false;
  public dataVendor: IDataVendor;
  public subscription: Subscription = new Subscription();
  public opportunity$: Observable<SlbDropdownOption[]>;

  public editorModules = editorConfig;

  get overviewKeypoints() {
    return this.packageDetailForm.get('overviewKeypoints') as FormArray;
  }

  get featureKeypoints() {
    return this.packageDetailForm.get('featureKeypoints') as FormArray;
  }

  get canLeave(): boolean {
    const dataPackageInfo = transformPackagePayload(this.getDataPackageDraft(this.packageDetailForm.value));
    return isEqual(dataPackageInfo, this.packageDetail);
  }

  editorInit(quill:any){
    quill.clipboard.addMatcher(Node.ELEMENT_NODE, (node, contentArray)=>{
      contentArray.forEach(content => {
        if(content.attributes){
          content.attributes.color = '';
          content.attributes.background = '';
        }
      });
      return contentArray;
    });
  }

  constructor(
    private fb: FormBuilder,
    private dataPackagesService: DataPackagesService,
    private notificationService: NotificationService,
    private metadataService: MetadataService,
    public dialog: MatDialog,
    private vendorAppService: VendorAppService
  ) { }

  ngOnInit(): void {
    this.regions$ = this.metadataService.regions$.pipe(
      map((response) => {
        response.sort();
        return response.map((item) => ({
          value: item,
          viewText: item
        }));
      })
    );

    this.opportunity$ = this.metadataService.opportunity$.pipe(
      map((response) => {
        return response.map((item) => ({
          value: item,
          viewText: item
        }));
      })
    );
    this.initForm();
    this.isRegionDirty = this.packageDetailForm?.controls.regions?.dirty;
    this.getDataVendor();
  }

  public initForm() {
    this.packageDetailForm = this.fb.group({
      onRequest: new FormControl(false, [Validators.required]),
      priceUsd: new FormControl(''),
      subscriptionDuration: new FormControl(''),
      regions: new FormControl('', [Validators.required]),
      packageOverview: new FormControl('', Validators.required),
      overviewKeypoints: this.fb.array([new FormControl('', [Validators.required, Validators.maxLength(800)])]),
      featureKeypoints: this.fb.array([new FormControl('', [Validators.required, Validators.maxLength(800)])]),
      supportDocuments: new FormControl(''),
      supportMedia: new FormControl(''),
      opportunity: new FormControl('', [Validators.required])
    });
    this.overviewKeypointsSubject.next([...this.overviewKeypoints.controls] as Array<FormControl>);
    this.featureKeypointsSubject.next([...this.featureKeypoints.controls] as Array<FormControl>);

    // Handle price selection
    this.packageDetailForm.get('onRequest').valueChanges.subscribe((value) => {
      const onRequestStatus = !value ? 'enable' : 'disable';
      const priceUsd = this.packageDetailForm.get('priceUsd');
      const subscriptionDuration = this.packageDetailForm.get('subscriptionDuration');

      priceUsd[onRequestStatus]();
      subscriptionDuration[onRequestStatus]();

      if (onRequestStatus == 'enable') {
        priceUsd.setValidators([minValidator(1), Validators.required]);
        subscriptionDuration.setValidators([minValidator(1), Validators.required, Validators.pattern('^[0-9]*$')]);
      } else {
        priceUsd.patchValue('');
        priceUsd.clearValidators();
        subscriptionDuration.patchValue('');
        subscriptionDuration.clearValidators();
      }

      priceUsd.updateValueAndValidity();
      subscriptionDuration.updateValueAndValidity();
    });

    // Check if there is previous information
    if (this.packageDetail) {
      this.setFormValues(this.packageDetail);
    }

    if (this.isPackagePublished) {
      this.packageDetailForm.disable();
    }
  }

  // Method to get payload for save data package
  public getDataPackageDraft(packageData) {
    return {
      profile: {
        regions: packageData.regions,
        overview: {
          overView: packageData.packageOverview,
          keyPoints: packageData.overviewKeypoints
        },
        featuresAndContents: {
          keyPoints: packageData.featureKeypoints
        },
        media: this.mediaFileList || [],
        documents: this.documentFileList || [],
        opportunity: {
          opportunity: packageData.opportunity
        }
      },
      price: {
        onRequest: packageData.onRequest,
        price: packageData.priceUsd || 0,
        durationTerm: parseInt(packageData.subscriptionDuration || 0)
      }
    };
  }

  public uploadedFileIds(event: IMediaFile[]) {
    this.mediaFileList = event;
  }

  public uploadedDocFileId(event: IDocFile[]) {
    this.documentFileList = event;
  }

  public saveAsDraft() {
    this.validateRegion();

    if (this.discarded) {
      // If form was reset using discard() previously,then side effect of "setErrors(null)"" already caused suppression of validation. This code re-enables the validation.
      Object.keys(this.packageDetailForm.controls).forEach((key) => {
        this.packageDetailForm.controls[key].updateValueAndValidity();
      });
      this.featureKeypoints.controls[0].updateValueAndValidity();
      this.overviewKeypoints.controls[0].updateValueAndValidity();
      this.discarded = false;
    }

    if (this.packageDetailForm.valid) {
      this.showLoader = true;
      const dataPackageDraft = this.getDataPackageDraft(this.packageDetailForm.value);

      this.dataPackagesService.savePackageProfile(this.packageId, dataPackageDraft).subscribe(
        (res: ISavePackageProfileResponse) => {
          if (res && res.dataPackageProfileId) {
            this.saveDetailsTimeStamp = new Date().toUTCString();
            this.isProfileDetailsSaved = true;
            this.showLoader = false;

            this.savedValues.emit(dataPackageDraft);
          }
        },
        () => {
          this.showLoader = false;
          this.notificationService.send({
            severity: 'Error',
            title: 'Error',
            message: 'Something went wrong saving the profile!'
          });
        }
      );
    } else {
      console.log('NO VALID');
    }
  }

  public goBack() {
    if (this.canLeave) {
      return this.backTo.emit();
    }
    this.createNotificationModal(
      'Unsaved Changes',
      'There are changes that has not been saved. Are you sure you want to leave before saving those changes?',
      'Leave',
      'Stay',
      () => {
        this.backTo.emit();
      }
    );
  }

  public discard() {
    this.createNotificationModal(
      'Discard Changes',
      'You will lose your unsaved changes. Continue?',
      'Yes',
      'No',
      () => {
        // Missing : When user clicks discard, we should clean the package detail forms with previous saved information
        let _item0; // variable to capture the  mandatory first keypoint-field.
        [this.overviewKeypoints, this.featureKeypoints].forEach((item) => {
          _item0 = item.at(0);
          _item0.setValue('');
          item.clear(); //clear all keypoint formarray-fields and refill first keypoint-field back.
          item.push(_item0);
        });
        //update below Subject to reflect keypoint changes in UI.
        this.featureKeypointsSubject.next([...this.featureKeypoints.controls] as Array<FormControl>);
        this.overviewKeypointsSubject.next([...this.overviewKeypoints.controls] as Array<FormControl>);
        // below function reset formfield values with empty string or defaults. If GET API response is available then it will overirde this data.
        this.setFormValues({
          profile: {
            regions: [''],
            overview: {
              description: '',
              keypoints: ['']
            },
            featuresAndContents: {
              keypoints: ['']
            },
            media: [],
            documents: [],
            opportunity: {
              opportunity: ''
            }
          },
          price: {
            onRequest: false,
            price: null,
            duration: null
          }
        });
        //clear mat-errors
        Object.keys(this.packageDetailForm.controls).forEach((key) => {
          this.packageDetailForm.get(key).setErrors(null);
        });
        this.featureKeypoints.controls[0].setErrors(null);
        this.overviewKeypoints.controls[0].setErrors(null);
        this.discarded = true;
      }
    );
  }

  public createNotificationModal(titleText: string, contentText: string, confirmText: string, cancelText: string, callback: any) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.panelClass = 'unsaved-changes-modal-panel';
    dialogConfig.disableClose = true;
    dialogConfig.data = {
      title: titleText,
      content: contentText,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText
    };
    const modalDialogRef = this.dialog.open(ConfirmModalComponent, dialogConfig);
    modalDialogRef.componentInstance.yesClickEvent.subscribe(callback);
  }

  public addKeypoint(keypointType: string, value: string = '') {
    switch (keypointType) {
      case 'overview':
        if (this.overviewKeypoints.length < 5) {
          this.overviewKeypoints.push(this.fb.control(value, [Validators.required, Validators.maxLength(800)]));
          this.overviewKeypointsSubject.next([...this.overviewKeypoints.controls] as Array<FormControl>);
        }
        break;
      case 'feature':
        if (this.featureKeypoints.length < 5) {
          this.featureKeypoints.push(this.fb.control(value, [Validators.required, Validators.maxLength(800)]));
          this.featureKeypointsSubject.next([...this.featureKeypoints.controls] as Array<FormControl>);
        }
        break;
    }
  }

  public removeKeypoint(keypointType: string, keypointIndex: number) {
    switch (keypointType) {
      case 'overview':
        this.overviewKeypoints.removeAt(keypointIndex);
        this.overviewKeypointsSubject.next([...this.overviewKeypoints.controls] as Array<FormControl>);
        break;
      case 'feature':
        this.featureKeypoints.removeAt(keypointIndex);
        this.featureKeypointsSubject.next([...this.featureKeypoints.controls] as Array<FormControl>);
        break;
    }
  }

  keyFilter(e) {
    // this checks keycodes for '-' '+' 'e' or 'E' and blocks them
    return ![69, 189, 187].includes(e.keyCode);
  }

  private setFormValues(values: IPackageDetail): void {
    this.packageDetailForm.patchValue({
      onRequest: values.price.onRequest,
      priceUsd: values.price.price || '',
      subscriptionDuration: values.price.duration || '',
      packageOverview: values.profile.overview.description,
      regions: values.profile.regions,
      opportunity: values.profile.opportunity.opportunity
    });

    values.profile.overview.keypoints.forEach((keypoint, index) => {
      if (index === 0) {
        this.overviewKeypoints.at(0).setValue(keypoint);
        return;
      }

      this.addKeypoint('overview', keypoint);
    });

    values.profile.featuresAndContents.keypoints.forEach((keypoint, index) => {
      if (index === 0) {
        this.featureKeypoints.at(0).setValue(keypoint);
        return;
      }

      this.addKeypoint('feature', keypoint);
    });
    this.existingMediaFileList = values.profile.media || [];
    this.mediaFileList = values.profile.media || [];
    this.existingDocFileList = values.profile.documents || [];
    this.documentFileList = values.profile.documents || [];
  }

  public validateRegion() {
    this.invalidRegion = this.packageDetailForm.value.regions.length === 0;
    return this.invalidRegion;
  }

  public getDataVendor() {
    this.subscription.add(this.vendorAppService.retrieveDataVendors(true)
      .pipe(take(1))
      .subscribe((dataVendor: IDataVendor[]) => {
        this.dataVendor = dataVendor[0];
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
