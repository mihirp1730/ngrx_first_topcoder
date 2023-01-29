import { Component, Input, OnInit } from '@angular/core';
import { IMedia } from '@apollo/app/services/opportunity-attendee';

const PLACE_HOLDER = 'assets/package-image-placeholder.png';

@Component({
  selector: 'apollo-opportunity-media-viewer',
  templateUrl: './opportunity-media-viewer.component.html',
  styleUrls: ['./opportunity-media-viewer.component.scss']
})
export class OpportunityMediaViewerComponent {
  public mediaDetails: IMedia[];

  @Input() set opportunityMedia(opportunityMedia: IMedia[]) {
    this.mediaDetails =
      opportunityMedia?.length > 0 ? opportunityMedia : [{ signedUrl: PLACE_HOLDER, caption: '', fileId: '', fileName: '', fileType: '' }];
  }
}
