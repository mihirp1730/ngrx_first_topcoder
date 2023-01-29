import * as commonSelectors from '../../../shared/state/selectors/common.selectors';
import * as opportunityActions from '../../state/actions/opportunity.actions';
import * as opportunitySelectors from '../../state/selectors/opportunity.selectors';

import { Component, OnDestroy, OnInit } from '@angular/core';
import { FileType, FileUploaderService, IFile, IMaxFileConfig } from '@apollo/app/upload-widget';
import { MapRepresentationOptions, OpportunityService, OpportunityStatus } from '@apollo/app/services/opportunity';
import { MessageService, SlbMessage, SlbSeverity } from '@slb-dls/angular-material/notification';
import { Subject, Subscription, firstValueFrom, takeUntil } from 'rxjs';
import { combineLatestWith, distinctUntilChanged, filter, map, take, tap } from 'rxjs/operators';

import { AssetShapeFillStyle } from '../../../shared/state/common.state';
import { GisMapLargeService } from '@slb-innersource/gis-canvas';
import { MetadataService } from '@apollo/app/metadata';
import { ShareDataService } from '../../../shared/services/share-data.service';
import { Store } from '@ngrx/store';

@Component({
  selector: 'apollo-asset-shape',
  templateUrl: './asset-shape.component.html',
  styleUrls: ['./asset-shape.component.scss']
})
export class AssetShapeComponent implements OnInit, OnDestroy {
  notifier = new Subject<void>();
  public maxNumberUploaderTypes;
  public mapRepresentationOptions: Array<MapRepresentationOptions>;
  public mapRepresentationOptions$;
  public mapRepresentationIdList = [];
  public dataTypes = [];
  public mrStartUploadDetails = [];
  public isPublsihed: boolean;
  public deletingShapeType: string;
  public removeGroup: boolean;
  opportunityId: string;
  subscriptions = new Subscription();
  shapeUploaders = [{ type: 'Opportunity', visible: true }]; //default minimum
  extensions = '*';
  layersLoaded = false;
  maxFileSizes: IMaxFileConfig = {
    generic: 2048
  };
  readonly opportunityStatusEnum = OpportunityStatus;
  isGlobalVisible = true;
  uploadEnabled$ = this.store.select(opportunitySelectors.selectCreatedOpportunityId).pipe(
    map((id) => {
      this.opportunityId = id || '';
      return id ? true : false;
    })
  );
  selectIsGlobalVisible$ = this.store
    .select(opportunitySelectors.selectIsGlobalVisible)
    .pipe(
      map((isGlobalVisible) => {
        this.isGlobalVisible = isGlobalVisible;
      })
    )
    .subscribe();

  readonly published$ = this.store
    .select(opportunitySelectors.selectOpportunity)
    .pipe(
      tap((data) => {
        this.isPublsihed = data?.opportunityStatus === this.opportunityStatusEnum.Published ? true : false;
      })
    )
    .subscribe();

  assetShapeFillStyle$ = this.store.select(commonSelectors.selectAssetShapeFillStyles);
  selectedAssetType: AssetShapeFillStyle;
  completedMRUploadDetails$ = this.store.select(opportunitySelectors.selectMapRepresentationDetails).pipe(
    map((data) => {
      this.mapRepresentationIdList = data;
      return data;
    })
  );

  readonly removeShapeUploader$ = this.store.select(opportunitySelectors.selectMapRepresentationDetails).subscribe((data) => {
    if (
      this.removeGroup &&
      this.deletingShapeType &&
      this.deletingShapeType !== 'Opportunity' &&
      !data.some((item) => item.type === this.deletingShapeType)
    ) {
      this.removeShapeType();
    }
  });

  uploaderConfig = this.completedMRUploadDetails$.subscribe((data) => {
    {
      data.forEach((item) => {
        this.dataTypes.forEach((mrOption) => {
          if (item.type === mrOption.value && !this.shapeUploaders.find((uploaderOption) => uploaderOption.type === mrOption.value)) {
            this.shapeUploaders.push({ type: mrOption.value, visible: true });
          }
        });
      });
    }
  });

  constructor(
    private fileUploaderService: FileUploaderService,
    private opportunityService: OpportunityService,
    private metadataService: MetadataService,
    private shareDataService: ShareDataService,
    public messageService: MessageService,
    public readonly store: Store,
    private mapLargeService: GisMapLargeService
  ) {}

  public ngOnInit() {
    this.subscriptions.add(
      this.metadataService.marketingLayers$.subscribe((options) => {
        this.dataTypes = options.map((option) => {
          const { layerName: value, displayName: viewText, icon } = option;
          return {
            icon,
            value,
            viewText,
            disabled: false
          };
        });
      })
    );

    this.subscriptions.add(
      this.mapLargeService.layersChange$.subscribe(() => {
        this.layersLoaded = true;
      })
    );
    this.setFillColorForAsset();
  }

  private updateUploadDetails(progressData) {
    const idx = this.mrStartUploadDetails.findIndex((fileDetails) => fileDetails.id === progressData.id);
    if (idx > -1) {
      this.mrStartUploadDetails[idx] = progressData;
    } else {
      this.mrStartUploadDetails.push(progressData);
    }
  }

  async onMRStartUpload(file: File, shapeType: string): Promise<void> {
    const fileId = await firstValueFrom(this.fileUploaderService.upload(this.opportunityId, shapeType, file, FileType.Shape).pipe(take(1)));
    // Add handler to the file id when upload finish
    this.fileUploaderService
      .getFile(fileId)
      .pipe(
        tap((progressData) => {
          this.updateUploadDetails(progressData);
        }),
        filter(Boolean),
        filter((f: IFile) => f.progress.completed && !f.progress.associated),
        take(1)
      )
      .subscribe((fileObject) => {
        this.createMR(shapeType, fileObject);
      });
  }

  public createMR(type: string, { id, name }: IFile) {
    this.opportunityService.createMarketingRepresentation(this.opportunityId, { type, fileId: id }).subscribe({
      next: (response) => {
        this.fileUploaderService.updateAssociatedId(id, response.mapRepresentationId);
        this.shareDataService.setIsMRCreated(true);
        const mapRepresentation = { mapRepresentationId: response.mapRepresentationId, type: type, fileName: name, fileId: id };
        this.store.dispatch(opportunityActions.addMapRepresentation({ mapRepresentation }));
        const currentState = this.shapeUploaders.find((shapeUploader) => shapeUploader.type === mapRepresentation['type']);
        if (!this.isGlobalVisible || (currentState && currentState.visible === false && !mapRepresentation['hidden'])) {
          this.store.dispatch(opportunityActions.addHiddenMR({ mapRepresentation }));
        }
        this.fileUploaderService.updateProgress(id, { associated: true });
      }
    });

    this.fileUploaderService
      .getFile(id)
      .pipe(
        tap((progressData) => {
          this.updateUploadDetails(progressData);
        }),
        filter(Boolean),
        filter((f: IFile) => f.progress.completed && f.progress.associated),
        take(1)
      )
      .subscribe();
  }

  deleteExistingMRFile(mapRepresentationId: string, shapeType) {
    const confirmationDeleteAssetShape: SlbMessage = {
      severity: SlbSeverity.Info,
      target: 'modal',
      summary: 'Delete Shape file',
      detail: 'This will delete the selected shape file and the associated map representation, Do you want to continue?',
      asHtml: true,
      data: {
        mapRepresentationId
      },
      config: {
        primaryAction: 'Yes',
        secondaryAction: 'No',
        primaryActionCallback: (data) => {
          this.deletingShapeType = shapeType;
          this.deleteMapRepresentation(data);
        }
      }
    };
    this.messageService.add(confirmationDeleteAssetShape);
  }

  deleteMapRepresentation(data) {
    this.store.dispatch(
      opportunityActions.deleteMapRepresentation({ opportunityId: this.opportunityId, mapRepresentationId: data.mapRepresentationId })
    );
  }

  addDataType() {
    if (this.shapeUploaders.length < this.dataTypes.length) {
      this.shapeUploaders.push({ type: '', visible: true });
    }
  }

  shapeTypeSelection(event, index) {
    const alreadySelected = this.shapeUploaders.find((o) => o.type === event.value);
    if (!alreadySelected) {
      this.shapeUploaders[index].type = event.value;
    } else {
      alreadySelected.visible = this.isGlobalVisible;
    }
  }

  setFillColorForAsset(): void {
    this.store
      .select(opportunitySelectors.selectOpportunityDetails)
      .pipe(combineLatestWith(this.assetShapeFillStyle$), distinctUntilChanged(), takeUntil(this.notifier))
      .subscribe(([oppDetails, assetFillStyles]) => {
        this.selectedAssetType = assetFillStyles.find((asset) => asset.assetType === oppDetails.assetType[0]);
      });
  }

  toggleGlobalOption() {
    if (this.isGlobalVisible) {
      this.store.dispatch(opportunityActions.hideAllLayers());
      this.shapeUploaders.forEach((e) => {
        e.visible = false;
        return e;
      });
    } else {
      this.store.dispatch(opportunityActions.showAllLayers());
      this.shapeUploaders.forEach((e) => {
        e.visible = true;
        return e;
      });
    }
  }
  toggleLayer(layer) {
    const layerSetting = this.mapLargeService.settingsService.layersConfiguration.find((setting) => {
      return setting['id'] === layer.type;
    });

    const layerToToggle = this.mapLargeService.map.layers.find((mapLayer) => {
      return mapLayer.originalOptions.name === layerSetting?.name;
    });

    if (layerToToggle?.visible?.zzfieldValue) {
      layerToToggle.hide();
      this.store.dispatch(opportunityActions.addHiddenLayer({ layerName: layerToToggle.originalOptions.name }));
    } else {
      layerToToggle?.show();
      this.store.dispatch(opportunityActions.removeHiddenLayer({ layerName: layerToToggle?.originalOptions.name }));
    }
    layer.visible = layerToToggle?.visible.zzfieldValue;
  }

  toggleMR(mapRepresentation) {
    const layerSetting = this.mapLargeService.settingsService.layersConfiguration.find((setting) => {
      return setting['id'] === mapRepresentation.type;
    });

    const layerToToggle = this.mapLargeService.map.layers.find((mapLayer) => {
      return mapLayer.originalOptions.name === layerSetting?.name;
    });

    if (mapRepresentation.hidden) {
      layerToToggle?.show();
      this.shapeUploaders = this.shapeUploaders.map((e) => {
        if (e.type === mapRepresentation.type) {
          e.visible = true;
        }
        return e;
      });
      this.store.dispatch(opportunityActions.removeHiddenMR({ mapRepresentation }));
    } else {
      this.store.dispatch(opportunityActions.addHiddenMR({ mapRepresentation }));
      let allHidden = true;
      this.mapRepresentationIdList.forEach((mr) => {
        if (mr.type === mapRepresentation.type && mr.hidden !== true) {
          allHidden = false;
        }
      });
      if (allHidden) {
        layerToToggle?.hide();
        this.shapeUploaders = this.shapeUploaders.map((e) => {
          if (e.type === mapRepresentation.type) {
            e.visible = false;
          }
          return e;
        });
        this.store.dispatch(opportunityActions.addHiddenLayer({ layerName: layerToToggle?.originalOptions?.name }));
      }
    }
  }

  deleteMapRepresentationFilesByGroup(shapeType) {
    this.deletingShapeType = shapeType;
    this.removeGroup = true;
    const mapRepresentationIds = this.mapRepresentationIdList
      .filter((item) => {
        if (item.type === shapeType) {
          if (this.isGlobalVisible) {
            this.store.dispatch(opportunityActions.removeHiddenMR({ mapRepresentation: item }));
          }
          return item.mapRepresentationId;
        }
      })
      .map((item) => item.mapRepresentationId);

    if (mapRepresentationIds.length === 0 && this.deletingShapeType !== 'Opportunity') {
      this.removeShapeType();
      return;
    }

    mapRepresentationIds.forEach((id) => {
      if (id) {
        const data = { mapRepresentationId: id };
        this.deleteMapRepresentation(data);
      }
    });
  }

  private removeShapeType() {
    this.shapeUploaders.splice(
      this.shapeUploaders.findIndex((item) => item.type === this.deletingShapeType),
      1
    );
    this.deletingShapeType = '';
    this.removeGroup = false;
  }

  optionConsumed(shapeType): boolean {
    return (
      this.shapeUploaders.map(({ type }) => type).includes(shapeType) &&
      (this.mapRepresentationIdList.map(({ type }) => type).includes(shapeType) ||
        this.mrStartUploadDetails.map(({ group }) => group).includes(shapeType))
    );
  }

  doUploadersHaveFiles(): boolean {
    const requiredShapes = [...new Set(this.shapeUploaders.map(({ type }) => type))].sort();
    const uploadedShapes = [...new Set(this.mapRepresentationIdList.map(({ type }) => type))].sort();
    return JSON.stringify(requiredShapes) !== JSON.stringify(uploadedShapes) || requiredShapes.length === this.dataTypes.length;
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.notifier.next();
    this.notifier.complete();
  }
}
