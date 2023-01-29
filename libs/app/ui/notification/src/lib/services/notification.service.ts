import { Injectable } from '@angular/core';
import { MessageService, SlbSeverity } from '@slb-dls/angular-material/notification';

import { INotificationOptions } from '../interfaces/notification-options.interface';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(private readonly messageService: MessageService) {}

  public send(options: INotificationOptions): void {
    this.messageService.add({
      severity: this.getSeverity(options.severity),
      summary: options.title,
      closable: options.closable !== undefined ? options.closable : true,
      sticky: options.sticky !== undefined ? options.sticky : false,
      life: 3000,
      detail: options.message,
      target: options.target || 'toast',
      asHtml: true
    });
  }

  public close() {
    this.messageService.clear();
  }

  private getSeverity(severity: string): SlbSeverity {
    if (severity === 'Success') {
      return SlbSeverity.Success;
    }

    if (severity === 'Error') {
      return SlbSeverity.Error;
    }

    if (severity === 'Warning') {
      return SlbSeverity.Warning;
    }
    
    return SlbSeverity.Info;
  }
}
