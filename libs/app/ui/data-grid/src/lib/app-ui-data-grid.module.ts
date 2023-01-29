import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SlbDlsGridModule } from '@slb-dls/angular-material/ag-grid';
import { MatIconModule } from '@angular/material/icon';
import { SlbButtonModule } from '@slb-dls/angular-material/button';

import { DataGridComponent } from './data-grid/data-grid.component';
import { ApproveActionCellComponent } from './approve-action-cell/approve-action-cell.component';
import { RejectedActionCellComponent } from './rejected-action-cell/rejected-action-cell.component';
import { PendingRequestActionCellComponent } from './pending-request-action-cell/pending-request-action-cell.component';
import { PendingActionCellComponent } from './pending-action-cell/pending-action-cell.component';
import { LinkActionCellComponent } from './link-action-cell/link-action-cell.component';
import { CommentActionCellComponent } from './comment-action-cell/comment-action-cell.component';

@NgModule({
  imports: [CommonModule, SlbDlsGridModule, MatIconModule, SlbButtonModule],
  declarations: [
    DataGridComponent,
    ApproveActionCellComponent,
    RejectedActionCellComponent,
    PendingActionCellComponent,
    LinkActionCellComponent,
    PendingRequestActionCellComponent,
    CommentActionCellComponent
  ],
  exports: [DataGridComponent]
})
export class AppUiDataGridModule {}
