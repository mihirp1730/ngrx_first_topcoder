import { Observable } from 'rxjs';

export interface Package {
  name: string;
  status: string;
  dataType: string;
  region: string;
}

export interface PackageQuery {
  search: string;
  dataType: string;
  status: string;
  region: string;
}

export interface Sort<T> {
  property: keyof T;
  order: 'asc' | 'desc';
}

export interface PageRequest<T> {
  page: number;
  size: number;
  status?: string;
  sort?: Sort<T>;
}

export interface Page<T> {
  content: Array<T>;
  totalElements: number;
  size: number;
  number: number;
}

export type DataEndpoint<T, Q> = (req: PageRequest<T>, query: Q) => Observable<Page<T>>;
