/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { IChatThreadMessage } from '@apollo/app/services/communication';
import * as moment from 'moment';

@Component({
  selector: 'apollo-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatWindowComponent implements OnChanges {
  private _participants = [];
  private _chatGroup: any;
  @Input() chatMessages: Array<IChatThreadMessage>;
  @Input() sender = '';
  @Input() set chatGroup(value: Array<{ emailId: string; displayName: string }>) {
    this._chatGroup = value.map((v) => v.displayName).join(', ');
  }
  get chatGroup() {
    return this._chatGroup;
  }
  @Input() set participants(value: Array<{ emailId: string; displayName: string }>) {
    this._participants = value.map((v) => v.emailId);
  }
  get participants() {
    return this._participants;
  }
  @Input() activeChatId: string;
  @Input() showHeader = true;
  @Output() sendMessage: EventEmitter<any> = new EventEmitter<any>();
  @Output() openModalEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() getPartipantsEvent: EventEmitter<void> = new EventEmitter<void>();

  offset = new Date().getTimezoneOffset();
  currentTime = new Date();

  chatForm = new FormGroup({
    messageField: new FormControl('')
  });

  @ViewChild('virtualScroll', { static: true })
  virtualScrollViewport: CdkVirtualScrollViewport;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.chatMessages?.currentValue && changes?.activeChatId?.currentValue) {
      this.chatMessages = changes?.chatMessages?.currentValue.filter((item) => item.chatThreadId === changes?.activeChatId?.currentValue);
      this.scrollToBottom();
    }
  }

  scrollToBottom() {
    setTimeout(
      () =>
        this.virtualScrollViewport.scrollTo({
          bottom: 0,
          behavior: 'auto'
        }),
      0
    );
  }

  send() {
    const enteredMessage = this.chatForm.get('messageField').value;
    if (enteredMessage !== '') {
      this.sendMessage.emit(enteredMessage);
      this.chatForm.get('messageField').setValue('');
    }
  }

  openModal(event: boolean) {
    this.openModalEvent.emit(event);
  }

  getParticipants() {
    this.getPartipantsEvent.emit();
  }

  getDate(date: Date) {
    return moment.utc(date);
  }
}
