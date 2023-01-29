import { AbstractControl, FormControl } from '@angular/forms';
import { quillEditorTextValidator } from './quill-editor-text-validator.helper';

describe('textValidator', () => {
  it('should return null', () => {
    const control = { value: '<p>test</p>' };
    const result = quillEditorTextValidator()(control as AbstractControl);
    expect(result).toBe(null);
  });

  it('should return invalidTest', () => {
    const control = new FormControl();
    control.setValue('<p> </p>') 
    const errorMsg = { "invalidText": true };
    const result = quillEditorTextValidator()(control as AbstractControl);
    expect(result).toStrictEqual(errorMsg);
  });
});
