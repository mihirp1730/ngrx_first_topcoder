import { TestBed } from "@angular/core/testing";
import { provideMockStore } from "@ngrx/store/testing";
import { GisMapLargeService } from "@slb-innersource/gis-canvas";
import { mockGisMapLargeService } from '../../shared/services.mock';
import { GisHandlerService } from "./gis-handler.service";

describe('GisHandlerService', () => {
    let service: GisHandlerService;
  
    beforeEach(() => {
        TestBed.configureTestingModule({
        providers: [
        provideMockStore(),
            {
                provide: GisMapLargeService,
                useValue: mockGisMapLargeService
            }
        ]
        })
    })

describe('setZoom', () => {
    it('should set zoom level based on screen width', () => {
      [
        { w: 0, z: 0 },
        { w: 1601, z: 2 },
        { w: 2001, z: 3 }
      ].forEach(({ w, z }) => {
        service = TestBed.inject(GisHandlerService);
        service.setZoom(w);
        expect(mockGisMapLargeService.setZoom).toHaveBeenCalledWith(z);
      });
    });
  });
});