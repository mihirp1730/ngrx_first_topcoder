import { IDocumentUploadInputProps } from "@apollo/app/services/media-document-uploader";

export const documentUploadoptions: IDocumentUploadInputProps = {
    infoMessages: ['Upload any supporting documents such as brochures, marketing materials, etc. and provide a caption describing the document'],
    noPreviewText: 'Documents that you upload would be shown here',
    dropzoneInfoText: 'Drop Here or Click',
    multiple: true
}

export const allValue = "All";