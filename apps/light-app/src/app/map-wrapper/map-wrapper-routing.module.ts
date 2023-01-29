import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MapWrapperComponent } from './map-wrapper.component';

const routes: Routes = [
  {
    path: '',
    component: MapWrapperComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MapWrapperRoutingModule {}
