import { ChangeDetectorRef, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MetadataService } from '@apollo/app/metadata';
import { IFile } from '@apollo/app/upload-widget';
import { of } from 'rxjs';
import { v4 as uuid } from 'uuid';

import { mockMetadataService } from '../../shared/services.mock';
import { PackageMapAndDeliverablesComponent } from './package-map-and-deliverables.component';

describe('MapAndDeliverablesComponent', () => {
  let component: PackageMapAndDeliverablesComponent;
  let fixture: ComponentFixture<PackageMapAndDeliverablesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PackageMapAndDeliverablesComponent],
      providers: [
        FormBuilder,
        {
          provide: ChangeDetectorRef,
          useValue: {
            detectChanges: jest.fn()
          }
        },
        {
          provide: MetadataService,
          useValue: mockMetadataService
        },
        {
          provide: MatDialog,
          useValue: {
            open: () => {
              return {
                componentInstance: {
                  yesClickEvent: of({})
                }
              }
            }
          }
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PackageMapAndDeliverablesComponent);
    component = fixture.componentInstance;
    component.marketingRepresentations = {};
    component.deliverables = [];
    component.dataTypesSelected = [];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnChanges', () => {
    describe('marketingRepresentations', () => {
      it('should get count and if there is uploads associated', () => {
        component.marketingRepresentations = {
          DataType: [{ progress: { associated: true } } as IFile]
        };
        component.ngOnChanges({ marketingRepresentations: {} as SimpleChange });
        expect(component.marketingRepresentationsCount).toEqual(1);
        expect(component.marketingRepresentationsInProgress).toEqual(true);
      });
  
      it('should not enter without changes, default values', () => {
        component.ngOnChanges({ otherChange: {} as SimpleChange });
        expect(component.marketingRepresentationsCount).toEqual(0);
        expect(component.deliverablesInProgress).toEqual(false);
      });
    });

    describe('deliverables', () => {
      it('should return false if no deliverablesInProgress', () => {
        component.ngOnChanges({ deliverables: {} as SimpleChange });
        expect(component.deliverablesInProgress).toEqual(false);
      });
    });

    describe('dataTypesSelected', () => {
      it('should set dataTypesSelected when shapes uploaded', () => {
        const dataTypes = [
          {
            hasShapeUploaded: true,
            type: 'Seismic3dSurvey'
          },
          {
            hasShapeUploaded: true,
            type: 'Well'
          }
        ];
        component.dataTypesSelected = dataTypes; 
        component.ngOnChanges({ dataTypesSelected: {} as SimpleChange });
        expect((component as any).dataTypesCollection).toEqual(dataTypes);
      });
      
      it('should set dataTypesSelected when empty shapes', () => {
        const dataTypes = [];
        component.dataTypesSelected = dataTypes; 
        component.ngOnChanges({ dataTypesSelected: {} as SimpleChange });
        expect((component as any).dataTypesCollection).toEqual([{type: '', hasShapeUploaded: false}]);
      }); 

      it('should set dataTypesSelected when undefined shapes', () => {
        const dataTypes = [
          {
            hasShapeUploaded: false,
            type: ''
          }
        ];
        component.dataTypesSelected = dataTypes; 
        component.ngOnChanges({ dataTypesSelected: {} as SimpleChange });
        expect((component as any).dataTypesCollection).toEqual([{type: '', hasShapeUploaded: false}]);
      });
    });
  });

  it('should handle the upload start', () => {
    const spy = jest.spyOn(component.shapeUpload, 'emit').mockImplementation();
    component.onMRStartUpload({} as File, 0);
    expect(spy).toHaveBeenCalled();
  });

  it('should handle the upload start (deliverable)', () => {
    const spy = jest.spyOn(component.deliverableUpload, 'emit').mockImplementation();
    component.onDeliverableStartUpload({} as File);
    expect(spy).toHaveBeenCalled();
  });

  it('should call the cancel of file uploader', () => {
    const spy = jest.spyOn(component.cancelUpload, 'emit').mockImplementation();
    component.onCancelUpload('file-id');
    expect(spy).toHaveBeenCalled();
  });

  describe('MapToRepresentationOption', () => {
    it('should return representation options', () => {
      const pointOption = {
        layerName: uuid(),
        displayName: uuid(),
        shapeType: 'geo.dot',
        maplargeTable: uuid(),
        primaryKey: '',
        icon: 'pointIcon'
      };
      const polylineOption = {
        layerName: uuid(),
        displayName: uuid(),
        shapeType: 'geo.line',
        maplargeTable: uuid(),
        primaryKey: '',
        icon: 'polylineIcon'
      };
      const polygonOption = {
        layerName: uuid(),
        displayName: uuid(),
        shapeType: 'geo.poly',
        maplargeTable: uuid(),
        primaryKey: '',
        icon: 'polygonIcon'
      };
      const result = PackageMapAndDeliverablesComponent.MapToRepresentationOption([pointOption, polylineOption, polygonOption]);
      expect(result).toEqual([
        {
          icon: 'pointIcon',
          value: pointOption.layerName,
          viewText: pointOption.displayName,
          disabled: false
        },
        {
          icon: 'polylineIcon',
          value: polylineOption.layerName,
          viewText: polylineOption.displayName,
          disabled: false
        },
        {
          icon: 'polygonIcon',
          value: polygonOption.layerName,
          viewText: polygonOption.displayName,
          disabled: false
        }
      ]);
    });
  });

  describe('addDataType', () => {
    it('should add a form control to the data type subject if there is data types available', () => {
      component.mapRepresentationOptions = [
        { icon: 'seismic', value: 'Seismic3D', viewText: 'Seismic 3D', disabled: false },
        { icon: 'wells', value: 'Wells', viewText: 'Wells', disabled: false }
      ];
      component.addDataType();
      expect(component.dataTypes.length).toEqual(1);
    });

    it('should not add a form control', () => {
      component.mapRepresentationOptions = [{ icon: 'seismic', value: 'Seismic3D', viewText: 'Seismic 3D', disabled: false }];
      component.addDataType();
      expect(component.dataTypes.length).toEqual(1);
    });
  });

  it('should emit close event when click', () => {
    const index = 1;
    const spy = jest.spyOn(component.closeDataType, 'emit').mockImplementation();
    component.closeDataTypeSection(index);
    expect(spy).toHaveBeenCalled();
  });
});
