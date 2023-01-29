import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, combineLatest, Observable, Subject, Subscription } from 'rxjs';
import { switchMap, startWith, map, shareReplay, finalize } from 'rxjs/operators';

import { Page, Sort, DataEndpoint } from './page';

export class PackageDataSource<T, Q> extends DataSource<Array<T>> {
  private cache: Array<T> = Array.from<T>({ length: 0 });
  private lastPage = 0;
  private subscription = new Subscription();

  private pageNumber = new Subject<number>();
  private loading = new Subject<boolean>();
  private sort: BehaviorSubject<Sort<T>>;
  private query: BehaviorSubject<Q>;

  private config = {
    itemsPerPage: 20,
    itemsPerRow: 4
  };

  public page$: Observable<Page<T>>;
  public loading$: Observable<boolean> = this.loading.asObservable();

  constructor(endpoint: DataEndpoint<T, Q>, initialSort: Sort<T>, initialQuery: Q, size = 5) {
    super();

    this.config.itemsPerPage = size;
    this.sort = new BehaviorSubject<Sort<T>>(initialSort);
    this.query = new BehaviorSubject<Q>(initialQuery);
    this.page$ = combineLatest([this.sort, this.query]).pipe(
      switchMap(([sort, query]) =>
        this.pageNumber.pipe(
          startWith(0),
          switchMap((page) => {
            this.loading.next(true);
            return endpoint({ page, sort, size }, query).pipe(finalize(() => this.loading.next(false)));
          })
        )
      ),
      shareReplay(1)
    );
  }

  sortBy(sort: Partial<Sort<T>>): void {
    const lastSort = this.sort.getValue();
    const nextSort = { ...lastSort, ...sort };
    this.cleanCache();
    this.sort.next(nextSort);
  }

  queryBy(query: Partial<Q>): void {
    const lastQuery = this.query.getValue();
    const nextQuery = { ...lastQuery, ...query };
    this.cleanCache();
    this.query.next(nextQuery);
  }

  fetch(page: number): void {
    this.pageNumber.next(page);
  }

  connect(collectionViewer: CollectionViewer): Observable<Array<Array<T>>> {
    this.subscription.add(
      collectionViewer.viewChange.subscribe((range) => {
        // Get current page
        const currentPage = Math.floor((range.end * this.config.itemsPerRow) / this.config.itemsPerPage);

        // If we reach the bottom of the list we retrieve more data
        if (currentPage > this.lastPage) {
          // Update the last page loaded reference
          this.lastPage = currentPage;

          // Fetch the page
          this.fetch(currentPage);
        }
      })
    );

    return this.page$.pipe(
      map((page) => page.content),
      map((packages) => {
        // Append the packages to the end and save them in memory
        this.cache = this.cache.concat(packages);
        return this.cache;
      }),
      map((packages) => this.convertResponseToRows(packages))
    );
  }

  disconnect(): void {
    this.subscription.unsubscribe();
  }

  private convertResponseToRows(items: Array<T>): Array<Array<T>> {
    // Obtain how many rows we need
    const rowSize = Math.ceil(items.length / this.config.itemsPerRow);
    // Generate the skeleton of the rows
    const rows = Array.from({ length: rowSize }, () => []);

    // Iterate over the packages and set the information into the respective row
    items.forEach((pkg, index) => {
      // Obtain the row where the package should go
      const rowIndex = Math.ceil((index + 1) / this.config.itemsPerRow) - 1;
      rows[rowIndex].push(pkg);
    });

    return rows;
  }

  private cleanCache(): void {
    this.cache = Array.from<T>({ length: 0 });
    this.lastPage = 0;
    // scroll to top
  }
}
