import { CollectionViewer } from '@angular/cdk/collections';
import { of } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';

import { PackageDataSource } from './package.datasource';
import { Package, PackageQuery, Sort } from './page';

describe('PackageDataSource', () => {
  let dataSource: PackageDataSource<Package, PackageQuery>;
  let scheduler: TestScheduler;

  const mockCollectionViewer = {
    viewChange: of({ end: 0 })
  } as CollectionViewer;
  const mockResponse = {
    content: [
      { name: 'test 1' } as Package,
      { name: 'test 5' } as Package,
      { name: 'test 3' } as Package,
      { name: 'test 2' } as Package,
      { name: 'test 4' } as Package
    ],
    totalElements: 0,
    size: 20,
    number: 1
  };

  const mockService = (r, q) => {
    let content = [...mockResponse.content];

    if (r.page === 2) {
      content = [{ name: 'test 6' } as Package];
    }

    return of({
      ...mockResponse,
      content: content
        .filter((p) => p.name.includes(q.search))
        .sort((a, b) => {
          if (a.name < b.name) {
            return r.sort.order === 'asc' ? -1 : 1;
          }
          if (a.name > b.name) {
            return r.sort.order === 'asc' ? 1 : -1;
          }
          return 0;
        })
    });
  };

  beforeEach(() => {
    const initialSort: Sort<Package> = { property: 'name', order: 'asc' };
    const initialQuery: PackageQuery = { search: '', dataType: undefined, region: undefined, status: undefined };

    dataSource = new PackageDataSource<Package, PackageQuery>(mockService, initialSort, initialQuery);

    scheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });

  it('should create a dataSource', () => {
    expect(dataSource).toBeTruthy();
  });

  it('should return the information in rows', (done) => {
    dataSource.connect(mockCollectionViewer).subscribe((rows) => {
      expect(rows).toEqual([[{ name: 'test 1' }, { name: 'test 2' }, { name: 'test 3' }, { name: 'test 4' }], [{ name: 'test 5' }]]);
      done();
    });
  });

  it('should return the information sorted', (done) => {
    dataSource.sortBy({
      property: 'name',
      order: 'desc'
    });
    dataSource.connect(mockCollectionViewer).subscribe((rows) => {
      expect(rows).toEqual([[{ name: 'test 5' }, { name: 'test 4' }, { name: 'test 3' }, { name: 'test 2' }], [{ name: 'test 1' }]]);
      done();
    });
  });

  it('should return the information filtered', (done) => {
    dataSource.queryBy({
      search: '1'
    });
    dataSource.connect(mockCollectionViewer).subscribe((rows) => {
      expect(rows).toEqual([[{ name: 'test 1' }]]);
      done();
    });
  });

  it('should return the information of next page', () => {
    scheduler.run(({ cold, expectObservable }) => {
      const expectedMarble = 'a-b';
      const expectedRows = {
        a: [[{ name: 'test 1' }, { name: 'test 2' }, { name: 'test 3' }, { name: 'test 4' }], [{ name: 'test 5' }]],
        b: [
          [{ name: 'test 1' }, { name: 'test 2' }, { name: 'test 3' }, { name: 'test 4' }],
          [{ name: 'test 5' }, { name: 'test 6' }]
        ]
      };
      cold('a-b').subscribe(() => dataSource.fetch(2));

      expectObservable(dataSource.connect(mockCollectionViewer)).toBe(expectedMarble, expectedRows);
    });
  });

  it('should disconnect', () => {
    const subSpy = jest.spyOn((dataSource as any).subscription, 'unsubscribe').mockImplementation();
    dataSource.disconnect();
    expect(subSpy).toHaveBeenCalled();
  });
});
