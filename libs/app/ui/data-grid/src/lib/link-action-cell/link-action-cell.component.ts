import { AgRendererComponent } from '@ag-grid-community/angular';
import { Component } from '@angular/core';

@Component({
  selector: 'apollo-link-action-cell',
  templateUrl: './link-action-cell.component.html',
  styleUrls: ['./link-action-cell.component.scss']
})
export class LinkActionCellComponent implements AgRendererComponent {
  params: any;

  agInit(params: any): void {
    this.params = params;
  }

  refresh(params: any): boolean {
    return false;
  }
}

