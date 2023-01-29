import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ChatListModule } from '@apollo/app/chat-list';
import { AppChatWindowModule } from '@apollo/app/chat-window';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { SlbButtonModule } from '@slb-dls/angular-material/button';
import { SlbFormFieldModule } from '@slb-dls/angular-material/form-field';

import { CommunicationChatComponent } from './communication-chat/communication-chat.component';
import { CommunicationContainerComponent } from './communication-container/communication-container.component';
import { CommunicationRoutingModule } from './communication-routing.module';
import { CommunicationEffects } from './state/effects/communication.effects';
import { communicationFeatureKey, communicationReducer } from './state/reducers/communication.reducer';

@NgModule({
  declarations: [CommunicationChatComponent, CommunicationContainerComponent],
  imports: [
    CommonModule,
    CommunicationRoutingModule,
    StoreModule.forFeature(communicationFeatureKey, communicationReducer),
    EffectsModule.forFeature([CommunicationEffects]),
    AppChatWindowModule,
    ChatListModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    SlbButtonModule,
    SlbFormFieldModule
  ]
})
export class CommunicationModule {}
