import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AccessStatus, IFilteredValues, IOppSubscription, OpportunityStatus } from '@apollo/app/services/opportunity';
import { Store } from '@ngrx/store';
import { SlbPaginationControlComponent } from '@slb-dls/angular-material/pagination-control';
import { map, Subscription } from 'rxjs';

import { VendorAppService } from '@apollo/app/vendor';
import { uniqBy } from 'lodash';
import { AddInviteUserModelComponent } from '../../add-invite-user-model/add-invite-user-model.component';
import { allValue } from '../../shared/constants/opportunity.constants';
import * as opportunityActions from '../state/actions/opportunity.actions';
import * as opportunitySelectors from '../state/selectors/opportunity.selectors';
import { ManageSubscriptionModalComponent } from './manage-subscription-modal/manage-subscription-modal.component';

interface SlbDropdownOption {
  viewText: string;
  value: any;
  descriptionText?: string;
  isDisabled?: boolean;
}

@Component({
  selector: 'apollo-manage-access',
  templateUrl: './manage-access.component.html',
  styleUrls: ['./manage-access.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ManageAccessComponent implements OnInit, OnDestroy {
  private subscriptions = new Subscription();
  private sort: MatSort;
  private paginator: SlbPaginationControlComponent;

  public opportunityStatus = OpportunityStatus;
  readonly accessDetailStatus = AccessStatus;

  public opportunitySubscriptions: IOppSubscription[] = [];
  public opportunityNameList: SlbDropdownOption[];
  public showLoader$ = this.store.select(opportunitySelectors.selectShowLoader);
  public opportunitySubscriptionId$ = this.store
    .select(opportunitySelectors.selectOpportunitySubscriptionId)
    .pipe(map((ids) => (ids?.length > 0 ? true : false)));
  public dataSource: MatTableDataSource<IOppSubscription>;
  public searchControl: FormControl = new FormControl();
  userName = new FormControl();
  opportunityNames: string[] = [];
  opportunityName = new FormControl();
  companyName = new FormControl();
  companyNames: string[] = [];
  public filteredValues: IFilteredValues = { fullName: '', opportunityName: '', companyName: '' };
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
  displayedColumns: string[] = ['username', 'company', 'opportunity', 'confidentialInfo', 'VDR', 'action'];
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

  constructor(public readonly store: Store, public dialog: MatDialog, private vendorAppService: VendorAppService) {}

  ngOnInit(): void {
    this.store.dispatch(opportunityActions.getOpportunitySubscriptions());
    this.store.dispatch(opportunityActions.getPublishedPublicOpportunities());

    this.subscriptions.add(
      this.store.select(opportunitySelectors.selectOpportunitySubscriptions).subscribe((subscriptions: IOppSubscription[]) => {
        let fullName;
        subscriptions = subscriptions.map((item) => {
          fullName = `${item.firstName} ${item.lastName}`;
          item.accessDetails?.map((accessDetail) => {
            if (accessDetail?.accessLevel?.toLowerCase() === 'confidential_information') {
              item = { ...item, isConfInfo: true, confiInfoStatus: accessDetail?.status, fullName };
            } else if (accessDetail?.accessLevel?.toLowerCase() === 'vdr') {
              item = { ...item, isVDR: true, vdrStatus: accessDetail?.status, fullName };
            }
          });
          return item;
        });
        this.opportunitySubscriptions = subscriptions;
        this.dataSource = new MatTableDataSource(subscriptions);
        this.opportunityNames = uniqBy(subscriptions, 'opportunityName').map((item) => item.opportunityName);
        this.opportunityNames.unshift(allValue);
        this.companyNames = uniqBy(subscriptions, 'companyName').map((item) => item.companyName);
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
      })
    );
    this.store.select(opportunitySelectors.selectPublicPublishedOpportunities).subscribe((opportunities) => {
      const publishedOpportunity = opportunities?.filter(
        (opportunity) => opportunity.dataVendorId === this.vendorAppService.dataVendors[0].dataVendorId
      );
      this.opportunityNameList = publishedOpportunity?.map((item) => {
        return { viewText: item.opportunityName, value: item.opportunityId, endDate: item.offerEndDate };
      });
    });
    this.subscriptions.add(
      this.userName.valueChanges.subscribe((value) => {
        this.filteredValues.fullName = value.toLowerCase();
        this.dataSource.filter = JSON.stringify(this.filteredValues);
      })
    );

    this.subscriptions.add(
      this.opportunityName.valueChanges.subscribe((opportunityName) => {
        this.filteredValues.opportunityName = opportunityName.value == allValue ? '' : opportunityName.value.toLowerCase();
        this.dataSource.filter = JSON.stringify(this.filteredValues);
      })
    );

    this.subscriptions.add(
      this.companyName.valueChanges.subscribe((companyName) => {
        this.filteredValues.companyName = companyName.value == allValue ? '' : companyName.value.toLowerCase();
        this.dataSource.filter = JSON.stringify(this.filteredValues);
      })
    );
  }

  manageAccess(item: IOppSubscription) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.panelClass = 'manage-access-modal-panel';
    dialogConfig.disableClose = true;
    dialogConfig.data = {
      item
    };
    this.dialog.open(ManageSubscriptionModalComponent, dialogConfig);
  }

  addUserModal(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.panelClass = 'add-invite-user-modal-panel';
    dialogConfig.disableClose = true;
    dialogConfig.data = {
      component: 'add_user',
      title: 'Add Users',
      item: this.opportunitySubscriptions,
      opportunityNameList: this.opportunityNameList,
      closeModal: this.opportunitySubscriptionId$
    };
    const dialogRef = this.dialog.open(AddInviteUserModelComponent, dialogConfig);
    dialogRef.componentInstance.createSubscriptionClickEvent.subscribe((payload) => {
      this.store.dispatch(opportunityActions.createOpportunitySubscription({ payload }));
    });
    dialogRef.componentInstance.getSubscriptionsEvent.subscribe(() => {
      this.store.dispatch(opportunityActions.getOpportunitySubscriptions());
      this.store.dispatch(opportunityActions.removeSubscriptionId());
    });
  }

  isOpportunityDisabled(item: IOppSubscription): boolean {
    return (
      item.opportunityStatus?.toUpperCase() === this.opportunityStatus.Expired.toUpperCase() ||
      item.opportunityStatus?.toUpperCase() === this.opportunityStatus.Unpublished.toUpperCase()
    );
  }

  reset() {
    this.companyName.setValue({ value: '', viewText: '' });
    this.opportunityName.setValue({ value: '', viewText: '' });
    this.userName.setValue('');
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
