import { DataSource } from '@angular/cdk/collections';
import { noop } from 'lodash';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { switchMap, startWith, map, shareReplay, finalize } from 'rxjs/operators';
import { Page, Sort, DataEndpoint } from './page';

export class SubscriptionDataSource<T, Q> implements DataSource<Array<T>> {
  private pageNumber = new Subject<number>();
  private loading = new Subject<boolean>();
  private sort: BehaviorSubject<Sort<T>>;
  private query: BehaviorSubject<Q>;

  public page$: Observable<Page<T>>;
  public loading$: Observable<boolean> = this.loading.asObservable();

  constructor(endpoint: DataEndpoint<T, Q>, initialSort: Sort<T>, initialQuery: Q, size = 5) {
    this.sort = new BehaviorSubject<Sort<T>>(initialSort);
    this.query = new BehaviorSubject<Q>(initialQuery);
    this.page$ = combineLatest([this.sort, this.query]).pipe(
      switchMap(([sort, query]) =>
        this.pageNumber.pipe(
          startWith(0),
          switchMap((page) => {
            this.loading.next(true);
            return endpoint({ page, sort, size, status }, query).pipe(finalize(() => this.loading.next(false)));
          })
        )
      ),
      shareReplay(1)
    );
  }

  sortBy(sort: Partial<Sort<T>>): void {
    const lastSort = this.sort.getValue();
    const nextSort = { ...lastSort, ...sort };
    this.sort.next(nextSort);
  }

  queryBy(query: Partial<Q>): void {
    const lastQuery = this.query.getValue();
    const nextQuery = { ...lastQuery, ...query };
    this.query.next(nextQuery);
  }

  fetch(page: number): void {
    this.pageNumber.next(page);
  }

  connect(): Observable<Array<Array<T>>> {
    return this.page$.pipe(
      map((page) => {
        return [page.content];
      })
    );
  }

  disconnect(): void {
    noop();
  }
}
