/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { AgRendererComponent } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ModalComponent } from '@apollo/app/ui/notification';
import { DataPackagesService } from '@apollo/app/services/data-packages';

@Component({
  selector: 'apollo-pending-action-cell',
  templateUrl: './pending-action-cell.component.html',
  styleUrls: ['./pending-action-cell.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PendingActionCellComponent implements AgRendererComponent {
  public values: any;

  constructor(private router: Router, public dialog: MatDialog, private dataPackagesService: DataPackagesService) {}

  public refresh(params: any): boolean {
    return true;
  }

  public agInit(params: ICellRendererParams): void {
    this.values = params.data;
    this.refresh(params);
  }

  public onApproveAction() {
    this.dataPackagesService.getAssociateDeliverables(this.values.dataPackageId).subscribe((response) => {
      if (response.length === 0) {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = true;
        dialogConfig.panelClass = 'comments-modal-panel';
        dialogConfig.disableClose = false;
        dialogConfig.data = {
          options: {
            title: 'No Deliverable Files',
            subtitle: this.values?.dataPackageName,
            content: 'There are currently no deliverable files in this package. Upload the deliverables in the package to approve and create a subscription.',
            confirmButtonText: 'Add Deliverables'
          }
        };
        const dialogRef = this.dialog.open(ModalComponent, dialogConfig);

        dialogRef.componentInstance.yesClickEvent.subscribe(() => {
          this.router.navigateByUrl(`vendor/package/edit/${this.values.dataPackageId}`);
        });

        return;
      }

      return this.router.navigateByUrl('vendor/package/subscription/create', {
        state: this.values
      });
    });
  }

  public onCommentsAction() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.panelClass = 'comments-modal-panel';
    dialogConfig.disableClose = false;
    dialogConfig.data = {
      title: 'Comments',
      label: `From: ${this.values?.requesterName}`,
      subtitle: '',
      content: this.values?.comment || 'No Comments',
      subContent: ''
    };
    this.dialog.open(ModalComponent, dialogConfig);
  }
}
