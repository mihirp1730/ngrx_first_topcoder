import { AgRendererComponent } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Component } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ModalComponent } from '@apollo/app/ui/notification';

@Component({
  selector: 'apollo-approve-action-cell',
  templateUrl: './approve-action-cell.component.html',
  styleUrls: ['./approve-action-cell.component.scss']
})
export class ApproveActionCellComponent implements AgRendererComponent {
  public values: any;

  constructor(public dialog: MatDialog) {}

  public refresh(): boolean {
    return true;
  }

  public agInit(params: ICellRendererParams): void {
    this.values = params.data;
    this.refresh();
  }

  public onCommentsAction() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.panelClass = 'comments-modal-panel';
    dialogConfig.disableClose = false;
    dialogConfig.data = {
      options: {
        title: 'Comments',
        label: `From: ${this.values?.requesterName}`,
        content: this.values?.comment || 'No Comments',
      }
    };
    this.dialog.open(ModalComponent, dialogConfig);
  }
}
