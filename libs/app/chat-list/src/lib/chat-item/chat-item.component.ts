import { Component, Input } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'apollo-chat-item',
  templateUrl: './chat-item.component.html',
  styleUrls: ['./chat-item.component.scss']
})
export class ChatItemComponent {
  @Input() chatItem: any;
  @Input() isActive = false;

  public offset = new Date().getTimezoneOffset();

  getDate(date: Date) {
    return moment.utc(date);
   } 
}
