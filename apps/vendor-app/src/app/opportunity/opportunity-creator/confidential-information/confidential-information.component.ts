import { Component, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
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
  selector: 'apollo-confidential-information',
  templateUrl: './confidential-information.component.html',
  styleUrls: ['./confidential-information.component.scss']
})
export class ConfidentialInformationComponent {
  public editorModules = editorConfig;
  public initialConfInfo = '';

  public confidentialOpportunityProfile$ = this.store.select(opportunitySelectors.selectCreationDetails).pipe(
    filter((opportunity) => !!opportunity?.confidentialProfile),
    map((opportunity) => opportunity.confidentialProfile),
    take(1)
  );
  public documents$ = this.confidentialOpportunityProfile$.pipe(
    map((confidentialOpportunityProfile) => {
      const { documents } = confidentialOpportunityProfile;
      return documents || [];
    }),
    take(1) // we only care about the initial value
  );
  public existingMediaFileList$ = this.confidentialOpportunityProfile$.pipe(
    map((confidentialProfile) => {
      return confidentialProfile.media || [];
    })
  );
  public initialFormData$ = this.confidentialOpportunityProfile$.pipe(
    map((confidentialProfile) => {
      const { media, overview, documents } = confidentialProfile;
      return { overview, media, documents };
    }),
    take(1) // we only care about the initial value
  );

  public selectCreationDetails$ = this.store
    .select(selectCreationDetails)
    .pipe(take(1))
    .subscribe((data) => {
      this.initialConfInfo = data?.confidentialProfile?.overview;
    });

  public documentUploadoptions = documentUploadoptions;
  public mediaUploadoptions: IMediaUploadInputProps = {
    infoMessages: ['Upload relevant images of .JPEG/.JPG or .PNG format up to 10MB.'],
    noPreviewText: 'Images that you upload would be shown here',
    dropzoneInfoText: 'Drop Here or Click',
    dropzoneErrorText: 'Media is required. Please upload atleast one image',
    multiple: true
  };

  confidentialInformationDetails = new FormGroup({
    overview: new FormControl(this.initialConfInfo, quillEditorTextValidator()),
    media: new FormControl([]),
    documents: new FormControl([])
  });

  @Output() confidentialInformationChanged = this.confidentialInformationDetails.valueChanges.pipe(
    map((value) => {
      return value;
    }),
    distinctUntilChanged()
  );

  @Output() isConfidentialInformationDirty = combineLatest([
    this.confidentialInformationDetails.valueChanges.pipe(startWith(this.confidentialInformationDetails.value)),
    this.initialFormData$
  ]).pipe(
    map(([formValue, initialFormData]) => {
      if (initialFormData.overview === '') initialFormData.overview = null;
      return (
        formValue.overview !== initialFormData.overview ||
        !this.compareMediaData(initialFormData.media, formValue.media) ||
        differenceWith(formValue.documents, initialFormData.documents, isEqual).length > 0
      );
    })
  );

  @Output() formIsValid = this.confidentialInformationDetails.statusChanges.pipe(
    map((status) => status === 'VALID'),
    distinctUntilChanged()
  );

  constructor(public readonly store: Store) {}

  uploadedMediaFileIds(event: IMediaFile[]) {
    this.confidentialInformationDetails.get('media').setValue(event);
  }

  uploadDocFileIds(event: IDocFile[]) {
    this.confidentialInformationDetails.get('documents').setValue(event);
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
