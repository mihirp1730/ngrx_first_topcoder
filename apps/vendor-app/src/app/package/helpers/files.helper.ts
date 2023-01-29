import { IFile } from '@apollo/app/upload-widget';

export function groupFiles(files: Array<IFile>) {
  return files.reduce((acc, file) => {
    if (acc[file.group]) {
      acc[file.group].push(file);
    } else {
      acc[file.group] = [file];
    }
    return acc;
  }, {});
}
