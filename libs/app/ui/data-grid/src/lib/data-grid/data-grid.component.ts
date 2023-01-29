import { ClientSideRowModelModule } from '@ag-grid-community/all-modules';
import { GridOptions, GridReadyEvent } from '@ag-grid-community/core';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

import { ApproveActionCellComponent } from '../approve-action-cell/approve-action-cell.component';
import { CommentActionCellComponent } from '../comment-action-cell/comment-action-cell.component';
import { LinkActionCellComponent } from '../link-action-cell/link-action-cell.component';
import { PendingActionCellComponent } from '../pending-action-cell/pending-action-cell.component';
import { PendingRequestActionCellComponent } from '../pending-request-action-cell/pending-request-action-cell.component';
import { RejectedActionCellComponent } from '../rejected-action-cell/rejected-action-cell.component';

@Component({
  selector: 'apollo-data-grid',
  templateUrl: './data-grid.component.html',
  styleUrls: ['./data-grid.component.scss']
})
export class DataGridComponent implements OnInit, OnChanges {
  @Input() items = [];
  @Input() columnDefinition = [];
  public components = {};

  public modules = [ClientSideRowModelModule];

  public gridOptions: GridOptions = {
    frameworkComponents: {
      approvedCellRenderer: ApproveActionCellComponent,
      pendingCellRenderer: PendingActionCellComponent,
      rejectedCellRenderer: RejectedActionCellComponent,
      linkCellRenderer: LinkActionCellComponent,
      pendingRequestCellRenderer: PendingRequestActionCellComponent,
      commentCellRenderer: CommentActionCellComponent
    },
    onGridReady: (event: GridReadyEvent) => {
      if(this.items.length > 0) {
        event.api.setRowData(this.items);
      }
    },
    pagination: true,
    paginationPageSize: 15,
    sortingOrder: ['desc', 'asc'],
    defaultColDef: {
      filter: false,
      sortable: true,
      editable: false,
      autoHeight: true,
      resizable: true,
      flex: 1,
      minWidth: 100
    },
    tooltipShowDelay: 1000,
    rowSelection: 'single',
    enableCellTextSelection: true
  };

  ngOnInit(): void {
    this.gridOptions.columnDefs = this.columnDefinition;
  }

  ngOnChanges(change: SimpleChanges) {
    if (change.items && change.items.currentValue) {
      this.items = change.items.currentValue;
      if(this.gridOptions.api) {
        if (this.items.length > 0) {
          this.gridOptions.api.setRowData(this.items);
        } else {
          this.gridOptions.api.showNoRowsOverlay();
        }
      }
    }
  }
}
