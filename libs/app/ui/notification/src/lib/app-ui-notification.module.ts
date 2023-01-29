import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SlbButtonModule } from '@slb-dls/angular-material/button';
import { SlbFacetTextModule } from '@slb-dls/angular-material/facet-text';
import { SlbModalModule } from '@slb-dls/angular-material/modal';
import { SlbNotificationModule } from '@slb-dls/angular-material/notification';

import { ModalComponent } from './components/modal/modal.component';
import { ToastMessageComponent } from './components/toast-message/toast-message.component';
import { InputModalComponent } from './components/input-modal/input-modal.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SlbButtonModule,
    SlbFacetTextModule,
    SlbModalModule,
    SlbNotificationModule,
    MatFormFieldModule,
    MatInputModule
  ],
  declarations: [ToastMessageComponent, ModalComponent, InputModalComponent],
  exports: [ToastMessageComponent, ModalComponent, InputModalComponent]
})
export class AppUiNotificationModule {}
