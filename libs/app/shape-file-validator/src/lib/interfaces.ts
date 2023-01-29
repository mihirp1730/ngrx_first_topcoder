export interface IValidationErrorResponse {
  message: string;
}

export interface IValidationSuccessResponse {
  geometry: EShapeType;
}

export const REQUIRED_FILES_IN_SHAPE_FILE: string[] = ['shx', 'dbf', 'shp'];

export interface IShapeHeader {
  readonly type: EShapeType;
}

export enum EShapeType {
  Null = 0,
  Point = 1,
  PolyLine = 3,
  Polygon = 5,
  MultiPoint = 8,
  PointZ = 11,
  PolyLineZ = 13,
  PolygonZ = 15,
  MultiPointZ = 18,
  PointM = 21,
  PolyLineM = 23,
  PolygonM = 25,
  MultiPointM = 28
}

export enum GeoJsonShapes {
  MultiPolygon = 'MultiPolygon',
  Polygon = 'Polygon',
  Point = 'Point',
  MultiPoint = 'MultiPoint',
  Line = 'LineString'
}
