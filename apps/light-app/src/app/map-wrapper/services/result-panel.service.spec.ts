import { TestBed } from '@angular/core/testing';
import { WindowRef } from '@apollo/app/ref';
import { take } from 'rxjs/operators';

import { ResultPanelService } from './result-panel.service';

describe('ResultPanelService', () => {
  let resultPanelService: ResultPanelService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        {
          provide: WindowRef,
          useValue: {}
        },
        ResultPanelService
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    resultPanelService = TestBed.inject(ResultPanelService);
  });

  describe('result panel', () => {
    describe('showDataLayers', () => {
      it('should update showingDataLayers$', (done) => {
        resultPanelService.showPackages();
        resultPanelService.showingPackages$.pipe(take(1)).subscribe((value) => {
          expect(value).toBe(true);
          resultPanelService.showDataLayers();
          resultPanelService.showingDataLayers$.pipe(take(1)).subscribe((value) => {
            expect(value).toBe(true);
            done();
          });
        });
      });
    });
    describe('showPackages', () => {
      it('should update showingPackages$', (done) => {
        resultPanelService.showPackages();
        resultPanelService.showingPackages$.pipe(take(1)).subscribe((value) => {
          expect(value).toBe(true);
          done();
        });
      });
    });
    describe('showingDataLayers$', () => {
      it('should return datalayers', (done) => {
        resultPanelService.showingDataLayers$.subscribe((value) => {
          expect(value).toBe(true);
          done();
        });
      });
    });
    describe('totalMessage$', () => {
      it('should return a stream', (done) => {
        resultPanelService.totalMessage$.subscribe((message) => {
          expect(message).toBe('Showing 0 results');
          done();
        });
      });
    });
  });
});
