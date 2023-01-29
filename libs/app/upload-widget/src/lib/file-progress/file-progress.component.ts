import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

import { IFile, IPartialFile } from '../interfaces';

interface State {
  file: IFile;
}

enum FileStatus {
  InProgress,
  Erroneous,
  Completed
}

@Component({
  selector: 'apollo-file-progress',
  templateUrl: './file-progress.component.html',
  styleUrls: ['./file-progress.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileProgressComponent {
  @Input() isDeleteDisabled: boolean;

  public FileStatus = FileStatus;
  //
  // State:
  //
  private state: State = {
    file: null
  };
  public state$ = new BehaviorSubject(this.state);
  //
  // Selectors:
  //
  public file$ = this.state$
    .pipe(map(({ file }) => file))
    .pipe(distinctUntilChanged());
  public fileName$ = this.file$
    .pipe(map((file ) => file?.name ?? null))
    .pipe(distinctUntilChanged());
  public fileProgress$ = this.file$
    .pipe(map((file ) => file?.progress ?? null))
    .pipe(distinctUntilChanged());
  public fileProgressErrorMessage$ = this.fileProgress$
    .pipe(map((progress ) => progress?.errorMessage ?? null))
    .pipe(distinctUntilChanged());
  //
  // Selectors (deductions):
  //
  public fileStatus$ = this.fileProgress$
    .pipe(map((progress) => {
      const { errorMessage, completed, associated } = progress ?? {};
      if (errorMessage) {
        return FileStatus.Erroneous;
      }
      if (completed && associated) {
        return FileStatus.Completed;
      }
      return FileStatus.InProgress;
    }))
    .pipe(distinctUntilChanged());

  @Input() set file(file: IFile) {
    this.state = { ...this.state, file };
    this.state$.next(this.state);
  }

  @Output() cancelUpload: EventEmitter<IPartialFile> = new EventEmitter<IPartialFile>();

  public onCancelUpload(): void {
    this.cancelUpload.emit({
      associatedId: this.state.file.associatedId,
      fileId: this.state.file.id,
      group: this.state.file.group,
      type: this.state.file.type
    });
  }
}
