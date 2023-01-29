import { GisMappedSearchResult, GisSearchResultRecords, query } from '@slb-innersource/gis-canvas';
import { get, isString, remove, values } from 'lodash';

export function cleanupLayers(layers) {
  // GIS Common Component need to have the query without the version of the table
  return layers.map((layer) => ({
    ...layer,
    originalTableName: removeVersionFromTable(layer.originalTableName),
    originalOptions: {
      ...layer.originalOptions,
      query: {
        ...layer.originalOptions.query,
        table: {
          ...layer.originalOptions.query.table,
          name: removeVersionFromTable(layer.originalOptions.query.table.name)
        }
      }
    }
  }));
}

function removeVersionFromTable(table: string): string {
  // table === account/tableName/tableVersion
  if (!table) {
    return undefined;
  }

  // parts === ['account', 'tableName', 'tableVersion']
  const parts = table.split('/');
  if (parts.length < 2) {
    return null;
  }

  // 'account/tableName'
  return [parts[0], parts[1]].join('/');
}

// Remove detail style when single item selected
export function removeDetailStyle(layers: any, singleObjectWkt: string) {
  layers.forEach((layer) => {
    if (layer.originalOptions?.style) {
      removeHighlightedStyle(layer.originalOptions.style, singleObjectWkt);
      updateStyleRules(layer, singleObjectWkt);
    }
  });
}

// Remove highlight style
function removeHighlightedStyle(styleRules, wkt) {
  remove(styleRules.rules, function (rule: any) {
    if (
      rule?.where &&
      rule.where[0] &&
      rule.where[0][0].value &&
      isString(rule.where[0][0].value) &&
      rule.where[0][0].value.indexOf(wkt) > 0
    ) {
      return rule.where[0][0].value.indexOf(wkt);
    } else {
      return false;
    }
  });
}

// Remove all highlighted styles
export function removeAllHighlightStyles(initialStyleRules, layers) {
  for (const layerName in initialStyleRules) {
    const layer = layers.find((l) => l.originalOptions.name === layerName);
    if (layer) {
      updateStyleRules(layer, initialStyleRules[layerName]);
    }
  }
}

// Update style rules
function updateStyleRules(layer, stylesRules) {
  layer.load(
    {
      ...layer.originalOptions,
      stylesRules
    },
    false
  );
}

export function GetGisDataDetailProperty(gisDataDetail: GisSearchResultRecords, propertyName: string): GisMappedSearchResult['properties'] {
  for (const record of gisDataDetail?.records ?? []) {
    for (const property of record?.properties ?? []) {
      if (property?.name === propertyName) {
        return property;
      }
    }
  }
  return null;
}

export function GetResultPanelPackageQueries(maplarge: typeof ml, layers: { [layerName: string]: query.Query }): JQueryPromise<string[]>[] {
  if (!maplarge) {
    return [];
  }
  const getDataPackageIdsFromResponse = (res) => get(res, 'data.data.dataPackageId', []);
  return values(layers)
    .map((layer) =>
      maplarge.data.query.getQueryFromJSON({
        sqlselect: ['dataPackageId'],
        table: layer.table,
        where: layer.where,
        take: -1,
        groupby: ['dataPackageId']
      })
    )
    .map((layerQuery) => layerQuery.runPromise())
    .map((layerPromise) => layerPromise.then(getDataPackageIdsFromResponse));
}
