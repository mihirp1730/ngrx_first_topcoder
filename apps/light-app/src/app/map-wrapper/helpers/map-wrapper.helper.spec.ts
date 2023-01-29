import { query } from '@slb-innersource/gis-canvas';
import { v4 as uuid } from 'uuid';

import { cleanupLayers, GetResultPanelPackageQueries, removeAllHighlightStyles, removeDetailStyle } from './map-wrapper.helper';

describe('cleanupLayers', () => {
  it('should remove the version from the provided string', () => {
    const result = cleanupLayers([
      {
        originalTableName: 'a/b/c',
        originalOptions: {
          query: {
            table: {
              name: 'x/y/z'
            }
          }
        }
      },
      {
        originalTableName: null,
        originalOptions: {
          query: {
            table: {
              name: 'abc'
            }
          }
        }
      }
    ]);
    expect(result[0].originalTableName).toBe('a/b');
    expect(result[0].originalOptions.query.table.name).toBe('x/y');
    expect(result[1].originalTableName).toBe(undefined);
    expect(result[1].originalOptions.query.table.name).toBe(null);
  });
});

describe('removeDetailStyle', () => {
  it('should call the load method of the provided layer', (done) => {
    const mockWkt = uuid();
    removeDetailStyle(
      [
        {
          originalOptions: {
            style: {
              rules: [
                null,
                {},
                {
                  where: []
                },
                {
                  where: [
                    [
                      {
                        value: `geo.${mockWkt}`
                      }
                    ]
                  ]
                }
              ]
            }
          },
          load: (data) => {
            expect(data.style.rules.length).toBe(3);
            done();
          }
        }
      ],
      mockWkt
    );
  });
});

describe('removeAllHighlightStyles', () => {
  it('should call the load method of the provided layer', (done) => {
    const mockLayerName = uuid();
    removeAllHighlightStyles(
      {
        [mockLayerName]: {}
      },
      [
        {
          originalOptions: {
            name: mockLayerName
          },
          load: () => {
            done();
          }
        }
      ]
    );
  });
  it('should do nothing without a layer', (done) => {
    const mockLayerName = uuid();
    removeAllHighlightStyles(
      {
        ['bad layer']: {},
        [mockLayerName]: {}
      },
      [
        {
          originalOptions: {
            name: `${mockLayerName}`
          },
          load: (data) => {
            expect(data.name).toBe(mockLayerName);
            done();
          }
        }
      ]
    );
  });
});

describe('GetResultPanelPackageQueries', () => {
  const maplarge = {
    data: {
      query: {
        getQueryFromJSON: () => ({
          runPromise: () => ({
            then: () => null
          })
        })
      }
    }
  } as unknown as typeof ml;
  it('should do nothing without maplarge', () => {
    const layers = {};
    const result = GetResultPanelPackageQueries(null, layers);
    expect(result.length).toBe(0);
  });
  it('should handle provided layers', () => {
    const layers = {
      Test: {
        table: 'table',
        where: 'where'
      }
    } as unknown as { [layerName: string]: query.Query };
    const result = GetResultPanelPackageQueries(maplarge, layers);
    expect(result.length).toBe(1);
  });
});
