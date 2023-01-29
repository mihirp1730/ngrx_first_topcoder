import { Component, Input, TemplateRef } from '@angular/core';

@Component({
  selector: 'apollo-scroll-view',
  templateUrl: './scroll-view.component.html',
  styleUrls: ['./scroll-view.component.scss']
})
export class ScrollViewComponent {
  @Input() itemSize: number;
  @Input() dataSource: any;
  @Input() cardTemplate: TemplateRef<any>;

  public trackBy(index: number): number {
    return index;
  }
}
