import { Component, EventEmitter, Inject, Output, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { IInputModalOptions } from '../../interfaces/notification-options.interface';

@Component({
  selector: 'apollo-input-modal',
  templateUrl: './input-modal.component.html',
  styleUrls: ['./input-modal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class InputModalComponent {
  public options: IInputModalOptions = {} as any;

  @Output() confirm: EventEmitter<any> = new EventEmitter<any>();

  constructor(public dialogRef: MatDialogRef<InputModalComponent>, @Inject(MAT_DIALOG_DATA) data: any) {
    if (data) {
      this.options = data.options ?? this.options;
    }
  }

  public onConfirm() {
    const inputValues = Object.assign({}, ...this.options.modalInputs.map(mInput => ({[mInput.name]: mInput.value})));
    this.dialogRef.close(inputValues);
  }

  public closeModal() {
    this.dialogRef.close();
  }
}
