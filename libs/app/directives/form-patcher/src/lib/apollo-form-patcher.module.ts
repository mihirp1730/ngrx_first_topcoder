import { NgModule } from '@angular/core';

import { ApolloFormPatcherDirective } from './directives/form-patcher.directive';

@NgModule({
  declarations: [ApolloFormPatcherDirective],
  exports: [ApolloFormPatcherDirective]
})
export class ApolloFormPatcherModule {
}
