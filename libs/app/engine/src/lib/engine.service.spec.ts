import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { EngineService, SESSION_SERVICE_API_URL } from './engine.service';

describe('EngineService', () => {
  let service: EngineService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        EngineService,
        {
          provide: SESSION_SERVICE_API_URL,
          useValue: 'test'
        }
      ]
    });

    service = TestBed.inject(EngineService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should execute get new session', () => {
    service.getNewSession().subscribe();
    const req = httpMock.expectOne(`test/NewSession`);
    req.flush({});
  });

  it('should execute post changes', () => {
    service.postChangeSessionComponent({}).subscribe();
    const req = httpMock.expectOne(`test/ChangeSessionComponent`);
    req.flush({});
  });

  it('should execute post instance data', () => {
    service.postChangeSessionComponentInstanceData({}).subscribe();
    const req = httpMock.expectOne(`test/ChangeSessionComponentInstanceData`);
    req.flush({});
  });

  it('should execute delete session', () => {
    service.deleteDeleteSession().subscribe();
    const req = httpMock.expectOne(`test/DeleteSession`);
    req.flush({});
  });
});
