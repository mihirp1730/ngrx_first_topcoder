import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { GeoJsonFileValidatorService, IValidationErrorResponse, ShapeFileValidatorService } from '@apollo/app/shape-file-validator';
import { NotificationService } from '@apollo/app/ui/notification';
import { MetadataService } from '@apollo/app/metadata';
import { SlbDropzoneComponent } from '@slb-dls/angular-material/dropzone';

import { IMaxFileConfig } from '../interfaces';

const INVALID_CHARS_IN_FILENAME = "[()!,'\"+=<>&$?*#:;%{}|^~\\[\\]\\`]";
const OPPORTUNITY_SUPPORTED_EXTENSIONS = '.zip,.geojson'; 

@Component({
  selector: 'apollo-upload-widget',
  templateUrl: './upload-widget.component.html',
  styleUrls: ['./upload-widget.component.scss']
})
export class UploadWidgetComponent implements AfterViewInit, OnChanges, OnInit {
  @Input() widgetStyle = 'button';
  @Input() multipleFiles = false;
  @Input() maxFileSizes: IMaxFileConfig;
  @Input() extensions: string;
  @Input() canUpload: boolean;
  @Input() selectedDataType: string;

  @Output() startUpload: EventEmitter<File> = new EventEmitter<File>();

  @ViewChild('fileInput') fileInput: ElementRef;
  allowedDataTypes = ['Seismic3dSurvey', 'Well', 'Seismic2dSurvey', 'Opportunity'];

  showLoader = false;
  private datalayerAndShapeInfo;
  constructor(
    private readonly notificationService: NotificationService,
    private readonly metadataService: MetadataService,
    private shapeFileValidatorService: ShapeFileValidatorService,
    private geoJsonFileValidatorService: GeoJsonFileValidatorService,
    private changeDetectorRef: ChangeDetectorRef
    ) {}

  public ngOnInit(): void {
    this.metadataService.marketingLayers$.subscribe((options) => {
      this.datalayerAndShapeInfo = options.map((option) => {
        return { layerName: option.layerName, shapeType: option.shapeType };
      });
    });
  }

  public ngAfterViewInit(): void {
    if(this.widgetStyle !== 'drag-drop'){
      this.fileInput.nativeElement.disabled = !this.canUpload;
    }
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['canUpload'] && !changes['canUpload'].firstChange && this.widgetStyle !== 'drag-drop') {
      // If there is a change in canUpload Input update the disable property of the input file
      this.fileInput.nativeElement.disabled = !this.canUpload;
    }
  }

  onFileSelected(fileList: FileList): void {
    const fileListAsArray = Array.from(fileList);
    if (this.shapeFileValidation(fileListAsArray)) {
      this.fileInput.nativeElement.value = '';
    }
  }
  
  shapeFileValidation(fileList: File[]): boolean {
    this.showLoader = true;
    for (const file of fileList) {
      const fileNameSplit = file.name.split('.');
      const fileExtension = fileNameSplit[fileNameSplit.length - 1];

      if (!this.isExtensionValid(fileExtension)) {
        const permittedExtensions = this.allowedDataTypes.includes(this.selectedDataType) ? OPPORTUNITY_SUPPORTED_EXTENSIONS : this.extensions;
        this.notificationService.send({
          severity: 'Error',
          title: 'Error',
          message: `File doesn't match the valid file extensions. We suppport ${permittedExtensions}`
        });
        this.showLoader = false;
        return;
      }
      const fileName = file.name.substr(0, file.name.lastIndexOf("."));
      if(this.isFileNameInvalid(fileName)) {
        this.notificationService.send({
          severity: 'Error',
          title: 'Invalid File name',
          message: `File name cannot have special characters. Please rename the file and try again.`
        });
        this.showLoader = false;
        return;
      }

      if (!this.isSizeValid(file.size, fileExtension)) {
        const maxFileSize = this.maxFileSizes[fileExtension] || this.maxFileSizes['generic'];
        this.notificationService.send({
          severity: 'Error',
          title: 'Error',
          message: `File exceed ${maxFileSize} MB`
        });
        this.showLoader = false;
        return;
      }

      const isGeoJsonFile = fileExtension.includes('geojson');

      if(this.selectedDataType && !isGeoJsonFile) {
        this.shapeFileValidatorService.initValidation(file, this.selectedDataType).then(() => {
          this.startUpload.emit(file);
        }).catch((err: IValidationErrorResponse) => {
          this.notificationService.send({
            severity: 'Error',
            title: 'Error',
            message: err.message
          });
        }).finally(() => {
          this.showLoader = false;
          // Promises are not able to detected by Zone.js
          // so we are manually triggering change detection to hide the loader.
          this.changeDetectorRef.detectChanges();
        });
      } else if(this.selectedDataType && isGeoJsonFile) {
        const shapeType = this.datalayerAndShapeInfo.filter((info) => info.layerName === this.selectedDataType).map((info) => info.shapeType).shift();
        this.geoJsonFileValidatorService.initValidation(file, shapeType).then(() => {
          this.startUpload.emit(file);
        }).catch((err) => {
          this.notificationService.send({
            severity: 'Error',
            title: 'Error',
            message: err.message
          });
        }).finally(() => {
          this.showLoader = false;
          // Promises are not able to detected by Zone.js
          // so we are manually triggering change detection to hide the loader.
          this.changeDetectorRef.detectChanges();
        });
      }
       else {
        this.showLoader = false;
        this.startUpload.emit(file);
      }

    }
    return true;
  }

  onSlbDropZoneFileSelected(fileList: File[], dropzoneComponent: SlbDropzoneComponent): void {
    this.shapeFileValidation(fileList);
    dropzoneComponent.clearAllFiles();
  }
  
  private getSizeInMB(bytes: number): number {
    return bytes / (1024 * 1024);
  }

  private isSizeValid(bytes: number, fileExtension: string): boolean {
    const fileSize = this.getSizeInMB(bytes);
    const maxFileSize = this.maxFileSizes[fileExtension] || this.maxFileSizes['generic'];
    return maxFileSize === -1 ? true : maxFileSize > fileSize;
  }

  private isExtensionValid(extension: string): boolean {
    const permittedExtensions = this.allowedDataTypes.includes(this.selectedDataType) ? OPPORTUNITY_SUPPORTED_EXTENSIONS : this.extensions;
    if (permittedExtensions === '*') {
      return true;
    }

    const extensions = permittedExtensions.split(',').map((item) => item.substring(1).toLocaleLowerCase().trim());
    return extensions.includes(extension.toLocaleLowerCase());
  }

  private isFileNameInvalid(fileName: string): boolean {
    const regExp = new RegExp(INVALID_CHARS_IN_FILENAME);
    return regExp.test(fileName);
  }
}
