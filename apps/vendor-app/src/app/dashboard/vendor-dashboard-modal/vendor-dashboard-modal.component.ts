import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { WindowRef } from '@apollo/app/ref';

@Component({
  selector: 'apollo-modal-vendor-dashboard',
  templateUrl: './vendor-dashboard-modal.component.html',
  styleUrls: ['./vendor-dashboard-modal.component.scss']
})
export class VendorDashboardModalComponent {
  constructor(public readonly dialogRef: MatDialogRef<VendorDashboardModalComponent>, private windowRef: WindowRef) {}

  public refresh() {
    this.windowRef.nativeWindow.location.reload();
  }
}
