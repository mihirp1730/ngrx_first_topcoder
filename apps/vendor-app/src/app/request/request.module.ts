import { AppUiDataGridModule } from '@apollo/app/ui/data-grid';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SlbButtonModule } from '@slb-dls/angular-material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { RequestRoutingModule } from './request-routing.module';
import { RequestContainerComponent } from './request-container/request-container.component';
import { RequestDashboardComponent } from './request-dashboard/request-dashboard.component';

@NgModule({
  declarations: [RequestContainerComponent, RequestDashboardComponent],
  imports: [CommonModule, RequestRoutingModule, AppUiDataGridModule, SlbButtonModule, MatIconModule, MatProgressSpinnerModule]
})
export class RequestModule {}
