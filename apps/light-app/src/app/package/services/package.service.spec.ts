import { TestBed } from '@angular/core/testing';
import { DataPackagesService } from '@apollo/app/services/data-packages';
import { MediaDocumentUploaderService } from '@apollo/app/services/media-document-uploader';
import { MediaDownloadService } from '@apollo/app/services/media-download';

import { mockDataPackagesService, mockMediaDocumentUploaderService, mockMediaDownloadService } from '../../shared/services.mock';
import { PackageService } from './package.service';

describe('PackageService', () => {
  let service: PackageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: DataPackagesService,
          useValue: mockDataPackagesService
        },
        {
          provide: MediaDocumentUploaderService,
          useValue: mockMediaDocumentUploaderService
        },
        {
          provide: MediaDownloadService,
          useValue: mockMediaDownloadService
        }
      ]
    });
    service = TestBed.inject(PackageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getPackage', () => {
    it('should call getPackage', (done) => {
      service.getPackage('test').subscribe((response) => {
        expect(response).toEqual({ id: 'test' });
        done();
      });
    });
  });

  describe('getPackages', () => {
    const pageRequest: any = {
      page: 1,
      size: 2,
      sort: {
        property: 'status',
        order: 'asc'
      }
    };

    const packageQuery = {
      search: 'test',
      dataType: 'Seismic',
      status: 'Subscribed',
      region: 'Region1'
    };

    it('should call getPackage', (done) => {
      service.getPackages(pageRequest, packageQuery).subscribe((response) => {
        expect(response).toBeDefined();
        done();
      });
    });
    it('should call handle without optional params', (done) => {
      service
        .getPackages(pageRequest, {
          ...packageQuery,
          dataType: undefined,
          status: undefined,
          region: undefined
        })
        .subscribe((response) => {
          expect(response).toBeDefined();
          done();
        });
    });
  });
});
