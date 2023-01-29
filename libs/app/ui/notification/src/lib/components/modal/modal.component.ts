import { Component, EventEmitter, Inject, Output, ViewEncapsulation } from '@angular/core';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { IModalOptions } from '../../interfaces/notification-options.interface';

@Component({
  selector: 'apollo-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ModalComponent {
  public options: IModalOptions = {} as any;
  public value: string[] = [];
  public separatorKeyCodes = [ENTER, COMMA];

  @Output() yesClickEvent: EventEmitter<any> = new EventEmitter<any>();

  constructor(public dialogRef: MatDialogRef<ModalComponent>, @Inject(MAT_DIALOG_DATA) data: any) {
    if (data) {
      this.options = data.options ?? this.options;
    }
  }

  public confirmBtnHandler() {
    this.yesClickEvent.emit(this.value);
    this.dialogRef.close(true);
  }

  public closeModal() {
    this.dialogRef.close(true);
  }
}
