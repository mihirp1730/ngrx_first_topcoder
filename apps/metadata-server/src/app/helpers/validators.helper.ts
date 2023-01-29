import { ICategory } from '@apollo/api/interfaces';
import { GaiaTraceClass } from '@apollo/tracer';

import { IGisLayerSettings } from '../../commons/interfaces/gis-settings';

@GaiaTraceClass
export class Validators {
  static isUniqueString(value: string, list: Array<string>): boolean {
    return !list.includes(value);
  }

  static hasValidAttributes(layer: ICategory): { errors: Array<string>; valid: boolean } {
    const attributeErrors = [];

    const shapeAttr = layer.attributes.find((attr) => attr.name === 'Shape');

    // Check if shape attribute doesn't exist
    if (!shapeAttr) {
      attributeErrors.push('Shape attribute is missing.');
    }

    // Iterate over the attributes to validate them
    layer.attributes.forEach((attr) => {
      if (attr.name === 'Shape') {
        // Check if the shape is a valid type
        const validShape = ['geo.dot', 'geo.poly', 'geo.line'].includes(attr.type);

        // If is an invalid set an error message
        if (!validShape) {
          attributeErrors.push(`Type of ${attr.name} attribute is invalid.`);
        }

        return;
      }

      // Check if the attribute type is a valid one
      const validAttribute = ['String', 'Integer', 'Float', 'DateTime'].includes(attr.type);

      // If is an invalid set an error message
      if (!validAttribute) {
        attributeErrors.push(`Type of ${attr.name} attribute is invalid.`);
      }
    });

    // Compare if the valid attributes length is the same as the original layer attributes
    return {
      errors: attributeErrors,
      valid: attributeErrors.length === 0
    };
  }

  // Added basic validation for name used to handle data for settings and metadata.
  static hasValidName(layer: ICategory | IGisLayerSettings): { errors: Array<string>; valid: boolean } {
    const errors: string[] = [];
    if (!layer['name']) {
      errors.push('The name provided is not valid.')
    }

    if (!layer['id']) {
      errors.push('The id provided is not valid.');
    }

    return { errors, valid: errors.length === 0 }
  }
}