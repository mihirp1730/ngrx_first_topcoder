import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, ViewEncapsulation, SimpleChanges } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ResultsResponseResult } from '@apollo/api/data-packages/vendor';
import { MediaDownloadService } from '@apollo/app/services/media-download';

import { ConfirmModalComponent } from '../../confirm-modal/confirm-modal.component';
import { Labels } from '../../shared/constants/data-package.constants';

@Component({
  selector: 'apollo-vendor-dashboard-card',
  templateUrl: './vendor-dashboard-card.component.html',
  styleUrls: ['./vendor-dashboard-card.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VendorDashboardCardComponent implements OnChanges {
  @Input() packageDetails: ResultsResponseResult;
  @Output() deletePackage: EventEmitter<ResultsResponseResult> = new EventEmitter<ResultsResponseResult>();
  @Output() unpublishPackageEvent: EventEmitter<ResultsResponseResult> = new EventEmitter<ResultsResponseResult>();

  imgPlaceHolderSrc = 'assets/images/no-image-placeholder.png';
  mediaUrl: string;
  showLoadingMsg = false;
  readonly labels = Labels;

  constructor(
    private dialog: MatDialog, private route: Router,
    private mediaDownloadService: MediaDownloadService,
    private changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnChanges(simpleChanges: SimpleChanges) {
    if(simpleChanges?.packageDetails?.currentValue) {

      this.mediaUrl = this.imgPlaceHolderSrc;

      const media = this.packageDetails?.image;
      if(media?.fileId) {
        this.showLoadingMsg = true;
        this.mediaDownloadService.downloadMedia(media.fileId).subscribe((signedUrl: string) => {
          this.mediaUrl = signedUrl || this.imgPlaceHolderSrc;
          this.showLoadingMsg = false;
          this.changeDetectorRef.detectChanges();
        });
      }
    }
  }

  deleteDraft() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.panelClass = 'delete-draft-modal-panel';
    dialogConfig.disableClose = true;
    dialogConfig.data = {
      title: this.labels.deleteDataPackage,
      content: this.labels.deletePackageContent,
      subContent: this.labels.deletePackageSubContent,
      confirmButtonText: this.labels.deletePackage,
      cancelButtonText: this.labels.cancel
    };
    const dialogRef = this.dialog.open(ConfirmModalComponent, dialogConfig);

    dialogRef.componentInstance.yesClickEvent.subscribe(() => {
      this.deletePackage.emit(this.packageDetails);
    });
  }

  unpublishPackage() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.panelClass = 'unpublish-package-modal-panel';
    dialogConfig.disableClose = true;
    dialogConfig.data = {
      title: this.labels.unpublishDataPackage,
      content: this.labels.unpublishPackageContent,
      confirmButtonText: this.labels.unPublish,
      cancelButtonText: this.labels.cancel
    };
    const dialogRef = this.dialog.open(ConfirmModalComponent, dialogConfig);

    dialogRef.componentInstance.yesClickEvent.subscribe(() => {
      this.unpublishPackageEvent.emit(this.packageDetails);
    });
  }

  editPackage() {
    this.route.navigateByUrl(`vendor/package/edit/${this.packageDetails.id}`);
  }
}
