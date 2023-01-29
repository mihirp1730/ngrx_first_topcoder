import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'apollo-modal-cancel-request',
  templateUrl: './package-modal-cancel-request.component.html',
  styleUrls: ['./package-modal-cancel-request.component.scss']
})
export class PackageModalCancelRequestComponent {
  constructor(public dialogRef: MatDialogRef<PackageModalCancelRequestComponent>) {}

  public cancel(): void {
    this.dialogRef.close();
  }
}
