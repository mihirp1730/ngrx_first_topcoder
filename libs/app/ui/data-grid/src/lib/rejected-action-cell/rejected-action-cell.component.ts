import { Component } from '@angular/core';
import { AgRendererComponent } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';

@Component({
  selector: 'apollo-rejected-action-cell',
  templateUrl: './rejected-action-cell.component.html',
  styleUrls: ['./rejected-action-cell.component.scss']
})
export class RejectedActionCellComponent implements AgRendererComponent {
  public values: any;

  public refresh(params: any): boolean {
    return true;
  }

  public agInit(params: ICellRendererParams): void {
    this.values = params.data;
    this.refresh(params);
  }
}
