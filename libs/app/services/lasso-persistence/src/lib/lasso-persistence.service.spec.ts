import { TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { GisMapLargeService} from '@slb-innersource/gis-canvas';

import {mockGisMapLargeService} from '../services.mock';
import { LassoPersistenceService } from './lasso-persistence.service';

describe('LassoPersistenceService', () => {

    let service: LassoPersistenceService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideMockStore(),
                {
                    provide: GisMapLargeService,
                    useValue: mockGisMapLargeService
                },

            ]
        });

    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('drawLassoShape', () => {
        it('should draw lasso shape and persist it on map', () => {
            
            const spatialQuery = "POLYGON(-77.25 7.84,-104.06 29.49,-58.62 51.70,-52.03 25.68)"

            service = TestBed.inject(LassoPersistenceService);
            service.drawLassoShape(spatialQuery);
            
            expect(mockGisMapLargeService.drawingManager.addDrawingFromWKT).toHaveBeenCalledWith(spatialQuery);
        });
    });
    
    describe('clearLassoShape conditional check', () => {

        it('should draw lasso shape then clear the lasso shape', () => {
            
            const spatialQuery = "POLYGON(-77.25 7.84,-104.06 29.49,-58.62 51.70,-52.03 25.68)"
            const _drawingId = "drawingId"
            service = TestBed.inject(LassoPersistenceService);
            mockGisMapLargeService.drawingManager.addDrawingFromWKT.mockReturnValue(_drawingId)
            service.drawLassoShape(spatialQuery);
            service.clearLassoShape();
            
            expect(mockGisMapLargeService.drawingManager.addDrawingFromWKT).toHaveBeenCalledWith(spatialQuery);
            expect(mockGisMapLargeService.drawingManager.removeDrawing).toHaveBeenCalled();

        });
    });

    describe('clearLassoShape', () => {
        it('should not call removeDrawing since there was no lasso drawing on the map', () => {
            
            service = TestBed.inject(LassoPersistenceService);
            service.clearLassoShape();

            expect(mockGisMapLargeService.drawingManager.removeDrawing).not.toHaveBeenCalled()
        })
    })
    
});
