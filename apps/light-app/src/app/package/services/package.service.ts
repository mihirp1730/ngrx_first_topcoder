import { Injectable } from '@angular/core';
import { DataPackagesService, IGetDataPackageResponse, IMediaFile } from '@apollo/app/services/data-packages';
import { MediaDownloadService } from '@apollo/app/services/media-download';
import { forkJoin, Observable, of } from 'rxjs';

import { Package, PackageQuery, Page, PageRequest } from '../../shared/datasource/page';

const packages = [
  {
    id: 'das12-123123-asfcasd',
    name: 'test 1',
    status: 'Active',
    region: 'Region1',
    dataType: 'Wells',
    vendor: 'Western Geco',
    modifiedOn: new Date(),
    description: 'Short description about the vendor.'
  },
  {
    id: 'das12-12354723-asfcasd',
    name: 'test 2',
    status: 'Expired',
    region: 'Region3',
    dataType: 'Seismic',
    vendor: 'Hartenergy',
    modifiedOn: new Date(),
    description: 'Short description about the vendor.'
  },
  {
    id: 'das12-123754763-asfcasd',
    name: 'test 3',
    status: 'Active',
    region: 'Region2',
    dataType: 'Wells',
    vendor: 'Western Geco',
    modifiedOn: new Date(),
    description: 'Short description about the vendor.'
  },
  {
    id: 'das12-657856234-asfcasd',
    name: 'test 6',
    status: 'Active',
    region: 'Region2',
    dataType: 'Wells',
    vendor: 'Hartenergy',
    modifiedOn: new Date(),
    description: 'Short description about the vendor.'
  },
  {
    id: 'das12-123123-xcvzxcer',
    name: 'test 4',
    status: 'Subscribed',
    region: 'Region3',
    dataType: 'Wells',
    vendor: 'Western Geco',
    modifiedOn: new Date(),
    description: 'Short description about the vendor.'
  },
  {
    id: '1sdew-123123-asfcasd',
    name: 'test 5',
    status: 'Subscribed',
    region: 'Region1',
    dataType: 'Seismic',
    vendor: 'Hartenergy',
    modifiedOn: new Date(),
    description: 'Short description about the vendor.'
  },
  {
    id: 'das12-123123-asfcasd',
    name: 'test 1',
    status: 'Active',
    region: 'Region1',
    dataType: 'Wells',
    vendor: 'Western Geco',
    modifiedOn: new Date(),
    description: 'Short description about the vendor.'
  },
  {
    id: 'das12-12354723-asfcasd',
    name: 'test 2',
    status: 'Expired',
    region: 'Region3',
    dataType: 'Seismic',
    vendor: 'Hartenergy',
    modifiedOn: new Date(),
    description: 'Short description about the vendor.'
  },
  {
    id: 'das12-123754763-asfcasd',
    name: 'test 3',
    status: 'Active',
    region: 'Region2',
    dataType: 'Wells',
    vendor: 'Western Geco',
    modifiedOn: new Date(),
    description: 'Short description about the vendor.'
  },
  {
    id: 'das12-657856234-asfcasd',
    name: 'test 6',
    status: 'Active',
    region: 'Region2',
    dataType: 'Wells',
    vendor: 'Hartenergy',
    modifiedOn: new Date(),
    description: 'Short description about the vendor.'
  },
  {
    id: 'das12-123123-xcvzxcer',
    name: 'test 4',
    status: 'Subscribed',
    region: 'Region3',
    dataType: 'Wells',
    vendor: 'Western Geco',
    modifiedOn: new Date(),
    description: 'Short description about the vendor.'
  },
  {
    id: '1sdew-123123-asfcasd',
    name: 'test 5',
    status: 'Subscribed',
    region: 'Region1',
    dataType: 'Seismic',
    vendor: 'Hartenergy',
    modifiedOn: new Date(),
    description: 'Short description about the vendor.'
  }
];

@Injectable({
  providedIn: 'root'
})
export class PackageService {
  constructor(private dataPackagesService: DataPackagesService, private mediaDownloadService: MediaDownloadService) {}

  public getPackage(packageId: string): Observable<IGetDataPackageResponse> {
    return this.dataPackagesService.getPublishedDataPackageById(packageId);
  }

  public getPackages(request: PageRequest<Package>, query?: PackageQuery): Observable<Page<Package>> {
    const params = {
      pageNumber: request.page,
      pageSize: request.size,
      sortOrder: request.sort.order,
      sortProperty: request.sort.property
    };

    const newPackages = packages
      .filter((p) => p.name.includes(query.search))
      .filter((p) => (query.dataType ? p.dataType === query.dataType : true))
      .filter((p) => (query.status ? p.status === query.status : true))
      .filter((p) => (query.region ? p.region === query.region : true))
      .sort((a, b) => {
        const aProperty = a[params.sortProperty].toUpperCase();
        const bProperty = b[params.sortProperty].toUpperCase();

        if (aProperty < bProperty) {
          return params.sortOrder === 'asc' ? -1 : 1;
        }

        if (aProperty > bProperty) {
          return params.sortOrder === 'asc' ? 1 : -1;
        }

        return 0;
      });

    return of({
      content: newPackages,
      totalElements: newPackages.length,
      size: 20,
      number: 1
    });
  }

  getDownloadUrl(media: IMediaFile[]) {
    return forkJoin(media.map((element) => this.mediaDownloadService.downloadMedia(element?.fileId)));
  }
}
