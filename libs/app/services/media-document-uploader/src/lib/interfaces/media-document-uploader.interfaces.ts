export interface IMediaUploadInputProps {
    dropzoneInfoText?: string; // Lable to be visible on drop zone
    multiple?: boolean; // To allow multiple file uploads
    disabled?: boolean;
    extensions?: string; // string for allowed media format
    maxFileSize?: number;
    infoMessages?: string[]; // Information messages to show on top of the component
    noPreviewText?: string; // Message to show when there is no media preview available
    dropzoneErrorText?: string; // Validation message : atleast one package support media required
}

export interface IDocumentUploadInputProps {
    dropzoneInfoText?: string; // Lable to be visible on drop zone
    multiple?: boolean; // To allow multiple file uploads
    disabled?: boolean;
    extensions?: string; // string for allowed media format
    maxFileSize?: number;
    infoMessages?: string[]; // Information messages to show on top of the component
    noPreviewText?: string; // Message to show when there is no media preview available
    dropzoneErrorText?: string; // Validation message : atleast one package support media required
}

export interface IFile {
    id: string; // File id returned by the file manager service
    name: string; // The name of the file
    progress?: IFileProgress;
    fileType: string;
    file?: File; // Instance of the file to upload
    signedUrl?: string;
    caption?: string;
    componentIdentifier? : string;
    profileImage?: boolean;
}

export interface IFileProgress {
    errorMessage: null | string; // Any possible error message
    percentage: number; // Progress of the upload
    started: boolean; // Indicate if the uplaod is started
    canceled: boolean; // Indicate if the upload was canceled
    completed: boolean; // Indicate if the upload was completed
    associated: boolean; // Indicate if the file was associated with the parent id
}
