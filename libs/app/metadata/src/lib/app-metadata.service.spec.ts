import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { getTestBed, TestBed } from '@angular/core/testing';
import { noop } from 'lodash';
import { forkJoin, Observable, of } from 'rxjs';
import { v4 as uuid } from 'uuid';

import { ICategory } from './app-metadata.interface';
import { METADATA_SERVICE_API_URL, MetadataService } from './app-metadata.service';

describe('metadata.service.ts', () => {
  let testBed: TestBed;
  let service: MetadataService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        MetadataService,
        {
          provide: METADATA_SERVICE_API_URL,
          useValue: 'test'
        }
      ]
    });
    testBed = getTestBed();
    service = testBed.inject(MetadataService);
    httpMock = testBed.inject(HttpTestingController);
  });

  it('should create a MetadataService object', () => {
    expect(service).toBeTruthy();
  });

  describe('metadata$', () => {

    it('should get metadata upon subscription', (done) => {
      const exampleMetadata: any = { metadata: true };
      service.metadata$.subscribe((metadata) => {
        expect(metadata).toEqual({ ...exampleMetadata });
        done();
      });
      const req = httpMock.expectOne('test/layers');
      req.flush({ ...exampleMetadata });
    });

    it('should get nothing upon error', (done) => {
      service.metadata$.subscribe((metadata) => {
        expect(metadata).toEqual([]);
        done();
      });
      const req = httpMock.expectOne('test/layers');
      req.error(new ErrorEvent('some error happened'));
    });

    describe('multiple consumers', () => {
      it('should return a cached value', () => {
        const exampleMetadata: any = { metadata: true };
        service.metadata$.subscribe(() => noop());
        const req = httpMock.expectOne('test/layers');
        req.flush({ ...exampleMetadata });
        service.metadata$.subscribe(() => noop());
        httpMock.expectNone('test');
      });

      it('should get caught from making another HTTP request', () => {
        const exampleMetadata: any = { metadata: true };
        service.metadata$.subscribe(() => noop());
        const req = httpMock.expectOne('test/layers');
        service.metadata$.subscribe(() => noop());
        req.flush({ ...exampleMetadata });
        httpMock.expectNone('test');
      });
    });

  });

  describe('getMetadataFromType', () => {
    it('should return metadata from the corresponding type', async () => {
      (service as any)._metadata$ = of([
          {
              name: 'Test',
              mapLargeTable: 'slb/dd_Test'
          }
      ]) as unknown as Observable<ICategory[]>;

      const result = await service.getMetadataFromType('Test');

      expect(result).toEqual({
              name: 'Test',
              mapLargeTable: 'slb/dd_Test'
          } as unknown as ICategory);
    });
  });

  describe('marketingLayers$', () => {
    it('should get marketing layers metadata upon subscription', (done) => {
      const exampleMarketingLayers = uuid();
      service.marketingLayers$.subscribe((marketingLayers) => {
        expect(marketingLayers).toEqual(exampleMarketingLayers);
        done();
      });
      const req = httpMock.expectOne('test/marketing-layers');
      req.flush(exampleMarketingLayers);
    });

    it('should get nothing upon error', (done) => {
      service.marketingLayers$.subscribe((marketingLayers) => {
        expect(marketingLayers).toEqual([]);
        done();
      });
      const req = httpMock.expectOne('test/marketing-layers');
      req.error(new ErrorEvent('some error happened'));
    });

    describe('multiple consumers', () => {
      it('should return a cached value', () => {
        const exampleMarketingLayers = uuid();
        service.marketingLayers$.subscribe(() => noop());
        const req = httpMock.expectOne('test/marketing-layers');
        req.flush(exampleMarketingLayers);
        service.marketingLayers$.subscribe(() => noop());
        httpMock.expectNone('test/marketing-layers');
      });

      it('should get caught from making another HTTP request', () => {
        const exampleMarketingLayers = uuid();
        service.marketingLayers$.subscribe(() => noop());
        const req = httpMock.expectOne('test/marketing-layers');
        service.marketingLayers$.subscribe(() => noop());
        req.flush(exampleMarketingLayers);
        httpMock.expectNone('test/marketing-layers');
      });
    });

  });

  describe('regions$', () => {
    it('should get regions metadata upon subscription', (done) => {
      const exampleRegions: any = { regions: true };
      service.regions$.subscribe((regions) => {
        expect(regions).toEqual({ ...exampleRegions });
        done();
      });
      const req = httpMock.expectOne('test/regions');
      req.flush({ ...exampleRegions });
    });

    it('should get nothing upon error', (done) => {
      service.regions$.subscribe((regions) => {
        expect(regions).toEqual([]);
        done();
      });
      const req = httpMock.expectOne('test/regions');
      req.error(new ErrorEvent('some error happened'));
    });

    describe('multiple consumers', () => {
      it('should return a cached value', () => {
        const exampleRegions: any = { regions: true };
        service.regions$.subscribe(() => noop());
        const req = httpMock.expectOne('test/regions');
        req.flush({ ...exampleRegions });
        service.regions$.subscribe(() => noop());
        httpMock.expectNone('test');
      });

      it('should get caught from making another HTTP request', () => {
        const exampleRegions: any = { regions: true };
        service.regions$.subscribe(() => noop());
        const req = httpMock.expectOne('test/regions');
        service.regions$.subscribe(() => noop());
        req.flush({ ...exampleRegions });
        httpMock.expectNone('test');
      });
    });

  });

  describe('opportunity$', () => {
    it('should get opportunity metadata upon subscription', (done) => {
      service.opportunity$.subscribe((opportunity) => {
        expect(opportunity.length).toBe(6);
        done();
      });
    });
  });

  describe('opportunitiesMetadata$', () => {
    it('should get opportunities metadata upon subscription', (done) => {
      const opportunitiesMetadata = {
        assetTypes: [],
        deliveryTypes: [],
        offerTypes: [],
        contractTypes: [],
        phaseTypes: []
      };
      forkJoin([
        service.assetTypesMetadata$, service.deliveryTypesMetadata$,
        service.offerTypesMetadata$, service.contractTypesMetadata$,
        service.phaseTypesMetadata$
      ]).subscribe(([ assetTypes, deliveryTypes, offerTypes, contractTypes, phaseTypes ]) => {
        expect(assetTypes).toBe(opportunitiesMetadata.assetTypes);
        expect(offerTypes).toBe(opportunitiesMetadata.offerTypes);
        expect(deliveryTypes).toBe(opportunitiesMetadata.deliveryTypes);
        expect(contractTypes).toBe(opportunitiesMetadata.contractTypes);
        expect(phaseTypes).toBe(opportunitiesMetadata.phaseTypes);
        done();
      });

      const req = httpMock.expectOne('test/opportunities');
      req.flush({...opportunitiesMetadata});
    });

  });

});
