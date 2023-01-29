import { TestBed } from '@angular/core/testing';
import * as fflate from 'fflate';

import { ShapeHeaderReader } from './shape-file-header-reader';
import { ShapeFileProcessor } from './shape-file-processor';

class MockFileReaderFactory {
  readAsArrayBuffer = () => null;
  onloadend = () => jest.fn();
}

describe('ShapeFileProcessor', () => {
  let shapeFileProcessor: ShapeFileProcessor;
  let mockFileReaderFactory: MockFileReaderFactory;

  beforeEach(() => {
    mockFileReaderFactory = new MockFileReaderFactory();

    TestBed.configureTestingModule({
      providers: [
        ShapeFileProcessor,
        {
          provide: FileReader,
          useValue: () => mockFileReaderFactory
        }
      ]
    });
    shapeFileProcessor = TestBed.inject(ShapeFileProcessor);

  });

  it('should be created', () => {
    expect(shapeFileProcessor).toBeTruthy();
  });

  describe("load and validate shape file", () => {
    it('should throw validation error', async() => {
      jest.spyOn(fflate, 'unzipSync').mockReturnValue({
        "test.shp": "content"
      } as any);
      const mockFile = new File([new ArrayBuffer(1234)], 'well.zip', { type: 'applcation/zip' });
      await shapeFileProcessor.load(mockFile).catch((err) => {
        expect(err.message).toContain('Invalid shape file');
      });
    });
    it('should validate and return true', async() => {
      jest.spyOn(fflate, 'unzipSync').mockReturnValue({
        "test.shx": "content",
        "test.dbf": "content",
        "test.shp": "content"
      } as any);
      jest.spyOn(ShapeHeaderReader, 'fromArrayBuffer').mockReturnValue({ shpHeader: { type: 1 }} as any);
      const mockFile = new File([new ArrayBuffer(1234)], 'well.zip', { type: 'applcation/zip' });
      const res = await shapeFileProcessor.load(mockFile);
      expect(res).toBeTruthy();
    });

    it('should validate and return error', async() => {
      jest.spyOn(fflate, 'unzipSync').mockReturnValue({
        "test.shx": "content",
        "test.dbf": "content",
        "test.shp": "content"
      } as any);
      const mockFile = new File([new ArrayBuffer(1234)], 'well.zip', { type: 'applcation/zip' });
      await shapeFileProcessor.load(mockFile).catch((err) => {
        expect(err.message).toContain('Something went wrong');
      });
    });
  });
});
