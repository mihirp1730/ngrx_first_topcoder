export interface IPackageFilters {
  id: string;
  label: string;
  value: string;
  values: Array<IPackageFilter>;
}

export interface IPackageFilter {
  value: string;
  label: string;
  count?: number;
}

export interface ISortFilter {
  label: string;
  field: string;
  order: string;
}

export const enum IDataType {
  // Define data types for packages
  Wells = 'Wells',
  Seismic = 'Seismic',
  NoType = 'NoType'
}

export const enum IRegion {
  // Define regions for packages
  Region1 = 'Region1',
  Region2 = 'Region2',
  Region3 = 'Region3'
}

export const enum IStatus {
  // Define status for packages
  Expired = 'Expired',
  Active = 'Active',
  Subscribed = 'Subscribed'
}

export interface IMediaDetails {
  signedUrl: string;
  caption: string;
}
