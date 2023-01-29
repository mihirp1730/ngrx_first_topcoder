// move component into library for global use 
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlobeLoaderComponent } from './globe-loader.component';

@NgModule({
  imports: [ CommonModule ],
  declarations: [ GlobeLoaderComponent ],
  exports: [ GlobeLoaderComponent ]
})
export class GlobeLoaderModule {}
