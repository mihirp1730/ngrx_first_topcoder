import { TestBed } from '@angular/core/testing';

import { LassoToolsService } from './lasso-tools.service';
import { LassoTool } from './lasso-tools/lasso-tools.helper';

describe('LassoToolsService', () => {
  let service: LassoToolsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LassoToolsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return current lasso', done => {
    service.getCurrentLasso().subscribe((result) => {
      expect(result).toEqual(LassoTool.NONE);
      done();
    });
  });

  it('should update lasso', done => {
    service.updateCurrentLasso(LassoTool.POLYGON);
    service.getCurrentLasso().subscribe((result) => {
      expect(result).toEqual(LassoTool.POLYGON);
      done();
    });
  });

  it('should clear lasso tool', done => {
    service.updateCurrentLasso(LassoTool.POLYGON);
    service.clearCurrentLasso();
    service.getCurrentLasso().subscribe(result => {
      expect(result).toEqual(LassoTool.NONE);
      done();
    });
  });  
});
