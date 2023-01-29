import { Directive, Input } from '@angular/core';
import { FormGroupDirective } from '@angular/forms';

@Directive({ selector: '[apolloFormPatcher]' })
export class ApolloFormPatcherDirective {

  @Input('apolloFormPatcher')
  set inputData(data: any) {
    if (!data || !this.formGroupDirective) {
      return;
    }
    this.formGroupDirective.form.patchValue(data);
    this.formGroupDirective.form.markAsPristine();
  }

  constructor(public readonly formGroupDirective: FormGroupDirective) {
  }
}
