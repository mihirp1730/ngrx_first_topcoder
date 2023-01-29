import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

import { ConfirmModalComponent } from '../confirm-modal/confirm-modal.component';

export interface LeaveForm {
  canLeave(): boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PackageEditGuard implements CanDeactivate<LeaveForm> {

  constructor(public dialog: MatDialog) {}

  confirmLeave(): Observable<boolean> {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.panelClass = 'unsaved-changes-modal-panel';
    dialogConfig.disableClose = true;
    dialogConfig.data = {
      title: 'Unsaved Changes',
      content: 'There are changes that has not been saved. Are you sure you want to leave before saving those changes?',
      confirmButtonText: 'Leave',
      cancelButtonText: 'Stay'
    };
    const dialogRef = this.dialog.open(ConfirmModalComponent, dialogConfig);
    return dialogRef.afterClosed();
  }

  canDeactivate(component: LeaveForm): boolean | Observable<boolean> {
    if (!component.canLeave()) {
      return this.confirmLeave();
    }
    return true;
  }
}