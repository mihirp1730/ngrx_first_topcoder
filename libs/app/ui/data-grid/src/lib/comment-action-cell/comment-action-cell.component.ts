import { ICellRendererParams } from '@ag-grid-community/core';
import { Component } from '@angular/core';

@Component({
  selector: 'apollo-comment-action-cell',
  templateUrl: './comment-action-cell.component.html',
  styleUrls: ['./comment-action-cell.component.scss']
})
export class CommentActionCellComponent {
  public values: any;
  
  public refresh(params: ICellRendererParams): boolean {
    return true;
  }

  public agInit(params: ICellRendererParams): void {
    this.values = params.data;
    this.refresh(params);
  }
}
