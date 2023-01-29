import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DocumentRef } from '@apollo/app/ref';
import { SecureEnvironmentService } from '@apollo/app/secure-environment';
import { noop } from 'lodash';

import { WhatfixComponent } from './whatfix.component';

class MockNativeDocument {
  nativeDocument = {
    getElementById: noop,
    createElement: noop,
    head: {
      appendChild: noop
    }
  };
}


describe('WhatfixComponent', () => {
  let mockNativeDocument: DocumentRef;
  let fixture: ComponentFixture<WhatfixComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WhatfixComponent],
      providers: [
        {
          provide: DocumentRef,
          useClass: MockNativeDocument
        },
        {
          provide: SecureEnvironmentService,
          useValue: {
            secureEnvironment: {
              whatFix: {
                whatFixUrl: 'whatFixUrl'
              }
            }
          }
        }
      ]
    }).compileComponents();
  });

  it('should test script tag creation', () => {
    const mockedScriptTag: any = {};
    mockNativeDocument = TestBed.inject(DocumentRef);
    const getElementByIdSpy = jest.spyOn(mockNativeDocument.nativeDocument, 'getElementById');
    const createElementSpy = jest.spyOn(mockNativeDocument.nativeDocument, 'createElement').mockReturnValue(mockedScriptTag);
    const appendChildSpy = jest.spyOn(mockNativeDocument.nativeDocument.head, 'appendChild');
    fixture = TestBed.createComponent(WhatfixComponent);
    fixture.detectChanges();
    expect(getElementByIdSpy).toHaveBeenCalledWith('whatfix');
    expect(createElementSpy).toHaveBeenCalledWith('script');
    expect(appendChildSpy).toHaveBeenCalled();
    expect(mockedScriptTag.id).toEqual('whatfix');
    expect(mockedScriptTag.type).toEqual('text/javascript');
    expect(mockedScriptTag.async).toEqual(true);
    expect(mockedScriptTag.src).toBeTruthy();
  });
});
