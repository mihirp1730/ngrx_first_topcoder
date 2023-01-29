export interface IPackageFilters {
    id: string;
    label: string;
    value: string;
    values: Array<IPackageFilter>;
    isMultiple: boolean;
  }

  export interface IPackageFilter {
    value: string;
    label: string;
  }
  
  export const enum EStatus {
    // Define status for packages
    Draft = 'Draft',
    Publishing = 'Publishing',
    Published = 'Published',
    Unpublished = 'Unpublished'
  }