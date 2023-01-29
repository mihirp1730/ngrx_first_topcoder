import { TestBed } from '@angular/core/testing';

import { MemoryStream } from './memory-stream';

class mockDataView {
  getInt16 = jest.fn(() => 16);
  getInt32 = jest.fn(() => 32);
  getFloat64 = jest.fn(() => 64);
  getUint8 = jest.fn(() => 8);
}

window.DataView = mockDataView as any;

describe('MemoryStream', () => {
  let memoryStream: MemoryStream;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DataView
      ]
    });
    memoryStream = new MemoryStream(new ArrayBuffer(1212));

  });

  it('should be created', () => {
    expect(memoryStream).toBeTruthy();
  });

  it('should seek', () => {
    const result = memoryStream.seek(1);
    expect(result).toBe(memoryStream);
  });

  it('should return error on seek', () => {
    expect(() => memoryStream.seek(1214)).toThrow(new Error('Offset out of bounds'));
  });

  it('should readInt16', () => {
    const result = memoryStream.readInt16(false);
    expect(result).toBe(16);
  });

  it('should readInt32', () => {
    const result = memoryStream.readInt32(false);
    expect(result).toBe(32);
  });

  it('should readInt32Array', () => {
    const result = memoryStream.readInt32Array(1, false);
    expect(result[0]).toBe(32);
  });

  it('should readDouble', () => {
    const result = memoryStream.readDouble(false);
    expect(result).toBe(64);
  });

  it('should readDoubleArray', () => {
    const result = memoryStream.readDoubleArray(1, false);
    expect(result[0]).toBe(64);
  });

  it('should readByte', () => {
    const result = memoryStream.readByte();
    expect(result).toBe(8);
  });
});
