import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import * as moment from 'moment';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'apollo-cookies-acceptance',
  templateUrl: './cookies-acceptance-modal.component.html',
  styleUrls: ['./cookies-acceptance-modal.component.scss']
})
export class CookiesAcceptanceComponent {
  constructor(public dialogRef: MatDialogRef<CookiesAcceptanceComponent>, public cookieService: CookieService) {}

  public cookiesAcceptance(): void {
    this.dialogRef.close(true);
    const expiration = moment().add(30, 'days');
    this.cookieService.set('cookie-acceptance-date', expiration.toISOString(), moment(expiration).toDate());
  }
}
