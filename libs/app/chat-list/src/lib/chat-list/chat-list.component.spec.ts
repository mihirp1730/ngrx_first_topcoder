import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { Router } from '@angular/router';

import { ChatListComponent } from './chat-list.component';

const mockRouter = {
  navigateByUrl: jest.fn()
};

describe('ChatListComponent', () => {
  let component: ChatListComponent;
  let fixture: ComponentFixture<ChatListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChatListComponent ],
      imports: [ ScrollingModule ],
      providers: [
        {
          provide: Router,
          useValue: mockRouter
        },
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to communication chat', () => {
    const spy = jest.spyOn(component.chatClick, 'emit').mockImplementation();
    const chatId = 'testId'

    component.openChat(chatId);

    expect(spy).toHaveBeenCalledWith(chatId);
  });
});
