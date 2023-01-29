import { EShapeType, IShapeHeader } from './interfaces';
import { MemoryStream } from './memory-stream';

export class ShapeHeaderReader {
  private _shpStream: MemoryStream;
  private _shpHeader: IShapeHeader;

  public get shpHeader(): IShapeHeader {
    return this._shpHeader;
  }

  public static async fromArrayBuffer(shpBytes: ArrayBuffer): Promise<ShapeHeaderReader> {
    return new ShapeHeaderReader(shpBytes);
  }
  private constructor(shp: ArrayBuffer) {
    this._shpStream = new MemoryStream(shp);
    this._shpHeader = this.readHeader(this._shpStream);
    this._shpStream = null;
  }

  /* Used for both .shp and .shx */
  private readHeader(stream: MemoryStream): IShapeHeader {
    const version = stream.seek(0).readInt32();
    if (version !== 9994) {
      throw new Error('Unexpected Shape version');
    }
    const shpType = stream.seek(32).readInt32(true);
    stream.seek(36);
    return {
      type: shpType as EShapeType
    };
  }
}
