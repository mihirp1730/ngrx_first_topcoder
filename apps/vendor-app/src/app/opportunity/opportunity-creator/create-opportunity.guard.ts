import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { CanDeactivate, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { ConfirmModalComponent } from '../../confirm-modal/confirm-modal.component';

export interface LeaveForm {
  canLeave(): boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CreateOpportunityGuard implements CanDeactivate<LeaveForm> {
  constructor(public dialog: MatDialog) {}

  confirmLeave(): Observable<boolean> {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.panelClass = 'unsaved-changes-modal-panel';
    dialogConfig.disableClose = true;
    dialogConfig.data = {
      title: 'Unsaved Changes',
      content: 'You have unsaved changes that will be lost if you proceed. Continue anyway?',
      confirmButtonText: 'Continue',
      cancelButtonText: 'Cancel',
      displayObject: true
    };
    const dialogRef = this.dialog.open(ConfirmModalComponent, dialogConfig);
    return dialogRef.afterClosed();
  }

  canDeactivate(component: LeaveForm): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (!component.canLeave()) {
      return this.confirmLeave();
    }
    return true;
  }
}
