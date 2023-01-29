import { ICategory } from '@apollo/api/interfaces';
import { IGisLayerSettings } from '../../commons/interfaces/gis-settings';


import { Validators } from './validators.helper';

describe('Validators', () => {
  describe('Validate unique string', () => {
    it("should return true if the string doesn't exist in the list", () => {
      const result = Validators.isUniqueString('test', ['test1', 'test2', 'test3']);
      expect(result).toBe(true);
    });

    it('should return false if the string exists in the list', () => {
      const result = Validators.isUniqueString('test', ['test1', 'test', 'test3']);
      expect(result).toBe(false);
    });
  });

  describe('Validate layer attributes', () => {
    it('should validate that we have a shape attribute with a correct value', () => {
      const mockLayer = {
        mapLargeTable: 'account/Test',
        attributes: [
          {
            name: 'Shape',
            type: 'geo.poly',
            mapLargeAttribute: 'Test'
          }
        ]
      } as ICategory;

      const result = Validators.hasValidAttributes(mockLayer);
      expect(result).toEqual({
        errors: [],
        valid: true
      });
    });

    it('should validate that we have a correct type of shape attribute in the layer', () => {
      const mockLayer = {
        mapLargeTable: 'account/Test',
        attributes: [
          {
            name: 'Shape',
            type: 'String',
            mapLargeAttribute: 'Name'
          }
        ]
      } as ICategory;

      const result = Validators.hasValidAttributes(mockLayer);
      expect(result).toEqual({
        errors: ['Type of Shape attribute is invalid.'],
        valid: false
      });
    });

    it('should validate that we have a shape attribute in the layer', () => {
      const mockLayer = {
        mapLargeTable: 'account/Test',
        attributes: [
          {
            name: 'Name',
            type: 'String',
            mapLargeAttribute: 'Name'
          }
        ]
      } as ICategory;

      const result = Validators.hasValidAttributes(mockLayer);
      expect(result).toEqual({
        errors: ['Shape attribute is missing.'],
        valid: false
      });
    });

    it('should validate that we have the correct type on the attibutes', () => {
      const mockLayer = {
        mapLargeTable: 'account/Test',
        attributes: [
          {
            name: 'Name',
            type: 'String',
            mapLargeAttribute: 'Name'
          },
          {
            name: 'Id',
            type: 'Int',
            mapLargeAttribute: 'Id'
          },
          {
            name: 'Date',
            type: 'DateTime',
            mapLargeAttribute: 'Date'
          },
          {
            name: 'Price',
            type: 'Float',
            mapLargeAttribute: 'Price'
          },
          {
            name: 'Shape',
            type: 'geo.poly',
            mapLargeAttribute: 'Test'
          }
        ]
      } as ICategory;

      const result = Validators.hasValidAttributes(mockLayer);
      expect(result).toEqual({
        errors: ['Type of Id attribute is invalid.'],
        valid: false
      });
    });

    it('should validate that name is pressent on metadata', () => {
      const metaData = { id: 'somename', name: 'somename' } as ICategory;
      const validationResult = Validators.hasValidName(metaData);
      expect(validationResult).toEqual({
        errors: [],
        valid: true
      });
    });
    
    it('should validate that name ispressent on settings', () => {
      const metaData = { id: 'test', name: 'test setting name' } as IGisLayerSettings;
       const validationResult = Validators.hasValidName(metaData);
       expect(validationResult).toEqual({
         errors: [],
         valid: true
       });
    });

    it('should validate that name is not pressent on metadata', () => {
      const metaData = { id: 'testId', name: '' } as ICategory
      const validationResult = Validators.hasValidName(metaData);
      expect(validationResult).toEqual({
        errors: ['The name provided is not valid.'],
        valid: false
      });
    });

    it('should validate that name is not pressent on settings', () => {
       const metaData = { id: 'testId', name: '' } as IGisLayerSettings;
       const validationResult = Validators.hasValidName(metaData);
       expect(validationResult).toEqual({
         errors: ['The name provided is not valid.'],
         valid: false
       });
    });
  });
});
