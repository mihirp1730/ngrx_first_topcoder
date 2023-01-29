import { ICellRendererParams } from '@ag-grid-community/core';
import { Component } from '@angular/core';

@Component({
  selector: 'apollo-pending-request-action-cell',
  templateUrl: './pending-request-action-cell.component.html',
  styleUrls: ['./pending-request-action-cell.component.scss']
})
export class PendingRequestActionCellComponent {
  public values: any;

  public refresh(params: ICellRendererParams): boolean {
    return true;
  }

  public agInit(params: ICellRendererParams): void {
    this.values = params.data;
    this.refresh(params);
  }
}
