// TODO: move component into library for global use 
import { Component, Input, TemplateRef } from '@angular/core';

@Component({
  selector: 'apollo-globe-loader',
  templateUrl: './globe-loader.component.html',
  styleUrls: ['./globe-loader.component.scss']
})
export class GlobeLoaderComponent {
  @Input() showLoaderOverlay: TemplateRef<never>;
  @Input() fadeOut: boolean;
}
