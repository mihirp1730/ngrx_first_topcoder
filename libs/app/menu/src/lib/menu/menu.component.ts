import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AuthUser } from '@apollo/api/interfaces';

export interface IOption {
  id: string;
  name: string;
  tooltip: string;
  link?: string;
  action?: () => any;
}

@Component({
  selector: 'apollo-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {
  @Input() user: AuthUser = {
    name: '',
    email: '',
    company: '',
    accessToken: '',
    idToken: '',
    isGuest: true,
    gisToken: ''
  };
  @Input() options: Array<IOption>;
  @Output() authRedirection = new EventEmitter<void>();
  public initials = '';
  public privacyUrl = 'https://www.software.slb.com/privacy';
  
  ngOnInit(): void {
    this.initials = this.getInitials();
  }

  private getInitials(): string {
    if (!this.user.name) {
      return '';
    }

    if (this.user.isGuest) {
      return `${this.user.name.substring(0, 1)}`;
    }
    const [firstname, lastname] = this.user.name.split(' ');
    return `${firstname.substring(0, 1)}${lastname.substring(0, 1)}`;
  }

  public authRedirect() {
    this.authRedirection.emit();
  }
}
