import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'apollo-chat-list',
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.scss']
})
export class ChatListComponent {
  @Input() chatList = [];
  @Input() selectedChatId: string | null = null;
  @Output() chatClick: EventEmitter<string> = new EventEmitter<string>();

  public openChat(chatId: string) {
    this.selectedChatId = chatId;
    this.chatClick.emit(chatId);
  }
}
