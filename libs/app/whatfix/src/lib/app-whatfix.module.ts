import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WhatfixComponent } from './whatfix/whatfix.component';

@NgModule({
  imports: [CommonModule],
  declarations: [WhatfixComponent],
  exports: [WhatfixComponent]
})
export class WhatfixModule {}
