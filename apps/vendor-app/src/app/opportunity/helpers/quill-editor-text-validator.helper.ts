import { ValidatorFn } from '@angular/forms';

export function quillEditorTextValidator(): ValidatorFn {
  return control => { 
    const element = new DOMParser().parseFromString(control.value, 'text/html')
    if(element.body.textContent.trim() === '' && element.images?.length === 0) {
      control.reset();
      return { 'invalidText': true }
    }
    return null;
  }
}