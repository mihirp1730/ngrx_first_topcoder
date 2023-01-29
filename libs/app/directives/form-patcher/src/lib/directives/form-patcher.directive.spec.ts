import { FormGroupDirective } from '@angular/forms';

import { ApolloFormPatcherDirective } from './form-patcher.directive';

describe('ApolloFormPatcherDirective', () => {
  let directive: ApolloFormPatcherDirective;
  let mockFormGroupDirective: FormGroupDirective;

  beforeEach(() => {
    mockFormGroupDirective = {
      form: {
        markAsPristine: jest.fn(),
        patchValue: jest.fn()
      }
    } as unknown as FormGroupDirective;
    directive = new ApolloFormPatcherDirective(mockFormGroupDirective);
  });

  it('should be created', () => {
    expect(directive).toBeTruthy();
  });

  describe('apolloFormPatcherData', () => {
    it('should do nothing with no data', () => {
      directive.inputData = null as never;
      expect(mockFormGroupDirective.form.patchValue).not.toBeCalled();
      expect(mockFormGroupDirective.form.markAsPristine).not.toBeCalled();
      expect(directive).toBeTruthy();
    });
    describe('without FormGroupDirective', () => {
      beforeEach(() => {
        mockFormGroupDirective = null as unknown as FormGroupDirective;
        directive = new ApolloFormPatcherDirective(mockFormGroupDirective);
      })
      it('should do nothing with no form group', () => {
        directive.inputData = { } as never;
        expect(directive).toBeTruthy();
      });
    });
    it('should patch value and mark as pristine of the form', () => {
      const mockRef = {};
      directive.inputData = mockRef as never;
      expect(mockFormGroupDirective.form.patchValue).toBeCalledWith(mockRef);
      expect(mockFormGroupDirective.form.markAsPristine).toBeCalled();
      expect(directive).toBeTruthy();
    });
  });
});
