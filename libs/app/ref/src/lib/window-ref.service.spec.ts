import { getTestBed, TestBed } from '@angular/core/testing';

import { WindowRef } from './window-ref.service';

describe('WindowRef', () => {
  let injector: TestBed;
  let windowRef: WindowRef;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [WindowRef] });
    injector = getTestBed();
    windowRef = injector.get(WindowRef);
  });

  describe('nativeWindow', () => {
    it('should return a native window', () => {
      expect(windowRef.nativeWindow).toBeTruthy();
    });
  });
});
