import {
  Component,
  EventEmitter,
  forwardRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewEncapsulation
} from '@angular/core';
import { ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validator } from '@angular/forms';
import { IMediaFile } from '../media-upload.interface';
import { IFile, IMediaUploadInputProps, MediaDocumentUploaderService } from '@apollo/app/services/media-document-uploader';
import { NotificationService } from '@apollo/app/ui/notification';
import { SlbDropzoneComponent } from '@slb-dls/angular-material/dropzone';
import { forkJoin, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

const INVALID_CHARS_IN_FILENAME = '[()!,\'"+=<>&$?*#:;%{}|^~\\[\\]\\`]';
const VALID_FILE_TYPES = ['jpeg', 'jpg', 'png', 'jfif'];
const VALID_FILE_SIZE_MAX = 10485760;
const VALID_FILE_SIZE_MAX_TEXT = '10MB';

@Component({
  selector: 'apollo-media-upload-preview',
  templateUrl: './media-upload-preview.component.html',
  styleUrls: ['./media-upload-preview.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MediaUploadPreviewComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => MediaUploadPreviewComponent),
      multi: true
    }
  ]
})
export class MediaUploadPreviewComponent implements OnInit, OnChanges, OnDestroy, ControlValueAccessor, Validator {
  @Input() options: IMediaUploadInputProps = {
    multiple: false,
    extensions: '*',
    disabled: false
  };
  @Input() uploaderError = false;
  showLoader = false;
  files: IFile[] = [];
  private subscriptions = new Subscription();

  private _files: IFile[] = [];
  @Output() uploadedFileIds: EventEmitter<IMediaFile[]> = new EventEmitter();

  @Input() existingMediaFileList: IMediaFile[] = [];
  @Input() isPackagePublished;
  @Input() componentIdentifier: string;

  constructor(
    public mediaDocumentUploaderService: MediaDocumentUploaderService,
    private readonly notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.subscriptions.add(
      this.mediaDocumentUploaderService.filesQueue$
        .pipe(map((files) => files.filter((f) => this.componentIdentifier && this.componentIdentifier === f.componentIdentifier)))
        .pipe(map((files) => files.filter((f) => f.progress.completed)))
        .pipe(map((files) => files.filter((f) => !this.files.find((item) => item.id === f.id))))
        .subscribe((files: IFile[]) => {
          const filteredFiles = this.filterFiles(files);
          if (filteredFiles === true) {
            if (files.length > 0) {
              this.files.push(...files);
              this.prepareMediaData();
            }
          }
        })
    );
    this.subscriptions.add(
      this.mediaDocumentUploaderService.filesQueue$
        .pipe(map((files) => files.filter((f) => !f.progress.completed)))
        .subscribe((files: IFile[]) => {
          this.showLoader = files.length > 0;
        })
    );
  }

  ngOnChanges(change: SimpleChanges) {
    if (change.existingMediaFileList?.currentValue) {
      this.processExistingMedia();
    }
  }

  filterFiles(files: any[]) {
    return (
      files.findIndex((file: IFile) => {
        const fileName = file.name.toLowerCase();
        return VALID_FILE_TYPES.findIndex((type) => fileName.includes(type)) > -1;
      }) > -1
    );
  }

  processExistingMedia() {
    if (this.existingMediaFileList.length > 0) {
      this.onChange(this.existingMediaFileList);
      this.showLoader = true;
      this.subscriptions.add(
        forkJoin(
          this.existingMediaFileList.map((item) => {
            return this.mediaDocumentUploaderService.downloadMedia(item.fileId);
          })
        ).subscribe((signedUrl: string[]) => {
          this.files = this.existingMediaFileList.map((item, index) => {
            return {
              id: item.fileId,
              name: item.fileName,
              signedUrl: signedUrl[index],
              caption: item.caption,
              fileType: item.fileType
            };
          });
          this.showLoader = false;
        })
      );
    }
  }

  prepareMediaData() {
    const newArray: IMediaFile[] = this.files.map((fileObj) => {
      return {
        fileId: fileObj.id,
        fileName: fileObj.name,
        fileType: fileObj.fileType,
        caption: fileObj.caption || ''
      };
    });
    this.uploadedFileIds.emit(newArray);
    this.onChange(newArray);
  }

  captionEdited(event) {
    this.files.find((item) => item.id == event.id).caption = event.caption;
    this.prepareMediaData();
  }

  onFileSelected(fileList: File[], dropzoneComponent: SlbDropzoneComponent) {
    this.mediaDocumentUploaderService.resetFileQueue();
    fileList.forEach((file) => {
      const fileName = file.name.substr(0, file.name.lastIndexOf('.'));
      if (this.isFileNameInvalid(fileName)) {
        this.notificationService.send({
          severity: 'Error',
          title: 'Invalid file name',
          message: `File name cannot have special characters. Please rename the file and try again.`
        });
        this.showLoader = false;
        return;
      }
      const ext = file.name.split('.').pop();
      const fileType = ext === file.name ? '' : ext;
      if (this.isFileTypeInvalid(fileType)) {
        this.notificationService.send({
          severity: 'Error',
          title: 'File type not supported',
          message: `${file.name} has an invalid file format. Only ${VALID_FILE_TYPES.join(', ')} formats are allowed.`
        });
        this.showLoader = false;
        return;
      }

      if (file.size > VALID_FILE_SIZE_MAX) {
        this.notificationService.send({
          severity: 'Error',
          title: 'File size exceeded',
          message: `${file.name} has exceeded the allowed file size. Maximum file size allowed is ${VALID_FILE_SIZE_MAX_TEXT}!`
        });
        this.showLoader = false;
        return;
      }

      this.mediaDocumentUploaderService.upload(file, this.componentIdentifier);
    });
    // Clearing fileList to get new list of files
    dropzoneComponent.clearAllFiles();
  }

  //#region ControlValueAccessor implentations:
  public writeValue() {
    return void 0;
  }
  public registerOnTouched() {
    return void 0;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private propagateChange(...args) {
    return void 0;
  }

  public registerOnChange(fn: any) {
    this.propagateChange = fn;
  }

  public validate() {
    return this._files.length ? null : { mediaReqError: true };
  }

  private onChange(files) {
    this._files = files;
    this.propagateChange(this._files);
  }
  //#endregion

  removeMedia(id) {
    this.files.splice(
      this.files.findIndex((item) => item.id == id),
      1
    );
    this.prepareMediaData();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.mediaDocumentUploaderService.resetFileQueue();
  }

  private isFileNameInvalid(fileName: string): boolean {
    const regExp = new RegExp(INVALID_CHARS_IN_FILENAME);
    return regExp.test(fileName);
  }

  private isFileTypeInvalid(filetype: string): boolean {
    return !VALID_FILE_TYPES.includes(filetype.toLowerCase());
  }
}
