import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { ControlValueAccessor, Validator } from '@angular/forms';
import { IDocumentUploadInputProps, IFile, MediaDocumentUploaderService } from '@apollo/app/services/media-document-uploader';
import { NotificationService } from '@apollo/app/ui/notification';
import { SlbDropzoneComponent } from '@slb-dls/angular-material/dropzone';
import { forkJoin, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { IDocFile } from '../document-upload.interface';

const VALID_FILE_TYPES = ['doc', 'txt', 'docx', 'pdf', 'zip'];
const INVALID_CHARS_IN_FILENAME = "[()!,'\"+=<>&$?*#:;%{}|^~\\[\\]\\`]";

@Component({
  selector: 'apollo-document-upload-preview',
  templateUrl: './document-upload-preview.component.html',
  styleUrls: ['./document-upload-preview.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DocumentUploadPreviewComponent implements OnInit, OnDestroy, OnChanges, ControlValueAccessor, Validator {
  @Input() widgetStyle = 'drag-drop';
  @Input() multipleFiles = false;
  @Input() extensions = '*';
  @Input() canUpload = true;
  @Input() isPublished = false;
  @Input() maxFileSize = '*';
  @Input() uploaderError = false;
  @Input() existingDocFileList: IDocFile[] = [];
  @Input() componentIdentifier: string;
  @Input() options: IDocumentUploadInputProps;

  @Output() uploadedDocFileIds: EventEmitter<IDocFile[]> = new EventEmitter();

  files: IFile[] = [];
  showLoader = false;
  private subscriptions = new Subscription();

  constructor(
    public mediaDocumentUploaderService: MediaDocumentUploaderService,
    private readonly notificationService: NotificationService
  ) { }

  ngOnInit() {
    this.subscriptions.add(
      this.mediaDocumentUploaderService.filesQueue$
        .pipe(map((files) => files.filter((f) => (this.componentIdentifier && this.componentIdentifier === f.componentIdentifier))))
        .pipe(map((files) => files.filter((f) => f.progress.completed)))
        .pipe(map((files) => files.filter((f) => !this.files.find((item) => item.id === f.id))))
        .subscribe((files: IFile[]) => {
          if (this.filterFiles(files)) {
            if (files.length > 0) {
              this.files.push(...files);
              this.processNewDoc(files);
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

  processNewDoc(files: IFile[]) {
    this.showLoader = true;
    forkJoin(
      files.map((item) => {
        return this.mediaDocumentUploaderService.downloadMedia(item.id);
      })
    ).subscribe((signedUrl: string[]) => {
      files.forEach((item, index) => {
        const file = this.files.find(fileObj => fileObj.id === item.id);
        if (file) {
          file.signedUrl = signedUrl[index];
        }
      });
      this.prepareDocData();
      this.showLoader = false;
    });
  }

  filterFiles(files: any[]) {
    return files.findIndex((file: IFile) => {
      return VALID_FILE_TYPES.findIndex((type) => file.name.toLowerCase().includes(type)) > -1
    }) > -1;
  }

  prepareDocData() {
    const newArray: IDocFile[] = this.files.map((fileObj) => {
      return {
        fileId: fileObj.id,
        fileName: fileObj.name,
        fileType: fileObj.fileType,
        caption: fileObj.caption || ''
      };
    });
    this.uploadedDocFileIds.emit(newArray);
  }

  onFileSelected(fileList: File[], dropzoneComponent: SlbDropzoneComponent) {
    this.mediaDocumentUploaderService.resetFileQueue();
    fileList.forEach((file) => {
      const fileName = file.name.substr(0, file.name.lastIndexOf("."));
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
      this.mediaDocumentUploaderService.upload(file, this.componentIdentifier);
    });
    // Clearing fileList to get new list of files
    dropzoneComponent.clearAllFiles();
  }

  captionEdited(event) {
    this.files.find(item => item.id == event.id).caption = event.caption;
    this.prepareDocData();
  }

  private isFileNameInvalid(fileName: string): boolean {
    const regExp = new RegExp(INVALID_CHARS_IN_FILENAME);
    return regExp.test(fileName);
  }

  private isFileTypeInvalid(filetype: string): boolean {
    return !VALID_FILE_TYPES.includes(filetype.toLowerCase());
  }

  removeDocument(id) {
    this.files.splice(this.files.findIndex(item => item.id == id), 1);
    this.prepareDocData();
  }

  //#region ControlValueAccessor implentations:
  writeValue() {
    return void 0;
  }
  registerOnTouched() {
    return void 0;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private propagateChange(...args) {
    return void 0;
  }

  registerOnChange(fn: any) {
    this.propagateChange = fn;
  }

  validate() {
    return this.files.length ? null : { mediaReqError: true };
  }

  ngOnChanges(change: SimpleChanges) {
    if (change.existingDocFileList?.currentValue) {
      this.processExistingDoc();
    }
  }

  processExistingDoc() {
    if (this.existingDocFileList.length > 0) {
      this.onChange(this.existingDocFileList);
      this.showLoader = true;
      forkJoin(
        this.existingDocFileList.map((item) => {
          return this.mediaDocumentUploaderService.downloadMedia(item.fileId)
        })
      ).subscribe((signedUrl: string[]) => {
        this.existingDocFileList.forEach((item, index) => {
          const file = this.files.find(fileObj => fileObj.id === item.fileId);
          if (file) {
            file.signedUrl = signedUrl[index];
          }

        });
        this.showLoader = false;
      });
    }
  }

  private onChange(files) {
    this.files = files.map((item) => {
      return {
        id: item.fileId,
        name: item.fileName,
        caption: item.caption,
        fileType: item.fileType
      };
    });
    this.propagateChange(this.files);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.mediaDocumentUploaderService.resetFileQueue();
  }
}
