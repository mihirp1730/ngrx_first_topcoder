import { Component, Input, TemplateRef } from '@angular/core';

@Component({
  selector: 'apollo-side-panel',
  templateUrl: './side-panel.component.html',
  styleUrls: ['./side-panel.component.scss']
})
export class SidePanelComponent {
  @Input() header: TemplateRef<never>;
  @Input() content: TemplateRef<never>;
  @Input() fullHeight = false;
}
