import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { IFilteredValues, IOpportunityRequest, OpportunityStatus } from '@apollo/app/services/opportunity';
import { Store } from '@ngrx/store';
import { SlbDropdownOption } from '@slb-dls/angular-material/dropdown';
import { SlbPaginationControlComponent } from '@slb-dls/angular-material/pagination-control';
import { uniqBy } from 'lodash';
import { Subscription } from 'rxjs';
import { allValue } from '../../../shared/constants/opportunity.constants';

@Component({
  selector: 'apollo-request-table',
  templateUrl: './request-table.component.html'
})
export class RequestTableComponent implements OnInit, OnDestroy, OnChanges {
  readonly opportunityStatusEnum = OpportunityStatus;

  @Input() filteredValues: IFilteredValues;
  @Input() displayedColumns: string[];
  @Input() displayedColumnsClass;
  @Input() tableData: IOpportunityRequest[];

  @Output() approveClickHandler: EventEmitter<IOpportunityRequest> = new EventEmitter<IOpportunityRequest>();
  @Output() rejectClickHandler: EventEmitter<IOpportunityRequest> = new EventEmitter<IOpportunityRequest>();

  public subscriptions = new Subscription();
  public opportunityNames: string[] = [];
  private sort: MatSort;
  private paginator: SlbPaginationControlComponent;
  public dataSource: MatTableDataSource<IOpportunityRequest>;
  public requesterName = new FormControl();
  public opportunityName = new FormControl();
  companyName = new FormControl();
  companyNames: string[] = [];
  all = 'All';
  public pageSizeOptions: SlbDropdownOption[] = [
    {
      viewText: '1',
      value: 1
    },
    {
      viewText: '5',
      value: 5
    },
    {
      viewText: '10',
      value: 10
    }
  ];
  pageSize = 10;
  length = 10;
  @ViewChild(MatSort) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSourceAttributes();
  }
  @ViewChild(SlbPaginationControlComponent) set matPaginator(mp: SlbPaginationControlComponent) {
    this.paginator = mp;
    this.setDataSourceAttributes();
  }
  setDataSourceAttributes() {
    if (this.dataSource) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  constructor(public readonly store: Store) {}
  ngOnInit(): void {
    this.subscriptions.add(
      this.requesterName.valueChanges.subscribe((value) => {
        this.filteredValues.fullName = value.toLowerCase();
        this.dataSource.filter = JSON.stringify(this.filteredValues);
      })
    );

    this.subscriptions.add(
      this.opportunityName.valueChanges.subscribe((opportunityName) => {
        this.filteredValues.opportunityName = opportunityName.value == this.all ? '' : opportunityName.value.toLowerCase();
        this.dataSource.filter = JSON.stringify(this.filteredValues);
      })
    );

    this.subscriptions.add(
      this.companyName.valueChanges.subscribe((companyName) => {
        this.filteredValues.companyName = companyName.value == this.all ? '' : companyName.value.toLowerCase();
        this.dataSource.filter = JSON.stringify(this.filteredValues);
      })
    );
  }

  ngOnChanges(simpleChanges: SimpleChanges) {
    if (simpleChanges?.tableData?.currentValue) {
      this.dataSource = new MatTableDataSource(this.tableData);
      this.opportunityNames = uniqBy(this.tableData, 'opportunityName').map((item) => item.opportunityName);
      this.opportunityNames.unshift(allValue);
      this.companyNames = uniqBy(this.tableData, 'companyName').map((item) => item.companyName);
      this.companyNames.unshift(allValue);
      this.dataSource.paginator = this.paginator;
      this.dataSource.filterPredicate = (data: any, filter) => {
        const searchTerms = JSON.parse(filter);
        return (
          data.opportunityName?.toLowerCase().indexOf(searchTerms.opportunityName) !== -1 &&
          data.fullName.toLowerCase().indexOf(searchTerms.fullName) !== -1 &&
          data.companyName?.toLowerCase().indexOf(searchTerms.companyName) !== -1
        );
      };
    }
  }

  reset() {
    this.companyName.setValue({ value: '', viewText: '' });
    this.opportunityName.setValue({ value: '', viewText: '' });
    this.requesterName.setValue('');
  }

  approveRequest(item: IOpportunityRequest) {
    this.approveClickHandler.emit(item);
  }

  rejectRequest(item: IOpportunityRequest) {
    this.rejectClickHandler.emit(item);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
