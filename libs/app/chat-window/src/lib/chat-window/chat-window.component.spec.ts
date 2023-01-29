/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IChatThreadMessage, MessageType } from '@apollo/app/services/communication';
import { SlbPopoverModule } from '@slb-dls/angular-material/popover';

import { ChatWindowComponent } from './chat-window.component';

describe('ChatWindowComponent', () => {
  let component: ChatWindowComponent;
  let fixture: ComponentFixture<ChatWindowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChatWindowComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, NoopAnimationsModule, SlbPopoverModule]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set the participants', () => {
    component.participants = [{ emailId: 'test@email.com', displayName: 'test' }];
    expect(component.participants).toEqual(['test@email.com']);
  });

  it('should set chat group', () => {
    component.chatGroup = [{ emailId: 'test@email.com', displayName: 'test' }];
    expect(component.chatGroup).toEqual('test');
  });

  it('should send message', () => {
    const spy = jest.spyOn(component.sendMessage, 'emit');
    component.chatForm.patchValue({
      messageField: 'test'
    });
    component.send();

    expect(spy).toHaveBeenCalled();
  });

  it('should set chatMessages', () => {
    component.activeChatId = "123";
    const messages: Array<IChatThreadMessage> = [
      {
        "chatThreadId":"123",
        "content":"hello there",
        "sender":"test@slb.com",
        "createdOn": null,
        "type": MessageType.Text
      }
    ];
    component.chatMessages = messages;
    expect(component.chatMessages).toEqual(messages);
  });

  it('should emit openModalEvent', () => {
    const spy = jest.spyOn(component.openModalEvent, 'emit');
    component.openModal(true);
    expect(spy).toHaveBeenCalled();
  });

  it('should emit getPartipantsEvent', () => {
    const spy = jest.spyOn(component.getPartipantsEvent, 'emit');
    component.getParticipants();
    expect(spy).toHaveBeenCalled();
  });

  it('should load chat messages', () => {
    const messages = [
      {
        "chatThreadId":"123",
        "content":"hello there",
        "senderOfMessage":"test@slb.com",
        "type":"test"
      }
    ];
    const simpleChanges = {
      chatMessages : {
        currentValue: messages
      },
      activeChatId: {
        currentValue: "123"
      }
    }
    component.ngOnChanges(simpleChanges as any);
    expect(component.chatMessages).toEqual(messages);
  });
});
