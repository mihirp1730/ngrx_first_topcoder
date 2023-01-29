import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { SlbButtonModule } from '@slb-dls/angular-material/button';
import { SlbFormFieldModule } from '@slb-dls/angular-material/form-field';
import { SlbModalModule } from '@slb-dls/angular-material/modal';
import { SlbPopoverModule } from '@slb-dls/angular-material/popover';

import { ChatParticipantsComponent } from './chat-participants/chat-participants.component';
import { ChatWindowComponent } from './chat-window/chat-window.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    ScrollingModule,
    SlbButtonModule,
    SlbFormFieldModule,
    SlbModalModule,
    SlbPopoverModule
  ],
  declarations: [ChatParticipantsComponent, ChatWindowComponent],
  exports: [ChatWindowComponent]
})
export class AppChatWindowModule { }
