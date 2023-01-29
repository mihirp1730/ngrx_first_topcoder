import { Component, EventEmitter, Inject, Output, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'apollo-confirm-modal',
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ConfirmModalComponent {
  title = '';
  content = '';
  subContent = '';
  confirmButtonText = 'Yes';
  cancelButtonText = 'No';
  displayObject: boolean

  @Output()
  yesClickEvent: EventEmitter<void> = new EventEmitter<void>();
  constructor(
    public dialogRef: MatDialogRef<ConfirmModalComponent>,
    @Inject(MAT_DIALOG_DATA) data
  ) {
    if (data) {
      this.title = data.title ?? this.title;
      this.content = data.content ?? this.content;
      this.subContent = data.subContent ?? this.subContent;
      this.confirmButtonText = data.confirmButtonText ?? this.confirmButtonText;
      this.cancelButtonText = data.cancelButtonText ?? this.cancelButtonText;
      this.displayObject = data.displayObject ?? this.displayObject;
    }
  }

  yesBtnHandler() {
    this.yesClickEvent.emit(null);
    this.dialogRef.close(true);
  }

}
