import { Component, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_RADIO_DEFAULT_OPTIONS } from '@angular/material/radio';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthUser, IMapSettings } from '@apollo/api/interfaces';
import { AuthCodeFlowService } from '@apollo/app/auth-codeflow';
import { DELFI_USER_CONTEXT } from '@apollo/app/delfi-gui-auth-config';
import { ICategory, MetadataService } from '@apollo/app/metadata';
import { SecureEnvironmentService } from '@apollo/app/secure-environment';
import { DataPackagesService, ICreateDataPackageResponse, IDataItem, IMarketingRepresentation, ISavePackageProfileRequest } from '@apollo/app/services/data-packages';
import { SettingsService } from '@apollo/app/settings';
import { INotificationOptions, NotificationService } from '@apollo/app/ui/notification';
import { FileType, FileUploaderService, IFile, IPartialFile } from '@apollo/app/upload-widget';
import { ContextModel } from '@delfi-gui/components/lib/model/context.model';
import { GisCanvas, GisLayerPanelService, GisMapLargeService, GisSearchResultActionService, IGisSettingsConfig } from '@slb-innersource/gis-canvas';
import { GoogleAnalyticsService } from 'ngx-google-analytics';
import { BehaviorSubject, combineLatest, Observable, of, Subscription, zip } from 'rxjs';
import { catchError, distinctUntilChanged, filter, first, map, switchMap, take, tap } from 'rxjs/operators';

import { groupFiles } from '../helpers/files.helper';
import { transformPackagePayload } from '../helpers/package.helper';
import { IDataType, initialState, IPackageState } from '../package-creator.interface';
import { PackageEditorComponent } from '../package-editor/package-editor.component';
import { ShareDataService } from './../../shared/services/share-data.service';
import { LeaveForm } from './../package-edit.guard';

export interface IGisSettings {
  config: IGisSettingsConfig;
  partition: string;
  appKey: string;
  deploymentUrl: string;
  token: string;
}

const PACKAGE_NAME_MAX_LENGTH = 100;

@Component({
  selector: 'apollo-package-creator',
  templateUrl: './package-creator.component.html',
  styleUrls: ['./package-creator.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: MAT_RADIO_DEFAULT_OPTIONS,
      useValue: { color: '#1683fb' }
    }
  ]
})
export class PackageCreatorComponent implements OnInit, LeaveForm, OnDestroy {
  @ViewChild(PackageEditorComponent) packageEditor: PackageEditorComponent;

  // Component state
  private _state: IPackageState = initialState;
  private state = new BehaviorSubject<IPackageState>(this._state);
  public state$ = this.state.asObservable();

  // Selectors
  public packageId$ = this.state$.pipe(map((state) => state.id));
  public packageName$ = this.state$.pipe(map((state) => state.name));
  public packageDetail$ = this.state$.pipe(map((state) => ({ profile: state.profile, price: state.price })));
  public shapes$ = this.state$.pipe(map((state) => state.files.shapes));
  public shapesGroup$ = this.shapes$.pipe(
    distinctUntilChanged(),
    switchMap((shapeIds: Array<string>) => this.getShapeFiles(shapeIds)),
    map(groupFiles)
  );
  public deliverables$ = this.state$.pipe(
    map((state) => state.files.deliverables),
    switchMap((deliverableIds: Array<string>) => this.getDeliverables(deliverableIds))
  );
  public editMode$ = this.state$.pipe(map((state) => state.editing));
  public dataTypes$ = this.state$.pipe(map((state) => state.dataTypes));

  public isDeliverableInProgres$ = this.deliverables$.pipe(
    map((data) => data.filter((file) => !file.progress.associated && !file.progress.errorMessage)),
    map((data) => data.length > 0)
  );

  public isShapeInProgress$ = this.shapes$.pipe(
    switchMap((shapeIds: Array<string>) => this.getShapeFiles(shapeIds)),
    map((data) => data.filter((file) => !file.progress.associated)),
    map((data) => data.length > 0)
  );

  public allShapesAssociated$ = this.dataTypes$.pipe(map((dataTypes) => dataTypes.every((dType) => dType.hasShapeUploaded)));

  public isPackageDetailValid$ = this.state$.pipe(
    map((state) => {
      return this.isPriceValid(state.price) && this.isProfileValid(state.profile);
    })
  );

  public containsDraftLayers$: Observable<boolean> = combineLatest([
    this.dataTypes$,
    this.metadataService.marketingLayers$.pipe(map((marketingArray) => marketingArray.map((option) => option.layerName))),
    this.allShapesAssociated$
  ]).pipe(
    map(([dataTypes, marketingLayersOptions, allShapesAssociated]) => {
      return !dataTypes.every(({ type }) => marketingLayersOptions.includes(type)) && allShapesAssociated;
    })
  );

  public isPublishDisabled$ = combineLatest([
    this.packageId$,
    this.isDeliverableInProgres$,
    this.allShapesAssociated$,
    this.isPackageDetailValid$,
    this.containsDraftLayers$,
    this.isShapeInProgress$
  ]).pipe(
    map(([packageId, isDeliverableInProgres, allShapesAssociated, isPackageDetailValid, containsDraftLayers, isShapeInProgress]) => {
      return !packageId || isDeliverableInProgres || !allShapesAssociated || !isPackageDetailValid || containsDraftLayers || isShapeInProgress;
    })
  );

  // Package information for edit mode
  get package() {
    return this.route.snapshot.data.package || null;
  }

  // Indicates if the component is in edit mode
  get editMode(): boolean {
    return this.route.snapshot.data.editMode || false;
  }

  isPackageSaved = false;
  isPackagePublished = false;
  savePackageTimeStamp: string;
  showLoader = false;
  step = 1;
  billingAccountID = '';

  public formGroup: FormGroup = new FormGroup({
    packageName: new FormControl('', [
      Validators.required,
      Validators.pattern('^[a-zA-Z0-9]{1}.*'),
      Validators.maxLength(PACKAGE_NAME_MAX_LENGTH)
    ])
  });

  // Configuration needed for gis-canvas component
  public gisSettings: IGisSettings = {
    config: null,
    partition: null,
    appKey: null,
    deploymentUrl: null,
    token: null
  };
  // Keep all the configuration from settings service
  private config: IMapSettings;

  // GIS Canvas
  public gisLayers;
  public userName = '';
  public gisMapLayersInitiated = false;
  public showMapLoaderOverlay = true;

  //Subscriptions
  public subscription = new Subscription();

  constructor(
    private metadataService: MetadataService,
    private settingsService: SettingsService,
    private secureEnvironmentService: SecureEnvironmentService,
    private authCodeFlowService: AuthCodeFlowService,
    private gisSearchResultActionService: GisSearchResultActionService,
    private gisMapLargeService: GisMapLargeService,
    private gisLayerPanelService: GisLayerPanelService,
    @Inject(DELFI_USER_CONTEXT) private readonly userContext: ContextModel,
    private shareDataService: ShareDataService,
    private dataPackagesService: DataPackagesService,
    private readonly notificationService: NotificationService,
    private fileUploaderService: FileUploaderService,
    private router: Router,
    private route: ActivatedRoute,
    private googleAnalyticsService: GoogleAnalyticsService
  ) {
    this.billingAccountID = this.userContext.crmAccountId;
    if (sessionStorage.getItem('layerConfigSession')) {
      sessionStorage.removeItem('layerConfigSession');
    }
  }

  public ngOnInit(): void {
    if (this.editMode) {
      this.googleAnalyticsService.pageView('/package/edit', 'package_edit_view');
    } else {
      this.googleAnalyticsService.pageView('/package/create', 'package_create_view');
    }
    // Get configuration to load the application
    zip(this.metadataService.metadata$, this.settingsService.getSettings(), this.authCodeFlowService.getUser()).subscribe(
      ([metadata, config, user]: [ICategory[], IMapSettings, AuthUser]) => {
        this.setMapConfiguration(metadata, config, user, true);
      }
    );

    this.shareDataService.isMRCreated$.subscribe((isMRDone: boolean) => {
      if (isMRDone && this._state.id) {
        this.setGisLayers(this._state.id);
      }
    });

    this.checkComponentMode();

    if(this.package) {
      this.disableButtons(this.package.status);
    }

    this.showBanner();
  }

  private generateGisConfig(config: IMapSettings, mlDebug: boolean) {
    this.config = {
      ...config,
      gisCanvas: {
        ...config.gisCanvas,
        mlControls: mlDebug,
        gisOnloadHiddenLayers: false
      }
    };
    this.gisSettings.config = this.config.gisCanvas;
  }

  private setMapConfiguration(metadata, config, user, mlDebug): void {
    this.gisSettings.partition = this.secureEnvironmentService.secureEnvironment.xchange.mlAccount;
    this.gisSettings.appKey = this.secureEnvironmentService.secureEnvironment.app.key;
    this.gisSettings.deploymentUrl = this.secureEnvironmentService.secureEnvironment.map.deploymentUrl;

    //updating table name
    this.updateTableNames(config, metadata);

    this.generateGisConfig(config, mlDebug);
    // Set metadata for the common component
    this.gisSearchResultActionService.setMetaData(metadata);

    // Set auth
    this.gisSettings.token = user.gisToken;
    this.userName = user.name;

    this.gisMapLargeService.layersChange$.subscribe((layers) => {
      // Initialize layers configuration
      this.gisLayers = this.gisLayerPanelService.initializeLayerPanel(layers, metadata);
      if (layers.length) {
        this.hideLoadingScreen();
      }

      // First try to pass the package id to avoid issues coming from package detail page
      this.setGisLayers(this._state.id || '');
    });
  }

  public updateTableNames(config, metadata) {
    config.gisCanvas?.gisMap.layersConfiguration.forEach((layer) => {
      const tableName = layer.tableInfo.table.name.split('/')[1];
      layer.tableInfo.table.name = `${this.billingAccountID}/${tableName}`;
      layer.tableInfo.where = [[{ col: 'dataPackageId', test: 'Equal', value: 'null' }]];
    });
    metadata.forEach((layer) => {
      const tableName = layer.mapLargeTable.split('/')[1];
      layer.mapLargeTable = `${this.billingAccountID}/${tableName}`;
    });
  }

  private setGisLayers(dataPackageId: string): void {
    GisCanvas.showGisIndecator('isBusyIndicator');

    this.gisLayers = this.gisLayers.map((layer: any) => {
      return {
        ...layer,
        filter: {
          ...layer.filter,
          isAnyAttributeSelected: true
        },
        originalOptions: {
          ...layer.originalOptions,
          query: {
            ...layer.originalOptions.query,
            where: [
              [
                { col: 'dataPackageId', test: 'EqualAny', value: dataPackageId },
                { col: 'dataPackageId', test: 'EqualNot', value: '' }
              ]
            ]
          }
        }
      };
    });

    setTimeout(
      () => {
        this.gisMapLargeService.reloadLayers(this.gisLayers?.map((l) => l.originalOptions)).subscribe(() => {
          this.gisMapLargeService.map.zoomToExtents();
          GisCanvas.hideGisIndecator('isBusyIndicator');
        });
      },
      dataPackageId ? 5000 : 0
    );
  }

  public hideLoadingScreen(): void {
    this.gisMapLayersInitiated = true;
    // With gisMapLayersInitiated above set to true, give some time below before removing the overlay.
    setTimeout(() => {
      this.showMapLoaderOverlay = false;
    }, 1000);
  }

  // Handler for package details button
  public goToPackageDetails() {
    if (this._state.id && this.isPackageSaved) {
      this.step = 2;
      this.notificationService.close();
    }
  }

  public onGoBack() {
    this.step = 1;
    this.showBanner();
  }

  public onGoHome() {
    this.router.navigateByUrl('/vendor/datapackage');
    this.notificationService.close();
  }

  // Handler for save package as draft
  public saveAsDraft() {
    if (this.formGroup.invalid) {
      this.formGroup.controls.packageName.markAsTouched();
      return;
    }

    this.showLoader = true;
    const packageName = (this.formGroup.controls.packageName.value as string).trim();

    let saveEndpoint$ = this.dataPackagesService.createDataPackage(packageName);

    if (this.editMode || this._state.id) {
      const payload = {
        dataPackageId: this._state.id,
        dataPackageName: packageName
      };
      saveEndpoint$ = this.dataPackagesService.updatePackageName(payload);
    }

    saveEndpoint$.subscribe(
      (res: ICreateDataPackageResponse) => {
        if (res?.dataPackageId) {
          this.updateState({
            ...this._state,
            id: res.dataPackageId,
            name: packageName
          });
          this.savePackageTimeStamp = new Date().toUTCString();
          this.isPackageSaved = true;
          this.showLoader = false;
        }
      },
      (err) => {
        this.notificationService.send({
          severity: 'Error',
          title: 'Error',
          message: 'Something went wrong, please try again later.'
        });
        this.showLoader = false;
      }
    );
  }

  public onConfirmAndPublish(): void {
    this.showLoader = true;
    this.dataPackagesService
      .publishPackage(this._state.id)
      .pipe(
        catchError((error) => {
          this.showLoader = false;
          this.notificationService.send({
            severity: 'Error',
            title: 'Error',
            message: 'Something went wrong publishing the package.'
          });
          return of('error');
        })
      )
      .subscribe((response) => {
        this.showLoader = false;
        if (response !== 'error') {
          this.notificationService.send({
            severity: 'Success',
            title: 'Success',
            message: 'The package has been published.'
          });
          this.googleAnalyticsService.gtag('event', 'publish_package', {
            billingAccountID: this.billingAccountID,
            packageId: this._state.id,
            name: this._state.name,
            dataTypes: this._state.dataTypes,
            price: this._state.price.price,
            durationTerm: this._state.price.duration,
            shapes: this._state.files.shapes,
            deliverables: this._state.files.deliverables
          });
          this.router.navigateByUrl('/vendor/datapackage');
        }
      });
  }

  public async onShapeUpload({ file, dataType }: { file: File; dataType: string }): Promise<void> {
    const fileId = await this.fileUploaderService.upload(this._state.id, dataType, file, FileType.Shape).pipe(take(1)).toPromise();

    // Save the file id into the state
    this.updateState({
      ...this._state,
      files: {
        ...this._state.files,
        shapes: [...this._state.files.shapes, fileId]
      }
    });

    // Add handler to the file id when upload finish
    this.fileUploaderService
      .getFile(fileId)
      .pipe(
        filter(Boolean),
        filter((f: IFile) => !f.associatedId && f.progress.completed && !f.progress.associated),
        distinctUntilChanged()
      )
      .subscribe((fileObject) => {
        this.createMR(dataType, fileObject);
      });
  }

  public createMR(type: string, { parentId, id }: IFile) {
    this.dataPackagesService
      .createMarketingRepresentation(parentId, { type, fileId: id })
      .pipe(
        tap(({ marketingRepresentationId }) => {
          this.fileUploaderService.updateAssociatedId(id, marketingRepresentationId);
        }),
        switchMap(() => this.dataTypes$),
        first()
      )
      .subscribe((dataTypes) => {
        this.shareDataService.setIsMRCreated(true);
        this.fileUploaderService.updateProgress(id, { associated: true });
        dataTypes.forEach((dType) => {
          if (dType.type === type) {
            dType.hasShapeUploaded = true;
          }
        });
        this.updateState({
          ...this._state,
          dataTypes: [...dataTypes]
        });
        this.notificationService.close();
      });
  }

  public async onDeliverableUpload(file: File): Promise<void> {
    const fileId = await this.fileUploaderService.upload(this._state.id, null, file, FileType.Deliverable).pipe(take(1)).toPromise();

    // Save the file id into the state
    this.updateState({
      ...this._state,
      files: {
        ...this._state.files,
        deliverables: [...this._state.files.deliverables, fileId]
      }
    });

    // Add handler to the file id when upload finish
    this.fileUploaderService
      .getFile(fileId)
      .pipe(
        filter(Boolean),
        filter((f: IFile) => f.progress.completed && !f.progress.associated),
        distinctUntilChanged()
      )
      .subscribe((fileObject) => {
        this.dataPackagesService.associateDeliverable(fileObject.parentId, { dataType: 'seismic3d', recordId: fileObject.id }).subscribe(() => {
          this.fileUploaderService.updateProgress(fileObject.id, { associated: true });
        });
      });
  }

  public onSaveProfile(payload: ISavePackageProfileRequest): void {
    const { profile, price } = transformPackagePayload(payload);

    this.updateState({
      ...this._state,
      profile,
      price
    });
  }

  public onDataTypesChange(dataTypes: Array<IDataType>) {
    this.updateState({
      ...this._state,
      dataTypes: dataTypes
    });
  }

  public updateState(state: IPackageState): void {
    this._state = state;
    this.state.next(this._state);
  }

  public checkComponentMode(): void {
    // Check if is edition
    if (this.editMode) {
      // Update package name form control
      this.formGroup.setValue({
        packageName: this.package.name
      });

      // Update state with current information
      const { deliverables, marketingRepresentations, price } = this.package;
      const { regions, overview, featuresAndContents, media, documents, opportunity } = this.package.profile;

      this.updateState({
        ...this._state,
        editing: true,
        id: this.package.id,
        name: this.package.name,
        profile: {
          regions,
          overview,
          featuresAndContents,
          media,
          documents,
          opportunity
        },
        price,
        files: {
          ...this._state.files,
          shapes: marketingRepresentations.map((mr) => mr.fileId),
          deliverables: deliverables.map((d) => d.recordId)
        },
        dataTypes: marketingRepresentations.length
          ? this.mapMarketingRepresentationsToDataTypes(marketingRepresentations)
          : [...initialState.dataTypes]
      });

      this.isPackageSaved = true;
    }
  }

  private mapMarketingRepresentationsToDataTypes(mRepresentations) {
    return mRepresentations.reduce((acc, val) => {
      if (!acc.find(accObj => accObj.type === val.type)) {
        acc.push({type: val.type, hasShapeUploaded: !!val.fileId});
      }

      return acc;
    }, []);
  }

  private getShapeFiles(fileIds: Array<string>): Observable<Array<IFile>> {
    if (!this._state.editing) {
      return this.fileUploaderService.getFiles(fileIds);
    }

    // Obtain new file ids to populate the state
    const previousFileIds = this.package.marketingRepresentations.map((mr) => mr.fileId);
    const newFileIds = fileIds.filter((id) => !previousFileIds.includes(id));

    const existingFiles = this.package.marketingRepresentations
      .filter((mr) => fileIds.includes(mr.fileId))
      .map((mr: IMarketingRepresentation) => {
        return {
          id: mr.fileId,
          parentId: this.package.id,
          associatedId: mr.marketingRepresentationId,
          group: mr.type,
          name: mr.fileName,
          progress: {
            percentage: 100,
            started: true,
            canceled: false,
            completed: true,
            associated: true
          },
          type: FileType.Shape,
          file: null
        };
      });

    return this.fileUploaderService.getFiles(newFileIds).pipe(map((newFiles) => [...newFiles, ...existingFiles]));
  }

  private getDeliverables(fileIds: Array<string>): Observable<Array<IFile>> {
    if (!this._state.editing) {
      return this.fileUploaderService.getFiles(fileIds);
    }

    // Obtain new file ids to populate the state
    const previousFileIds = this.package.deliverables.map((d) => d.recordId);
    const newFileIds = fileIds.filter((id) => !previousFileIds.includes(id));

    // Populate existing file ids
    const existingFiles = this.package.deliverables
    .filter((d) => fileIds.includes(d.recordId))
    .map((d: IDataItem) => {
      return {
        id: d.recordId,
        parentId: this.package.id,
        group: '',
        name: d.fileName || d.recordId,
        progress: {
          percentage: 100,
          started: true,
          canceled: false,
          completed: true,
          associated: true
        },
        type: FileType.Deliverable,
        file: null
      };
    });

    return this.fileUploaderService.getFiles(newFileIds).pipe(map((newFiles) => [...newFiles, ...existingFiles]));
  }

  public canLeave(): boolean {
    if (this.step === 1) {
      return this.formGroup.value.packageName === this._state.name;
    }
    return this.packageEditor.canLeave;
  }

  public isPriceValid(priceObject: any): boolean {
    if (priceObject.onRequest === false) {
      return priceObject.price !== 0 && priceObject.duration !== 0;
    }

    if (priceObject.onRequest === true) {
      return priceObject.price === 0 && priceObject.duration === 0;
    }

    return false;
  }

  public isProfileValid(profile: any): boolean {
    return (
      profile.featuresAndContents.keypoints !== [''] &&
      profile.overview.description !== '' &&
      profile.overview.keypoints !== [''] &&
      profile.regions.length > 0 &&
      profile.media.length > 0
    );
  }

  public showBanner() {
    this.subscription.add(
      this.isShapeInProgress$.pipe(distinctUntilChanged()).subscribe((response) => {
        if (response) {
          this.showNotificationMessage(
            'Info',
            '',
            'Your file is still loading. <br/> This will show up on the map once the upload is completed.',
            'banner'
          );
        }
      })
    );
  }

  public onCancelUpload(file: any) {
    this.fileUploaderService.cancelUpload(file.fileId, this.deleteFile(file));
  }

  public deleteFile(file: IPartialFile) {
    // Deletes marketing representation files
    if (file.type === FileType.Shape) {
      return () => {
        this.dataPackagesService
          .deleteMarketingRepresentation(file.associatedId)
          .pipe(
            tap(() => {
              this.updateShapesState(file.fileId);
            }),
            switchMap(() =>
              this.shapesGroup$.pipe(
                first(),
                map((shapeGroup) => (shapeGroup[file.group] ? null : file.group))
              )
            )
          )
          .subscribe((response) => {
            this.updateDataTypeState(response);
            this.setGisLayers(this._state.id);
            this.showNotificationMessage(
              'Success',
              'Success',
              'It will take a few minutes for your deleted file to be removed from the map, you can proceed other actions during this time.',
              'toast'
            );
          });
      };
    }

    // Deletes deliverable files
    if (file.type === FileType.Deliverable) {
      return () => {
        this.dataPackagesService
          .deleteAssociatedDeliverables(this._state.id, file.fileId)
          .pipe(
            tap(() => {
              this.updateDeliverablesState(file.fileId);
            })
          )
          .subscribe(() => {
            this.showNotificationMessage('Success', 'Success', 'Your deliverable file has been succesfully deleted', 'toast');
          });
      };
    }
  }

  public updateShapesState(fileId: string) {
    // Removes the deleted file id from state
    const shapes = [...this._state.files.shapes];
    this.updateState({
      ...this._state,
      files: {
        ...this._state.files,
        shapes: shapes.filter((id) => id !== fileId)
      }
    });
  }

  public updateDeliverablesState(fileId: string) {
    // Removes the deleted file id from state
    const deliverables = [...this._state.files.deliverables];
    this.updateState({
      ...this._state,
      files: {
        ...this._state.files,
        deliverables: deliverables.filter((id) => id !== fileId)
      }
    });
  }

  public updateDataTypeState(response: string) {
    // Removes the deleted dataType from state
    if (response) {
      let stateDataTypes = [...this._state.dataTypes];
      if (stateDataTypes.length > 1) {
        stateDataTypes = stateDataTypes.filter((dataType) => dataType.type !== response);
      } else {
        stateDataTypes[0].hasShapeUploaded = false;
      }
      this.updateState({
        ...this._state,
        dataTypes: stateDataTypes
      });
    }
  }

  public showNotificationMessage(
    severity: INotificationOptions['severity'],
    title: string,
    message: string,
    target: INotificationOptions['target']
  ) {
    this.showLoader = false;
    this.notificationService.send({
      severity,
      title,
      message,
      target
    });
  }

  public onCloseDataTypeSection(event) {
    let stateDataTypes = [...this._state.dataTypes];
    stateDataTypes = stateDataTypes.filter((dataType) => dataType.type !== event.dataTypes[event.i].type);
    this.updateState({
      ...this._state,
      dataTypes: stateDataTypes
    });
  }

  public disableButtons(packageStatus: string) {
    if(packageStatus === 'Published') {
      this.formGroup.controls['packageName'].disable();
      this.isPackagePublished = true;
    }
  }

  public ngOnDestroy() {
    this.updateState(initialState);
    this.subscription.unsubscribe();
  }
}
