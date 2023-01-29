import { Component, Input, ViewEncapsulation } from '@angular/core';

import { IMediaDetails } from './../interfaces';

const PLACE_HOLDER = 'assets/package-image-placeholder.png';

@Component({
  selector: 'apollo-package-media-viewer',
  templateUrl: './package-media-viewer.component.html',
  styleUrls: ['./package-media-viewer.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PackageMediaViewerComponent {
  public mediaDetails: IMediaDetails[];

  @Input() set packageMedia(packageMedia: IMediaDetails[]) {
    this.mediaDetails = packageMedia?.length > 0 ? packageMedia : [{ signedUrl: PLACE_HOLDER, caption: '' }];
  }
}
