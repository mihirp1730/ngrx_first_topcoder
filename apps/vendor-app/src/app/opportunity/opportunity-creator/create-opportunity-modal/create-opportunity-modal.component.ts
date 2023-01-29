import * as opportunitySelectors from '../../state/selectors/opportunity.selectors';

import { ActivatedRoute, Router } from '@angular/router';
import { AfterViewInit, Component, EventEmitter, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { OpportunityStatus, OpportunityType } from '@apollo/app/services/opportunity';
import { filter, map } from 'rxjs';

import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';

const OPPORTUNITY_NAME_MAX_LENGTH = 100;

@Component({
  selector: 'apollo-create-opportunity-modal',
  templateUrl: './create-opportunity-modal.component.html',
  styleUrls: ['./create-opportunity-modal.component.scss']
})
export class CreateOpportunityModalComponent implements AfterViewInit {
  @ViewChild('content', { static: true }) content: TemplateRef<any>;
  readonly nameMaxLength = OPPORTUNITY_NAME_MAX_LENGTH;
  editMode: boolean;
  readonly opportunityDetails = new FormGroup({
    opportunityName: new FormControl('', [
      Validators.required,
      Validators.pattern('^[a-zA-Z0-9]{1}.*'),
      Validators.maxLength(this.nameMaxLength)
    ]),
    opportunityType: new FormControl(OpportunityType.Public)
  });
  readonly opportunityTypeEnum = OpportunityType;
  readonly opportunityStatusEnum = OpportunityStatus;
  public readonly selectOpportunity$ = this.store
    .select(opportunitySelectors.selectOpportunity)
    .pipe(filter((opportunity) => !!opportunity));

  @Output() createOpportunityFormChanged = new EventEmitter<{opportunityName: '', opportunityType: ''}>();
  public readonly initialFormData$ = this.selectOpportunity$.pipe(
    map((opportunity) => {
      return {
        opportunityName: opportunity.opportunityName,
        opportunityType: opportunity.opportunityType
      };
    })
  );

  constructor(private modalService: MatDialog, public readonly store: Store, private router: Router, private route: ActivatedRoute) {}

  ngAfterViewInit(): void {
    this.route.data.subscribe((data) => {
      this.editMode = data.editMode;
      if (!this.editMode) {
        this.openModal();
      }
    });
  }

  openModal(): void {
    this.modalService.open(this.content, { disableClose: true });
  }

  cancel(): void {
    if(!this.editMode) {
      this.router.navigate(['vendor']);
    }
    this.closeModal();
  }

  private closeModal() {
    this.modalService.closeAll();
  }

  createOpportunity(): void {
    if (this.opportunityDetails.valid) {
      this.createOpportunityFormChanged.emit(this.opportunityDetails.value);
      this.closeModal();
    } else {
      return;
    }
  }
}
