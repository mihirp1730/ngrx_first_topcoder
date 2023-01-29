import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, tap } from 'rxjs/operators';

import { IPackageFilters, ISortFilter } from '../interfaces';

@Component({
  selector: 'apollo-packages-filter',
  templateUrl: './package-filter.component.html',
  styleUrls: ['./package-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PackageFilterComponent implements OnInit, OnDestroy {
  @Input() filters: Array<IPackageFilters>;
  @Input() sortBy: ISortFilter[];

  @Output() filterChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() sort: EventEmitter<any> = new EventEmitter<any>();
  @Output() packageSearch: EventEmitter<string> = new EventEmitter<string>();

  private subscription: Subscription = new Subscription();
  private search: Subject<string> = new Subject<string>();

  public ngOnInit(): void {
    this.subscription.add(
      this.search
        .pipe(
          debounceTime(1000),
          tap((value) => {
            this.packageSearch.emit(value);
          })
        )
        .subscribe()
    );
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onSearch(term: string): void {
    this.search.next(term);
  }

  onFilterSelectionChange(filterId: string, filterValue: string): void {
    const filter = {
      type: filterId,
      value: filterValue === 'All' ? null : filterValue
    };
    this.filterChange.emit(filter);
  }

  onSort(option: any): void {
    const [field, order] = option.value.split('-');

    this.sort.emit({
      field,
      order
    });
  }
}
