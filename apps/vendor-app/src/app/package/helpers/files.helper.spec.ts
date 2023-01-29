import { IFile } from '@apollo/app/upload-widget';

import { groupFiles } from './files.helper';

describe('filesHelper', () => {
  it('should group the files', () => {
    const mockPayload = [
      ({ id: 1, group: 'group-1' } as unknown) as IFile,
      ({ id: 2, group: 'group-2' } as unknown) as IFile,
      ({ id: 3, group: 'group-1' } as unknown) as IFile
    ];
    const result = groupFiles(mockPayload);

    expect(result).toEqual({
      'group-1': [
        { id: 1, group: 'group-1' },
        { id: 3, group: 'group-1' }
      ],
      'group-2': [
        { id: 2, group: 'group-2' }
      ]
    });
  });
});
