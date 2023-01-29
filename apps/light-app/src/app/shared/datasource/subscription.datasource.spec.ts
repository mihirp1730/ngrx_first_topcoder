import { of } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';

import { SubscriptionDataSource } from './subscription.datasource';
import { Sort } from './page';
import { Subscription, SubscriptionQuery } from '../../subscription/interfaces';

describe('SubscriptionDataSource', () => {
  let dataSource: SubscriptionDataSource<Subscription, SubscriptionQuery>;
  let scheduler: TestScheduler;

  const mockResponse = {
    content: [
      { dataSubscriptionId: 'test 1' } as Subscription,
      { dataSubscriptionId: 'test 5' } as Subscription,
      { dataSubscriptionId: 'test 3' } as Subscription,
      { dataSubscriptionId: 'test 2' } as Subscription,
      { dataSubscriptionId: 'test 4' } as Subscription
    ],
    totalElements: 0,
    size: 20,
    number: 1
  };

  const mockService = (r, q) => {
    let content = mockResponse.content;

    if (r.page === 2) {
      content = [{ dataSubscriptionId: 'test 6' } as Subscription];
    }

    return of({
      ...mockResponse,
      content: content
        .filter((p) => p.dataSubscriptionId.includes(q.search))
        .sort((a, b) => {
          if (a.dataSubscriptionId < b.dataSubscriptionId) {
            return r.sort.order === 'asc' ? -1 : 1;
          }
          if (a.dataSubscriptionId > b.dataSubscriptionId) {
            return r.sort.order === 'asc' ? 1 : -1;
          }
          return 0;
        })
    });
  };

  beforeEach(() => {
    const initialSort: Sort<Subscription> = { property: 'dataSubscriptionId', order: 'asc' };
    const initialQuery: SubscriptionQuery = { search: '', dataType: undefined, region: undefined, status: undefined };

    dataSource = new SubscriptionDataSource<Subscription, SubscriptionQuery>(mockService, initialSort, initialQuery);

    scheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });

  it('should create a dataSource', () => {
    expect(dataSource).toBeTruthy();
  });

  it('should return the information', (done) => {
    dataSource.connect().subscribe((subscriptions) => {
      expect(subscriptions).toEqual([
        [
          { dataSubscriptionId: 'test 1' },
          { dataSubscriptionId: 'test 2' },
          { dataSubscriptionId: 'test 3' },
          { dataSubscriptionId: 'test 4' },
          { dataSubscriptionId: 'test 5' }
        ]
      ]);
      done();
    });
  });

  it('should return the information sorted', (done) => {
    dataSource.sortBy({
      property: 'dataSubscriptionId',
      order: 'desc'
    });
    dataSource.connect().subscribe((subscriptions) => {
      expect(subscriptions).toEqual([
        [
          { dataSubscriptionId: 'test 5' },
          { dataSubscriptionId: 'test 4' },
          { dataSubscriptionId: 'test 3' },
          { dataSubscriptionId: 'test 2' },
          { dataSubscriptionId: 'test 1' }
        ]
      ]);
      done();
    });
  });

  it('should return the information filtered', (done) => {
    dataSource.queryBy({
      search: '1'
    });
    dataSource.connect().subscribe((subscriptions) => {
      expect(subscriptions).toEqual([[{ dataSubscriptionId: 'test 1' }]]);
      done();
    });
  });

  it('should return the information of next page', () => {
    scheduler.run(({ cold, expectObservable }) => {
      const expectedMarble = 'a-b';
      const expectedRows = {
        a: [
          [
            { dataSubscriptionId: 'test 1' },
            { dataSubscriptionId: 'test 2' },
            { dataSubscriptionId: 'test 3' },
            { dataSubscriptionId: 'test 4' },
            { dataSubscriptionId: 'test 5' }
          ]
        ],
        b: [[{ dataSubscriptionId: 'test 6' }]]
      };
      cold('a-b').subscribe(() => dataSource.fetch(2));

      expectObservable(dataSource.connect()).toBe(expectedMarble, expectedRows);
    });
  });

  // Method disconnect does nothing, it's needed because it's a data source method
  // Test case to cover 100% coverage
  it('should disconnect', () => {
    dataSource.disconnect();
  });
});
