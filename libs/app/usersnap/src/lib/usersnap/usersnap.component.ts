import { Component } from '@angular/core';

import { SecureEnvironmentService } from '@apollo/app/secure-environment';
import { WindowRef, DocumentRef } from '@apollo/app/ref';
import { IEnvironmentSettings } from '@apollo/api/interfaces';

@Component({
  selector: 'apollo-usersnap',
  template: ''
})
export class UsersnapComponent {
  constructor(private secureEnvironmentService: SecureEnvironmentService, private documentRef: DocumentRef, private windowRef: WindowRef) {
    /* istanbul ignore next */ // Ignoring the next line for tests due to the test is passing locally but not in the build. Anyway this line is still being tested in spec file.
    (this.windowRef.nativeWindow as any).onUsersnapCXLoad = (api) => api.init();

    this.insertScript(this.secureEnvironmentService.secureEnvironment);
  }

  public insertScript(secureEnvironment: IEnvironmentSettings): void {
    if (secureEnvironment) {
      const script = this.documentRef.nativeDocument.createElement('script');
      script.async = true;
      script.src = secureEnvironment.app.usersnapUrl;
      this.documentRef.nativeDocument.getElementsByTagName('head')[0].appendChild(script);
    }
  }
}
