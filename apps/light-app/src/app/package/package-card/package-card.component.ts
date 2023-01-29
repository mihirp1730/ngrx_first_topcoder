import { Component, Input } from '@angular/core';

@Component({
  selector: 'apollo-package-card',
  templateUrl: './package-card.component.html',
  styleUrls: ['./package-card.component.scss']
})
export class PackageCardComponent {
  @Input() package = null;
}
