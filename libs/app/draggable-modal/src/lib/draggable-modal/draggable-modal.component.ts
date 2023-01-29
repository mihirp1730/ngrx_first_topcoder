import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'apollo-draggable-modal',
  templateUrl: './draggable-modal.component.html',
  styleUrls: ['./draggable-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DraggableModalComponent {
  @Input() boundry: string | undefined;
  @Output() closeModal: EventEmitter<void> = new EventEmitter<void>();

  public closeModalHandler(): void {
    this.closeModal.emit();
  }
}
