import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { ContentDownloaderService } from '../../services/content-downloader.service';

@Component({
  selector: 'apollo-subscription-table-actions',
  templateUrl: './subscription-table-actions.component.html',
  styleUrls: ['./subscription-table-actions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubscriptionTableActionsComponent implements OnInit {
  @Input() subscriptionStatus: string;
  @Input() subscriptionId: string;

  constructor(private readonly downloaderService: ContentDownloaderService) {}

  ngOnInit(): void {
    this.subscriptionStatus = this.subscriptionStatus ? this.subscriptionStatus.toUpperCase() : null;
  }

  download(evt) {
    evt.stopPropagation();
    this.downloaderService.download(this.subscriptionId);
  }
}
