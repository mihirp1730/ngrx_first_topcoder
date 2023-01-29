import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'apollo-chat-participants',
  templateUrl: './chat-participants.component.html',
  styleUrls: ['./chat-participants.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatParticipantsComponent {
  @Output() openModalEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() participants = [];
  
  public formGroup: FormGroup = new FormGroup({
    emailId: new FormControl('', [Validators.email])
  });

  public openModal() {
    this.openModalEvent.emit(true);
  }
}
