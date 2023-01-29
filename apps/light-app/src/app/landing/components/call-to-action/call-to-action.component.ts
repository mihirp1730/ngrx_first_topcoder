import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'apollo-call-to-action',
  templateUrl: './call-to-action.component.html',
  styleUrls: ['./call-to-action.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CallToActionComponent {
  @Input() settings: any;
}
