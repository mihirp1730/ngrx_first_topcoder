import { Component } from '@angular/core';
import { DocumentRef } from '@apollo/app/ref';
import { SecureEnvironmentService } from '@apollo/app/secure-environment';

@Component({
  selector: 'apollo-whatfix',
  template: ''
})
export class WhatfixComponent {
  constructor(private documentRef: DocumentRef, private secureEnvironmentService: SecureEnvironmentService) {
    if (!this.documentRef.nativeDocument.getElementById('whatfix') && this.secureEnvironmentService.secureEnvironment.whatFix) {
      const script = this.documentRef.nativeDocument.createElement('script');
      script.id = 'whatfix';
      script.type = 'text/javascript';
      script.src = this.secureEnvironmentService.secureEnvironment.whatFix.whatFixUrl;
      script.async = true;
      this.documentRef.nativeDocument.head.appendChild(script);
    }
  }
}
