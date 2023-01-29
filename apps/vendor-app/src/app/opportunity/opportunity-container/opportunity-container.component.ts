import { Component } from '@angular/core';
import { ThemeService } from '@slb-dls/angular-material/core';
import * as Quill from 'quill';

import PasteClipboard from '../../shared/services/quiil-paste.config';
import { Themes } from './../../themes/theme.config';

@Component({
  selector: 'apollo-opportunity-container',
  templateUrl: './opportunity-container.component.html'
})
export class OpportunityContainerComponent {

  constructor(private themeService: ThemeService) {
    this.themeService.switchTheme(Themes.Light);

    Quill.debug(false);
    Quill.register('modules/clipboard', PasteClipboard);
  }
}
