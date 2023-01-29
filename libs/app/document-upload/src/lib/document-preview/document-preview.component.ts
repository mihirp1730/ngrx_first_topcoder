import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { IFile } from '@apollo/app/services/media-document-uploader';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'apollo-document-preview',
  templateUrl: './document-preview.component.html',
  styleUrls: ['./document-preview.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DocumentPreviewComponent implements OnChanges, OnDestroy {
  @Input() file: IFile;
  @Input() isPublished: boolean;
  @Output() removeDocument: EventEmitter<string> = new EventEmitter<string>();
  @Output() captionEdit: EventEmitter<{ id: string; caption: string }> = new EventEmitter<{ id: ''; caption: '' }>();
  docTextForm: FormGroup;
  private destroy$ = new Subject();
  private subscription: Subscription = new Subscription();

  constructor() {
    this.generateControls();
  }

  generateControls() {
    this.docTextForm = new FormGroup({ docCaption: new FormControl('') });
    this.subscription.add(
    this.docTextForm.controls.docCaption.valueChanges
      .pipe(debounceTime(1000), distinctUntilChanged(), takeUntil(this.destroy$), filter((value) => value?.length <= 80))
      .subscribe((value) => {
        this.captionEdit.emit({ id: this.file.id, caption: value || '' });
      })
    );
  }

  ngOnChanges(change: SimpleChanges) {
    if (!change.file?.currentValue) {
      return false;
    }
    this.docTextForm.patchValue({ docCaption: this.file.caption });
    this.updateFileType(this.file.fileType);
  }

  updateFileType(type){
    let iconName;
    if(type.search('plain') > -1){
      iconName = 'txt';
    } else if(type.search('pdf') > -1) {
      iconName = 'pdf';
    } else if(type.search('document') > -1 || (type.search('msword') > -1)) {
      iconName = 'doc';
    } else if(type.search('zip') > -1) {
      iconName = 'apollo:zip';
    }

    this.file.fileType = iconName || this.file.fileType;
  }

  removeDocEmit(fileId) {
    this.removeDocument.emit(fileId);
  }

  ngOnDestroy() {
    this.destroy$.complete();
    this.subscription.unsubscribe();
  }

}
