import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { IMarketingRepresentation } from '@apollo/api/interfaces';
import { MetadataService } from '@apollo/app/metadata';
import { IFile, IMaxFileConfig } from '@apollo/app/upload-widget';
import { ModalComponent } from '@apollo/app/ui/notification';
import { BehaviorSubject, combineLatest, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { IDataType } from '../package-creator.interface';

export interface MapRepresentationOptions {
  icon: string;
  value: string;
  viewText: string;
  disabled: boolean;
}

@Component({
  selector: 'apollo-package-map-and-deliverables',
  templateUrl: './package-map-and-deliverables.component.html',
  styleUrls: ['./package-map-and-deliverables.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PackageMapAndDeliverablesComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @Input() packageId: string;
  @Input() marketingRepresentations: { [group: string]: Array<IFile> };
  @Input() dataTypesSelected: Array<IDataType>;
  @Input() deliverables: Array<IFile>;
  @Input() isPackageSaved = false;
  @Input() isPackagePublished: boolean;
  @Output() shapeUpload: EventEmitter<{ file: File; dataType: string }> = new EventEmitter<{ file: File; dataType: string }>();
  @Output() deliverableUpload: EventEmitter<File> = new EventEmitter<File>();
  @Output() dataTypesChange = new EventEmitter<Array<IDataType>>();
  @Output() cancelUpload: EventEmitter<string> = new EventEmitter<string>();
  @Output() closeDataType: EventEmitter<any> = new EventEmitter<any>();

  private dataTypesCollection: Array<IDataType> = [];
  extensions = '.zip,.geojson';
  maxFileSizes: IMaxFileConfig = {
    generic: 2048
  }

  extensionsDeliverable = '*';
  maxFileSizesDeliverable: IMaxFileConfig = {
    // Size -1 means we don't have size limit.
    generic: -1
  }

  public form: FormGroup;

  // Getter for the Form Array (Shape files)
  get dataTypes() {
    return this.form.get('dataTypes')['controls'] as Array<FormControl>;
  }

  public marketingRepresentationsCount = 0;
  public marketingRepresentationsInProgress = false;
  public deliverablesInProgress = false;
  private subscriptions: Subscription;
  public dataTypesSelected$ = new BehaviorSubject<Array<IDataType>>([]);

  public mapRepresentationOptions: Array<MapRepresentationOptions>;
  public mapRepresentationOptions$ = combineLatest([
    this.metadataService.marketingLayers$.pipe(map(PackageMapAndDeliverablesComponent.MapToRepresentationOption)),
    this.dataTypesSelected$
  ]).pipe(
    map(([options, dataTypesSelected]) =>
      options.map((opt) => {
        opt.disabled = !!dataTypesSelected.find(dType => dType.type === opt.value);
        return opt;
      })
    )
  );

  public static MapToRepresentationOption(marketingLayers: IMarketingRepresentation[]): MapRepresentationOptions[] {
    return marketingLayers.map((marketingLayer) => {
      const { layerName: value, displayName: viewText, icon } = marketingLayer;
      return {
        icon,
        value,
        viewText,
        disabled: false
      };
    });
  }

  constructor(
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    public metadataService: MetadataService,
    private dialog: MatDialog
  ) {
    this.form = this.fb.group({
      dataTypes: this.fb.array([])
    });
  }

  public ngOnInit() {
    this.subscriptions = new Subscription();

    // Get marketing available marketing representation options
    this.subscriptions.add(
      this.mapRepresentationOptions$.subscribe((options) => {
        this.mapRepresentationOptions = options;
      })
    );
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['marketingRepresentations']) {
      const files = [];
      this.marketingRepresentationsCount = 0;

      // Get count of marketing representations
      for (const property in this.marketingRepresentations) {
        const associtedFiles = this.marketingRepresentations[property].filter((file) => file.progress.associated);
        this.marketingRepresentationsCount += associtedFiles.length;
        files.push(...this.marketingRepresentations[property]);
      }

      // Check if there is any marketing representation in progress
      const filesInProgress = files
        .filter((file) => !file.progress.completed)
        .filter((file) => !file.progress.errorMessage)
        .filter((file) => !file.associatedId);
      this.marketingRepresentationsInProgress = filesInProgress.length > 0;
    }

    if (changes['deliverables']) {
      // Check if there is any deliverable in progress
      const filesInProgress = this.deliverables
        .filter((file) => !file.progress.completed)
        .filter((file) => !file.progress.errorMessage);
      this.deliverablesInProgress = filesInProgress.length > 0;
    }

    if (changes['dataTypesSelected']) {
      let formControls = [];
      this.dataTypesCollection = [];

      if (this.dataTypesSelected?.length) {
        this.dataTypesSelected$.next(this.dataTypesSelected);
        this.dataTypesCollection = [...this.dataTypesSelected];
        this.dataTypesSelected.forEach((type) => {
          formControls.push(new FormControl(type.type, [Validators.required]));
        });
      } else {
        formControls = [new FormControl('', [Validators.required])];
        this.dataTypesCollection.push({ type: '', hasShapeUploaded: false });
      }

      this.form.setControl('dataTypes',
        this.fb.array(formControls)
      )
    }
  }

  public ngAfterViewInit(): void {
    this.cd.detectChanges();
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public onDataTypeChange(dataTypeIndex: number, event: MatSelectChange) {
    this.dataTypesCollection[dataTypeIndex].type = event.value;
    this.dataTypesChange.emit(this.dataTypesCollection);
  }

  async onMRStartUpload(file: File, index: number): Promise<void> {
    const { dataTypes } = this.form.value;
    const dataTypeSelected = dataTypes[index];

    this.dataTypesSelected$.next([...this.dataTypesSelected, dataTypeSelected]);

    this.shapeUpload.emit({ file, dataType: dataTypeSelected });
  }

  async onDeliverableStartUpload(file: File): Promise<void> {
    this.deliverableUpload.emit(file);
  }

  onCancelUpload(file: any): void { 
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.panelClass = 'delete-file-modal-panel';
    dialogConfig.disableClose = false;
    dialogConfig.data = {
      options: {
        title: 'Delete File',
        content: 'This will permanently remove the file from your package. This action cannot be undone.',
        confirmButtonText: 'Delete File',
        cancelButtonText: 'Cancel'
      }
    };
    const dialogRef = this.dialog.open(ModalComponent, dialogConfig);

    dialogRef.componentInstance.yesClickEvent.subscribe(() => {
      this.cancelUpload.emit(file);
    });
  }

  public addDataType(): void {
    if (this.dataTypes.length < this.mapRepresentationOptions.length) {
      this.dataTypes.push(this.fb.control('', [Validators.required]));
      this.dataTypesCollection.push({type: '', hasShapeUploaded: false} as IDataType);
      this.dataTypesChange.emit(this.dataTypesCollection);
    }
  }

  public closeDataTypeSection(index: number) {
    this.closeDataType.emit({i: index, dataTypes: this.dataTypesCollection});
  }
}
