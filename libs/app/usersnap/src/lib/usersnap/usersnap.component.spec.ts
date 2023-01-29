import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IEnvironmentSettings } from '@apollo/api/interfaces';
import { DocumentRef, WindowRef } from '@apollo/app/ref';
import { SecureEnvironmentService } from '@apollo/app/secure-environment';
import { UsersnapComponent } from './usersnap.component';

const mockSecureEnvironmentService = {
  secureEnvironment: {
    app: {
      usersnapUrl: 'http://test.com'
    }
  } as IEnvironmentSettings
};

const mockWindowRef = {
  nativeWindow: {
    onUsersnapCXLoad: jest.fn()
  }
}

const mockDocumentRef = {
  nativeDocument: {
    createElement: jest.fn().mockReturnValue({ async: null, src: null }),
    getElementsByTagName: jest.fn().mockReturnValue([{ appendChild: jest.fn() }])
  }
}

describe('UsersnapComponent', () => {
  let component: UsersnapComponent;
  let fixture: ComponentFixture<UsersnapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        {
          provide: SecureEnvironmentService,
          useValue: { secureEnvironment: null }
        },
        {
          provide: WindowRef,
          useValue: mockWindowRef
        },
        {
          provide: DocumentRef,
          useValue: mockDocumentRef
        }
      ],
      declarations: [UsersnapComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UsersnapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should init app', () => {
    const apiMock = { init: () => { /* Do something */ } };
    const spyInit = jest.spyOn(apiMock, 'init');
    mockWindowRef.nativeWindow.onUsersnapCXLoad(apiMock);
    expect(spyInit).toBeTruthy();
  });

  it('should pass the condition', () => {
    component.insertScript(mockSecureEnvironmentService.secureEnvironment);
    expect(mockDocumentRef.nativeDocument.createElement).toHaveBeenCalled();
  });
});
