import { Component, EventEmitter, Inject, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthUser } from '@apollo/api/interfaces';
import { AuthCodeFlowService } from '@apollo/app/auth-codeflow';
import { take } from 'rxjs';

@Component({
  selector: 'apollo-request-access-modal',
  templateUrl: './request-access-modal.component.html',
  styleUrls: ['./request-access-modal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RequestAccessModalComponent implements OnInit {
  title: string;
  confirmButtonText = 'Yes';
  cancelButtonText = 'No';
  displayObject: boolean;
  opportunityName = '';
  accessTag = '';
  isVDRDisabled: boolean;
  isCIDisabled: boolean;
  showloader = false;
  inviteOptions: Array<any>;

  @Output()
  requestAccessClickEvent: EventEmitter<any> = new EventEmitter<any>();

  requestAccessForm: FormGroup = new FormGroup({
    attendeeEmail: new FormControl(),
    message: new FormControl(''),
    company: new FormControl('', [Validators.required, Validators.pattern('^[^ ]{1}.*')]),
    accessLevels: new FormArray([], [Validators.required])
  });

  constructor(
    public dialogRef: MatDialogRef<RequestAccessModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public readonly authCodeFlowService: AuthCodeFlowService
  ) {}

  onCheckboxChange(event: any) {
    const selectedAccessLevels = this.requestAccessForm.controls.accessLevels as FormArray;
    if (event.checked) {
      selectedAccessLevels.push(new FormControl(event.source.value));
    } else {
      const index = selectedAccessLevels.controls.findIndex((item) => item.value === event.source.value);
      selectedAccessLevels.removeAt(index);
    }
  }

  ngOnInit() {
    if (this.data) {
      this.title = this.data.title ?? this.title;
      this.confirmButtonText = this.data.confirmButtonText ?? this.confirmButtonText;
      this.cancelButtonText = this.data.cancelButtonText ?? this.cancelButtonText;
      this.displayObject = this.data.displayObject ?? this.displayObject;
      this.opportunityName = this.data.opportunityName ?? this.opportunityName;
      this.accessTag = this.data.accessTag ?? this.accessTag;
      this.isVDRDisabled = this.data.isVDRDisabled ?? this.isVDRDisabled;
      this.isCIDisabled = this.data.isCIDisabled ?? this.isCIDisabled;
    }
    this.generateOptions();
    this.authCodeFlowService
      .getUser()
      .pipe(take(1))
      .subscribe((user: AuthUser) => {
        this.requestAccessForm.controls['attendeeEmail'].setValue(user.email);
      });
  }

  generateOptions() {
    this.inviteOptions = [
      { name: 'Details', value: 'CONFIDENTIAL_INFORMATION', disabled: this.isCIDisabled },
      { name: 'Virtual Data Room (VDR)', value: 'VDR', disabled: this.isVDRDisabled }
    ];
  }

  requestAccess() {
    this.requestAccessClickEvent.emit(this.requestAccessForm.value);
  }

  closeModal() {
    this.dialogRef.close(true);
  }
}
