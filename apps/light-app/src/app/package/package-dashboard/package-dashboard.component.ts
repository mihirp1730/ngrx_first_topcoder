import { Component, ChangeDetectionStrategy } from '@angular/core';

import { PackageService } from '../services/package.service';
import { PackageDataSource } from '../../shared/datasource/package.datasource';
import { Sort, Package, PackageQuery } from '../../shared/datasource/page';
import { IDataType, IPackageFilters, IRegion, ISortFilter, IStatus } from '../interfaces';

@Component({
  selector: 'apollo-package-dashboard',
  templateUrl: './package-dashboard.component.html',
  styleUrls: ['./package-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PackageDashboardComponent {
  // Filters
  public filters: Array<IPackageFilters> = [
    {
      id: 'dataType',
      label: 'Data Type',
      value: null,
      values: [
        { label: 'All', value: null, count: 0 },
        { label: 'Wells', value: IDataType.Wells, count: 0 },
        { label: 'Seismic', value: IDataType.Seismic, count: 0 },
        { label: 'No Type', value: IDataType.NoType, count: 0 }
      ]
    },
    {
      id: 'region',
      label: 'Region',
      value: null,
      values: [
        { label: 'All', value: null, count: 0 },
        { label: 'Region1', value: IRegion.Region1, count: 0 },
        { label: 'Region2', value: IRegion.Region2, count: 0 },
        { label: 'Region3', value: IRegion.Region3, count: 0 }
      ]
    },
    {
      id: 'status',
      label: 'Status',
      value: null,
      values: [
        { label: 'All', value: null, count: 0 },
        { label: 'Expired', value: IStatus.Expired, count: 0 },
        { label: 'Active', value: IStatus.Active, count: 0 },
        { label: 'Subscribed', value: IStatus.Subscribed, count: 0 }
      ]
    }
  ];

  public sortBy: Array<ISortFilter> = [
    {
      label: 'A to Z',
      field: 'name',
      order: 'asc'
    },
    {
      label: 'Z to A',
      field: 'name',
      order: 'desc'
    }
  ];

  initialSort: Sort<Package> = { property: 'name', order: 'asc' };
  initialQuery: PackageQuery = { search: '', dataType: undefined, region: undefined, status: undefined };

  dataSource = new PackageDataSource<Package, PackageQuery>(
    (request, query) => this.packageService.getPackages(request, query),
    this.initialSort,
    this.initialQuery
  );

  constructor(private readonly packageService: PackageService) {}

  public onPackageSearch(term: string): void {
    this.dataSource.queryBy({
      search: term
    });
  }

  public onFilterChange(filter: any): void {
    this.dataSource.queryBy({
      [filter.type]: filter.value
    });
  }

  public onSort(sort: any): void {
    this.dataSource.sortBy({
      property: sort.field,
      order: sort.order
    });
  }
}
