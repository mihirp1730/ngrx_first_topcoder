import { Component, Output, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { isEqual } from 'lodash';
import { combineLatest } from 'rxjs';
import { distinctUntilChanged, filter, map, startWith, take } from 'rxjs/operators';
import * as opportunitySelectors from '../../state/selectors/opportunity.selectors';

@Component({
  selector: 'apollo-additional-services',
  templateUrl: './additional-services.component.html',
  styleUrls: ['./additional-services.component.scss']
})
export class AdditionalServicesComponent implements OnInit {
  constructor(public readonly store: Store) {}

  static readonly DEFAULT_VALUE = { vdrLink: '', accountName: '', departmentName: '' };

  public opportunityProfile$ = this.store.select(opportunitySelectors.selectOpportunity).pipe(
    filter((opportunity) => !!opportunity?.opportunityVDR),
    map((opportunity) => opportunity.opportunityVDR)
  );

  public initialFormData$ = this.opportunityProfile$.pipe(
    map((opportunityVDR) => {
      const { vdrLink, accountName, departmentName } = opportunityVDR;
      return { vdrLink, accountName, departmentName };
    }),
    take(1) // we only care about the initial value
  );

  additionalServicesDetails = new FormGroup({
    vdrLink: new FormControl(''),
    accountName: new FormControl(''),
    departmentName: new FormControl('')
  });

  @Output() additionalServicesChanged = this.additionalServicesDetails.valueChanges.pipe(
    map((value) => value),
    distinctUntilChanged()
  );

  @Output() isAdditionalServicesDirty = combineLatest([
    this.initialFormData$.pipe(startWith(AdditionalServicesComponent.DEFAULT_VALUE)),
    this.additionalServicesDetails.valueChanges.pipe(startWith(this.additionalServicesDetails.value))
  ]).pipe(map(([initialFormData, formValue]) => isEqual(formValue, initialFormData)));

  @Output() formIsValid = this.additionalServicesDetails.statusChanges.pipe(
    map((status) => status === 'VALID'),
    distinctUntilChanged()
  );

  ngOnInit() {
    // adding this to trigger valuechange event
    this.additionalServicesDetails.updateValueAndValidity();
  }
}
