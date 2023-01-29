import { TestBed } from '@angular/core/testing';

import { MemoryStream } from './memory-stream';
import { ShapeHeaderReader } from './shape-file-header-reader';

describe('ShapeHeaderReader', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should return shape header type', async() => {
    jest.spyOn(MemoryStream.prototype, 'readInt32').mockReturnValue(9994);
    const stream = await ShapeHeaderReader.fromArrayBuffer(new ArrayBuffer(1024));
    expect(stream.shpHeader.type).toBe(9994);
  });
  it('should throw error',() => {
    jest.spyOn(MemoryStream.prototype, 'readInt32').mockReturnValue(1);
    ShapeHeaderReader.fromArrayBuffer(new ArrayBuffer(1024)).catch((err: Error) => {
      expect(err.message).toBe('Unexpected Shape version');
    });
  });
});
