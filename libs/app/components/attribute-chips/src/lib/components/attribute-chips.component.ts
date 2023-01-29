import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'apollo-attribute-chips',
  templateUrl: './attribute-chips.component.html',
  styleUrls: ['./attribute-chips.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AttributeChipsComponent {
  @Input()
  attributes: { label: ''; icon: ''; tooltip: '' }[] = [];
}
