export interface IFile {
  id: string; // File id returned by the file manager service
  parentId: string; // Parent object that contains this file
  associatedId: string; // Id of associated file
  group: string; // Id of the group if is part of one
  name: string; // The name of the file
  progress: IFileProgress;
  type: FileType; // Type of upload
  file: File; // Instance of the file to upload
}

export interface IFileProgress {
  errorMessage: null|string; // Any possible error message
  percentage: number; // Progress of the upload
  started: boolean; // Indicate if the uplaod is started
  canceled: boolean; // Indicate if the upload was canceled
  completed: boolean; // Indicate if the upload was completed
  associated: boolean; // Indicate if the file was associated with the parent id
}

export enum FileType {
  Shape = 'Shape',
  Contract = 'Contract',
  Document = 'Document',
  Media = 'Media',
  Deliverable = 'Deliverable'
}

export interface IFileUploadConfig {
  fileManager: {
    common: string;
    osdu: string;
  };
}

export interface IMaxFileConfig {
  [fileExtension: string]: number
}

export interface IPartialFile {
  fileId: string; // File id returned by the file manager service
  associatedId: string; // Id of associated file
  group: string; // Id of the group if is part of one
  type: FileType; // Type of upload
}
