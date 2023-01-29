import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DocumentRef {
  get nativeDocument(): HTMLDocument {
    return document;
  }
}
