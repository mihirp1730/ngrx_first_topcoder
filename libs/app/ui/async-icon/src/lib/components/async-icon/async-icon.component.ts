import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'apollo-async-icon',
  templateUrl: './async-icon.component.html',
  styleUrls: ['./async-icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AsyncIconComponent {
  @Input() svgIcon = '';
  @Input() title = '';
  @Input() isLoading = false;
  @Input() badge = '';

  @Output()
  iconClick = new EventEmitter<void>();

  onIconClick(event: MouseEvent) {
    event.stopPropagation();
    this.iconClick.emit();
  }
}
