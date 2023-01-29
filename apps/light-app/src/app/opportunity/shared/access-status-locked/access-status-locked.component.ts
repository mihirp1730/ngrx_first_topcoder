import { Component, Input } from '@angular/core';

@Component({
  selector: 'apollo-access-status-locked',
  templateUrl: './access-status-locked.component.html',
  styleUrls: ['./access-status-locked.component.scss']
})
export class AccessStatusLockedComponent {
  @Input() accessType: string;
}
