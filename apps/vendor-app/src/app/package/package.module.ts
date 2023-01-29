import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GisComponentsModule } from '@slb-innersource/gis-canvas';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { NgModule } from '@angular/core';
import { QuillModule } from 'ngx-quill';
import { SlbButtonModule } from '@slb-dls/angular-material/button';
import { SlbCurrencyInputModule } from '@slb-dls/angular-material/currency-input';
import { SlbDropdownModule, SLB_DROPDOWN_DEFAULT_OPTIONS } from '@slb-dls/angular-material/dropdown';
import { SlbFormFieldModule } from '@slb-dls/angular-material/form-field';
import { SlbSharedModule } from '@slb-dls/angular-material/shared';

import { AppSidePanelModule } from '@apollo/app/side-panel';
import { AppUploadWidgetModule } from '@apollo/app/upload-widget';
import { AppMediaUploadPreviewModule } from '@apollo/app/media-upload-preview';
import { AppDocumentUploadModule } from '@apollo/app/document-upload';
import { PackageRoutingModule } from './package-routing.module';
import { PackageCreatorComponent } from './package-creator/package-creator.component';
import { PackageContainerComponent } from './package-container/package-container.component';
import { PackageMapAndDeliverablesComponent } from './package-map-and-deliverables/package-map-and-deliverables.component';
import { GlobeLoaderModule } from '../globe-loader/globe-loader.module';
import { PackageEditorComponent } from './package-editor/package-editor.component';


@NgModule({
  declarations: [PackageCreatorComponent, PackageContainerComponent, PackageMapAndDeliverablesComponent, PackageEditorComponent],
  imports: [
    CommonModule,
    AppSidePanelModule,
    AppUploadWidgetModule,
    AppMediaUploadPreviewModule,
    AppDocumentUploadModule,
    PackageRoutingModule,
    SlbButtonModule,
    MatIconModule,
    FormsModule,
    MatInputModule,
    SlbFormFieldModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    GisComponentsModule,
    SlbDropdownModule,
    GlobeLoaderModule,
    MatRadioModule,
    SlbSharedModule,
    SlbCurrencyInputModule,
    MatSelectModule,
    MatExpansionModule,
    QuillModule.forRoot()
  ],
  providers: [{ provide: SLB_DROPDOWN_DEFAULT_OPTIONS, useValue: { useOptionValue: true } }]
})
export class DataPackageModule {}
