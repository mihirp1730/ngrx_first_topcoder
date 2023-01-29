import { Component, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IDocFile } from '@apollo/app/document-upload';
import { IMediaFile } from '@apollo/app/services/data-packages';
import { IMediaUploadInputProps } from '@apollo/app/services/media-document-uploader';
import { Store } from '@ngrx/store';
import { combineLatest, distinctUntilChanged, map } from 'rxjs';
import { filter, startWith, take } from 'rxjs/operators';
import { selectCreationDetails } from './../../state/selectors/opportunity.selectors';

import { editorConfig } from '../../../package/package-editor/quill-editor.config';
import { documentUploadoptions } from '../../../shared/constants/opportunity.constants';
import { quillEditorTextValidator } from '../../helpers/quill-editor-text-validator.helper';
import * as opportunitySelectors from '../../state/selectors/opportunity.selectors';
import { differenceWith, isEqual } from 'lodash';

@Component({
  selector: 'apollo-open-information',
  templateUrl: './open-information.component.html',
  styleUrls: ['./open-information.component.scss']
})
export class OpenInformationComponent {
  public editorModules = editorConfig;
  public initialOpenInfo = '';
  public documentUploadOptions = documentUploadoptions;
  public mediaUploadOptions: IMediaUploadInputProps = {
    infoMessages: ['Upload relevant images of .JPEG/.JPG or .PNG format up to 10MB.'],
    noPreviewText: 'Images that you upload would be shown here',
    dropzoneInfoText: 'Drop Here or Click',
    dropzoneErrorText: 'Media is required. Please upload atleast one image',
    multiple: true
  };

  public opportunityProfile$ = this.store.select(opportunitySelectors.selectCreationDetails).pipe(
    filter((opportunity) => !!opportunity?.profile),
    map((opportunity) => opportunity.profile),
    take(1)
  );

  public selectCreationDetails$ = this.store
    .select(selectCreationDetails)
    .pipe(take(1))
    .subscribe((data) => {
      this.initialOpenInfo = data?.profile?.overview;
    });

  public existingDocFileList$ = this.opportunityProfile$.pipe(
    map((opportunityProfile) => {
      const { documents } = opportunityProfile;
      return documents;
    })
  );
  public existingMediaFileList$ = this.opportunityProfile$.pipe(
    map((opportunityProfile) => {
      const { media } = opportunityProfile;
      return media || [];
    })
  );
  public initialFormData$ = this.opportunityProfile$.pipe(
    map((opportunityProfile) => {
      const { overview, media, documents } = opportunityProfile;
      return { overview, media, documents };
    }),
    take(1) // we only care about the initial value
  );

  openInformationDetails = new FormGroup({
    overview: new FormControl(this.initialOpenInfo, [Validators.required, quillEditorTextValidator()]),
    media: new FormControl([]),
    documents: new FormControl([])
  });

  @Output() formIsValid = this.openInformationDetails.statusChanges.pipe(
    map((status) => status === 'VALID'),
    distinctUntilChanged()
  );

  @Output() openInformationChanged = this.openInformationDetails.valueChanges.pipe(
    map((value) => {
      return value;
    }),
    distinctUntilChanged()
  );

  @Output() isOpenInfoDirty = combineLatest([
    this.initialFormData$,
    this.openInformationDetails.valueChanges.pipe(startWith(this.openInformationDetails.value))
  ]).pipe(
    map(([initialFormData, formValue]) => {
      // Initialy formControl for overview has null value
      if (initialFormData.overview === '') initialFormData.overview = null;
      return (
        initialFormData.overview !== formValue.overview ||
        differenceWith(formValue.documents, initialFormData.documents, isEqual).length > 0 ||
        !this.compareMediaData(initialFormData.media, formValue.media)
      );
    })
  );

  constructor(public readonly store: Store) {}

  uploadedMediaFileIds(event: IMediaFile[]) {
    this.openInformationDetails.get('media').setValue(event);
  }

  uploadDocFileIds(event: IDocFile[]) {
    this.openInformationDetails.get('documents').setValue(event);
  }

  compareMediaData(initialMediaData: IMediaFile[], formMediaData: IMediaFile[]): boolean {
    const initialData = initialMediaData.map((el) => {
      return {
        caption: el.caption,
        fileId: el.fileId,
        fileName: el.fileName,
        fileType: el.fileType
      };
    });
    // differenceWith deep checks objects and  returns elements which are present in first array but not in second array
    return differenceWith(formMediaData, initialData, isEqual).length === 0;
  }
}
