import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { ChatListComponent } from './chat-list/chat-list.component';
import { ChatItemComponent } from './chat-item/chat-item.component';

@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    ScrollingModule
  ],
  declarations: [
    ChatListComponent,
    ChatItemComponent
  ],
  exports: [ChatListComponent]
})
export class ChatListModule {}
