import { Component, EventEmitter, Inject, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { IFile } from '@apollo/app/services/media-document-uploader';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'apollo-media-preview',
  templateUrl: './media-preview.component.html',
  styleUrls: ['./media-preview.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: 'FileReaderFactory',
      useValue: () => new FileReader()
    }
  ]
})
export class MediaPreviewComponent implements OnChanges, OnDestroy {
  @Input() file: IFile;
  @Input() isPublished: boolean;
  @Output() removeMedia: EventEmitter<string> = new EventEmitter<string>();
  @Output() captionEdit: EventEmitter<{ id: string; caption: string }> = new EventEmitter<{ id: ''; caption: '' }>();
  source: SafeUrl;
  altText: string;
  public mediaTextForm: FormGroup;
  private destroy$ = new Subject();
  constructor(
    @Inject('FileReaderFactory')
    public readonly fileReaderFactory: () => FileReader,
    private sanitizer: DomSanitizer) {
    this.generateControls();
  }

  generateControls() {
    this.mediaTextForm = new FormGroup({ mediaCaption: new FormControl('') });
    this.mediaTextForm.controls.mediaCaption.valueChanges
      .pipe(debounceTime(1000), distinctUntilChanged(), takeUntil(this.destroy$), filter((value) => value?.length <= 80))
      .subscribe((value) => {
        this.captionEdit.emit({ id: this.file.id, caption: value || '' });
      });
  }

  ngOnChanges(change: SimpleChanges) {
    if (!change.file?.currentValue) {
      return false;
    }
    if (change.file.currentValue.signedUrl) {
      this.usePreview();
    } else {
      this.generatePreview();
    }
  }

  usePreview() {
    this.source = this.file.signedUrl;
    this.altText = this.file.name;
    this.mediaTextForm.patchValue({ mediaCaption: this.file.caption });
  }

  generatePreview() {
    const reader = this.fileReaderFactory();
    reader.readAsDataURL(this.file.file);
    reader.onload = () => {
      this.source = this.sanitizer.bypassSecurityTrustUrl(`${reader.result}`);
      this.altText = this.file.name;
      this.mediaTextForm.patchValue({ mediaCaption: this.file.caption });
    };
  }

  removeMediaEmit(fileId) {
    this.removeMedia.emit(fileId);
  }

  ngOnDestroy() {
    this.destroy$.complete();
  }
}
