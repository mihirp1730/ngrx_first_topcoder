import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { GisMapLargeService, GisSearchResultActionService, GisLayerPanelService, GisCanvas } from '@slb-innersource/gis-canvas';
import { DELFI_USER_CONTEXT } from '@apollo/app/delfi-gui-auth-config';
import { DataPackagesService, ISavePackageProfileRequest } from '@apollo/app/services/data-packages';
import { initialState } from '../package-creator.interface';
import { NotificationService } from '@apollo/app/ui/notification';
import { FileType, FileUploaderService } from '@apollo/app/upload-widget';
import { MetadataService } from '@apollo/app/metadata';
import { SecureEnvironmentService } from '@apollo/app/secure-environment';
import { SettingsService } from '@apollo/app/settings';
import { AuthCodeFlowService } from '@apollo/app/auth-codeflow';
import { PerformanceIndicatorService } from '@apollo/app/performance';
import { combineLatest, of, throwError } from 'rxjs';
import { filter } from 'rxjs/operators';
import { GoogleAnalyticsService } from 'ngx-google-analytics';

import {
  mockSecureEnvironmentService,
  mockMetadataService,
  mockSettingsService,
  mockAuthCodeFlowService,
  mockGisMapLargeService,
  mockGisSearchResultActionService,
  mockGisLayerPanelService,
  mockDataPackagesService,
  mockNotificationService,
  mockFileUploaderService,
  mockRouter,
  mockActivatedRoute,
  mockGoogleAnalyticsService
} from '../../shared/services.mock';
import { PackageCreatorComponent } from './package-creator.component';

describe('PackageCreatorComponent', () => {
  let component: PackageCreatorComponent;
  let fixture: ComponentFixture<PackageCreatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PackageCreatorComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [FormsModule, ReactiveFormsModule, RouterTestingModule],
      providers: [
        {
          provide: Router,
          useValue: mockRouter
        },
        {
          provide: MetadataService,
          useValue: mockMetadataService
        },
        {
          provide: SettingsService,
          useValue: mockSettingsService
        },
        {
          provide: SecureEnvironmentService,
          useValue: mockSecureEnvironmentService
        },
        {
          provide: AuthCodeFlowService,
          useValue: mockAuthCodeFlowService
        },
        {
          provide: GisMapLargeService,
          useValue: mockGisMapLargeService
        },
        {
          provide: GisSearchResultActionService,
          useValue: mockGisSearchResultActionService
        },
        {
          provide: GisLayerPanelService,
          useValue: mockGisLayerPanelService
        },
        {
          provide: PerformanceIndicatorService,
          useValue: ''
        },
        {
          provide: DELFI_USER_CONTEXT,
          useValue: {
            crmAccountId: 'test-account-id'
          }
        },
        {
          provide: DataPackagesService,
          useValue: mockDataPackagesService
        },
        {
          provide: NotificationService,
          useValue: mockNotificationService
        },
        {
          provide: FileUploaderService,
          useValue: mockFileUploaderService
        },
        {
          provide: ActivatedRoute,
          useValue: mockActivatedRoute
        },
        {
          provide: GoogleAnalyticsService,
          useValue: mockGoogleAnalyticsService
        }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PackageCreatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    jest.spyOn(GisCanvas, 'showGisIndecator').mockImplementation();
    jest.spyOn(GisCanvas, 'hideGisIndecator').mockImplementation();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should disable inputs when package is published', () => {
    component.disableButtons('Published');
    expect(component.formGroup.controls['packageName'].disabled).toBeTruthy();
    expect(component.isPackagePublished).toBeTruthy();
  });

  describe('Go to step number', () => {
    beforeEach(() => {
      component.updateState({
        ...(component as any)._state,
        id: 'test-id',
        name: 'test name'
      });
    });

    it('should go to package details', () => {
      component.isPackageSaved = true;
      component.goToPackageDetails();
      expect(component.step).toEqual(2);
    });

    it('should not go to package details', () => {
      component.isPackageSaved = false;
      component.goToPackageDetails();
      expect(component.step).toEqual(1);
    });
  });

  it('should go back to step 1', () => {
    component.step = 2;
    component.onGoBack();
    expect(component.step).toEqual(1);
  });

  it('should go back to vendor route', () => {
    component.onGoHome();
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/vendor/datapackage');
  });

  describe('saveAsDraft', () => {
    it('should save the package as draft', (done) => {
      component.formGroup.controls.packageName.setValue('Test Package Name');
      mockDataPackagesService.createDataPackage.mockReturnValueOnce(
        of({
          dataPackageId: 'test-id'
        })
      );

      combineLatest([component.packageId$.pipe(filter(Boolean)), component.packageName$.pipe(filter(Boolean))]).subscribe(([id, name]) => {
        expect(id).toEqual('test-id');
        expect(name).toEqual('Test Package Name');
        done();
      });

      component.saveAsDraft();

      expect(mockDataPackagesService.createDataPackage).toHaveBeenCalledWith('Test Package Name');
      expect(component.isPackageSaved).toBe(true);
      expect(component.showLoader).toBe(false);
    });

    it('should not save the package as draft on service error', () => {
      component.formGroup.controls.packageName.setValue('Test Package Name');
      mockDataPackagesService.createDataPackage.mockReturnValue(throwError('Error test'));
      component.saveAsDraft();

      expect(mockDataPackagesService.createDataPackage).toHaveBeenCalledWith('Test Package Name');
      expect(mockNotificationService.send).toHaveBeenCalled();
      expect(component.showLoader).toBe(false);
    });

    it('should not save it with invalid form', () => {
      const packageName = component.formGroup.controls.packageName;
      packageName.setValue('');
      const markAsTouchedSpy = jest.spyOn(packageName, 'markAsTouched').mockImplementation();
      component.saveAsDraft();

      expect(markAsTouchedSpy).toHaveBeenCalled();
      expect(packageName.hasError('required')).toBeTruthy();
    });
  });

  describe('onConfirmAndPublish', () => {
    beforeEach(() => {
      component.updateState({
        ...(component as any)._state,
        id: 'test-id'
      });
    });

    it('should publish the package', () => {
      mockDataPackagesService.publishPackage.mockReturnValueOnce(of({}));
      component.onConfirmAndPublish();
      expect(mockDataPackagesService.publishPackage).toHaveBeenCalledWith('test-id');
      expect(mockNotificationService.send).toHaveBeenCalled();
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/vendor/datapackage');
    });

    it('should throw an error on publish the package', () => {
      mockDataPackagesService.publishPackage.mockReturnValueOnce(throwError('Error'));
      component.onConfirmAndPublish();
      expect(mockDataPackagesService.publishPackage).toHaveBeenCalledWith('test-id');
      expect(mockNotificationService.send).toHaveBeenCalled();
    });
  });

  describe('onShapeUpload', () => {
    beforeEach(() => {
      component.updateState({
        ...(component as any)._state,
        id: 'test-id'
      });
    });

    it('should handle the upload start', async () => {
      mockFileUploaderService.upload.mockReturnValueOnce(of('file-id'));
      mockFileUploaderService.getFile.mockReturnValueOnce(
        of({ id: 'file-id', parentId: 'parent-id', progress: { completed: true, associated: false } })
      );
      await component.onShapeUpload({ file: {} as File, dataType: 'DataType' });
      expect(mockFileUploaderService.updateProgress).toHaveBeenCalledWith('file-id', { associated: true });
    });
  });

  describe('onDeliverableUpload', () => {
    beforeEach(() => {
      component.updateState({
        ...(component as any)._state,
        id: 'test-id'
      });
    });

    it('should handle the upload start', async () => {
      mockFileUploaderService.upload.mockReturnValueOnce(of('file-id'));
      mockFileUploaderService.getFile.mockReturnValueOnce(
        of({ id: 'file-id', parentId: 'parent-id', progress: { completed: true, associated: false } })
      );
      await component.onDeliverableUpload({} as File);
      expect(mockFileUploaderService.updateProgress).toHaveBeenCalledWith('file-id', { associated: true });
    });
  });

  it('should save the information in the context', (done) => {
    const mockPackageDetail = {
      profile: {
        regions: ['Africa'],
        overview: {
          overView: 'Test overview',
          keyPoints: ['1']
        },
        featuresAndContents: {
          keyPoints: ['A']
        },
        media: [{
          fileId: 'file_id',
          fileName: 'file_name',
          fileType: 'file_type',
          caption: 'caption'
        }],
        documents: [{
          fileId: 'file_id',
          fileName: 'file_name',
          fileType: 'file_type',
          caption: 'caption'
        }],
        opportunity: {
          opportunity: 'test'
        }
      },
      price: {
        onRequest: true,
        price: null,
        durationTerm: null
      }
    } as ISavePackageProfileRequest;
    component.onSaveProfile(mockPackageDetail);
    component.packageDetail$.subscribe((detail) => {
      expect(detail).toEqual({
        profile: {
          regions: ['Africa'],
          overview: {
            description: 'Test overview',
            keypoints: ['1']
          },
          featuresAndContents: {
            keypoints: ['A']
          },
          media: [{
            fileId: 'file_id',
            fileName: 'file_name',
            fileType: 'file_type',
            caption: 'caption'
          }],
          documents: [{
            fileId: 'file_id',
            fileName: 'file_name',
            fileType: 'file_type',
            caption: 'caption'
          }],
          opportunity: {
            opportunity: 'test'
          }
        },
        price: {
          onRequest: true,
          price: null,
          duration: null
        }
      });
      done();
    });
  });

  describe('files', () => {
    it('should get the shape files on creation workflow', (done) => {
      mockFileUploaderService.getFiles.mockReturnValueOnce(of([{ id: 'file-id-1', group: 'Type1' }]));
      component.updateState({
        ...(component as any)._state,
        files: {
          ...(component as any)._state.files,
          shapes: ['file-id-1']
        }
      });

      component.shapesGroup$.subscribe((response) => {
        expect(response).toEqual({ Type1: [{ id: 'file-id-1', group: 'Type1' }] });
        done();
      });
    });

    it('should get the shape files on edit workflow', (done) => {
      mockFileUploaderService.getFiles.mockReturnValueOnce(of([]));
      component.updateState({
        ...(component as any)._state,
        editing: true,
        files: {
          ...(component as any)._state.files,
          shapes: ['test-id-1']
        }
      });

      component.shapesGroup$.subscribe((response) => {
        expect(response).toEqual({
          Type1: [
            {
              id: 'test-id-1',
              parentId: 'test-id',
              group: 'Type1',
              name: 'shape-file.zip',
              progress: {
                percentage: 100,
                started: true,
                canceled: false,
                completed: true,
                associated: true
              },
              type: FileType.Shape,
              file: null
            }
          ]
        });
        done();
      });
    });

    it('should get the deliverable files on creation workflow', (done) => {
      mockFileUploaderService.getFiles.mockReturnValueOnce(of([{ id: 'file-id-1' }]));
      component.updateState({
        ...(component as any)._state,
        files: {
          ...(component as any)._state.files,
          deliverables: ['file-id-1']
        }
      });

      component.deliverables$.subscribe((response) => {
        expect(response).toEqual([{ id: 'file-id-1' }]);
        done();
      });
    });

    it('should get the deliverable files on edit workflow', (done) => {
      mockFileUploaderService.getFiles.mockReturnValueOnce(of([]));
      component.updateState({
        ...(component as any)._state,
        editing: true,
        files: {
          ...(component as any)._state.files,
          deliverables: ['test-file-1']
        }
      });

      component.deliverables$.subscribe((response) => {
        expect(response).toEqual([
          {
            id: 'test-file-1',
            parentId: 'test-id',
            group: '',
            name: 'test-file-1',
            progress: {
              percentage: 100,
              started: true,
              canceled: false,
              completed: true,
              associated: true
            },
            type: FileType.Deliverable,
            file: null
          }
        ]);
        done();
      });
    });
  });

  it('should leave the page if no changes', () => {
    component.step = 1;
    component.formGroup.value.packageName = 'test name';
    component.canLeave();
    expect(component.canLeave).toBeTruthy();
  });

  describe('State selectors', () => {

    describe('isDeliverableInProgres$', () => {

      it('should return false if data not yet associated', (done) => {
        mockFileUploaderService.getFiles.mockReturnValueOnce(of([]));
        component.updateState({
          ...(component as any)._state,
          editing: false,
          files: {
            ...(component as any)._state.files,
            deliverables: ['file-id-1']
          }
        });
        component.isDeliverableInProgres$.subscribe((response) => {
          expect(response).toEqual(false);
          done();
        });
      });

      it('should return true if all data associated', (done) => {
        const files = [
          {
            id: 'test-file-1',
            parentId: 'test-id',
            group: '',
            name: 'test-file-1',
            progress: {
              percentage: 100,
              started: true,
              canceled: false,
              completed: true,
              associated: false
            },
            type: FileType.Deliverable,
            file: null
          }
        ];
        mockFileUploaderService.getFiles.mockReturnValueOnce(of(files));
        component.updateState({
          ...(component as any)._state,
          editing: false,
          files: {
            ...(component as any)._state.files,
            deliverables: ['file-id-1']
          }
        });
        component.isDeliverableInProgres$.subscribe((response) => {
          expect(response).toEqual(true);
          done();
        });
      });

    });

    describe('isShapeInProgress$', () => {

      it('should return true if data not yet associated', (done) => {
        const shapeFiles = [
          {
            id: 'test-file-1',
            parentId: 'test-id',
            group: '',
            name: 'test-file-1',
            progress: {
              percentage: 100,
              started: true,
              canceled: false,
              completed: true,
              associated: false
            },
            type: FileType.Deliverable,
            file: null
          }
        ];
        mockFileUploaderService.getFiles.mockReturnValueOnce(of(shapeFiles));
        component.updateState({
          ...(component as any)._state,
          editing: false,
          files: {
            ...(component as any)._state.files,
            shapes: ['file-id-1']
          }
        });
        component.isShapeInProgress$.subscribe((response) => {
          expect(response).toEqual(true);
          done();
        });
      });

      it('should return false if data already associated', (done) => {
        const shapeFiles = [
          {
            id: 'test-file-1',
            parentId: 'test-id',
            group: '',
            name: 'test-file-1',
            progress: {
              percentage: 100,
              started: true,
              canceled: false,
              completed: true,
              associated: true
            },
            type: FileType.Deliverable,
            file: null
          }
        ];
        mockFileUploaderService.getFiles.mockReturnValueOnce(of(shapeFiles));
        component.updateState({
          ...(component as any)._state,
          editing: false,
          files: {
            ...(component as any)._state.files,
            shapes: ['file-id-1']
          }
        });
        component.isShapeInProgress$.subscribe((response) => {
          expect(response).toEqual(false);
          done();
        });
      });

    });

    describe('containsDraftLayers$', () => {
      it('should return true if package contains draft layers', (done) => {
        component.updateState({
          ...(component as any)._state,
          dataTypes: [
            {
              type: 'Well',
              hasShapeUploaded: true
            },
            {
              type: 'Play',
              hasShapeUploaded: true
            },
            {
              type: 'Seismic3dSurvey',
              hasShapeUploaded: true
            }
          ]
        });
        component.containsDraftLayers$.subscribe((response) => {
          expect(response).toEqual(true);
          done();
        });
      });
    });

    describe('allShapesAssociated$', () => {

      it('should return true if all dataTypes have a shape uploaded', (done) => {
        component.updateState({
          ...(component as any)._state,
          dataTypes: [
            {
              type: 'Well',
              hasShapeUploaded: true
            }
          ]
        });
        component.allShapesAssociated$.subscribe((response) => {
          expect(response).toEqual(true);
          done();
        });
      });

      it('should return false if at least one dataTypes has no shape uploaded', (done) => {
        component.updateState({
          ...(component as any)._state,
          dataTypes: [
            {
              type: 'Well',
              hasShapeUploaded: false
            }
          ]
        });
        component.allShapesAssociated$.subscribe((response) => {
          expect(response).toEqual(false);
          done();
        });
      });

    });

    describe('isPackageDetailValid$', () => {

      it('should return false is package has no details yet', (done) => {
        component.updateState({
          ...(component as any)._state
        });
        component.isPackageDetailValid$.subscribe((response) => {
          expect(response).toEqual(false);
          done();
        });
      });

      it('should return true is package has details saved', (done) => {
        component.updateState({
          ...(component as any)._state,
          price: { duration: 10, onRequest: false, price: 2000 },
          profile: {
            featuresAndContents: { keypoints: ['keypoint 1']},
            overview: { description: 'test description', keypoints: ["keypoint1"]},
            regions: ["Global"],
            media: [{
              fileId: 'file_id',
              fileName: 'file_name',
              fileType: 'file_type',
              caption: 'caption'
            }],
            documents: [{
              fileId: 'file_id',
              fileName: 'file_name',
              fileType: 'file_type',
              caption: 'caption'
            }],
            opportunity: {
              opportunity: 'test'
            }
          }
        });
        component.isPackageDetailValid$.subscribe((response) => {
          expect(response).toEqual(true);
          done();
        });
      });

    });

    describe('onCancelUpload', () => {
      beforeEach(() => {
        component.updateState({
          ...(component as any)._state,
          files: {
            ...(component as any)._state.files,
            shapes: ['file-id-1', 'file-id-2'],
            deliverables: ['file-id-1', 'file-id-2']
          },
          dataTypes: [
            {
              type: 'Seismic',
              hasShapeUploaded: true
            },
            {
              type: 'Well',
              hasShapeUploaded: true
            }
          ]
        });
      });

      it('should call onCancelUpload and invoke callback', fakeAsync (() => {
        mockFileUploaderService.cancelUpload.mockReturnValueOnce(of({marketingRepresentationId: 'file-id-2'}));
        const deleteFileSpy = jest.spyOn(component, 'deleteFile').mockImplementation();
        component.onCancelUpload('file-id-2');
        tick();
        expect(deleteFileSpy).toHaveBeenCalled();
        expect(mockFileUploaderService.cancelUpload).toHaveBeenCalled();
      }));

      it('should delete marketing representation and update shapes and dataTypes state', () => {
        jest.spyOn((component as any), 'getShapeFiles').mockReturnValue(of([{associatedId: 'mr-id', group: 'Well'}]));
        jest.spyOn((component as any), 'setGisLayers').mockImplementation();
        mockDataPackagesService.deleteMarketingRepresentation.mockReturnValueOnce(of({marketingRepresentationId: 'mr-id'}));
        const updateShapesSpy = jest.spyOn(component, 'updateShapesState').mockImplementation();
        const updateDataTypeSpy = jest.spyOn(component, 'updateDataTypeState').mockImplementation();
        const file = {
          fileId: 'file-id',
          associatedId: 'mr-id',
          group: 'Seismic3dSurvey',
          type: FileType.Shape
        }
        component.deleteFile(file)();
        expect(updateShapesSpy).toHaveBeenCalled();
        expect(updateDataTypeSpy).toHaveBeenCalled();
      });

      it('should delete deliverables and update state of deliverables files', () => {
        jest.spyOn((component as any), 'getDeliverables').mockReturnValue(of([{id: 'file-id'}]));
        mockDataPackagesService.deleteAssociatedDeliverables.mockReturnValueOnce(of(null));
        const updateDeliverablesSpy = jest.spyOn(component, 'updateDeliverablesState').mockImplementation();
        const file = {
          fileId: 'file-id',
          associatedId: null,
          group: '',
          type: FileType.Deliverable
        }
        component.deleteFile(file)();
        expect(updateDeliverablesSpy).toHaveBeenCalled();
      });

      describe('updateDataTypeState', () => {
        it('Should delete dataType from state after deletion of shape files associated to that dataType', fakeAsync (()=> {
          const stateDataTypes = [
            {
              type: 'Well',
              hasShapeUploaded: true
            }
          ];
          jest.spyOn(component, 'getShapeFiles' as any).mockReturnValue('Seismic')
          component.updateDataTypeState('Seismic');
          expect((component as any)._state.dataTypes).toEqual(stateDataTypes);
        }));

        it('Should set hasShapeUploaded to false and update state of dataTypes if no shapes associated', fakeAsync (()=> {
          component.updateState({
            ...(component as any)._state,
            files: {
              ...(component as any)._state.files,
              shapes: ['file-id-1', 'file-id-2']
            },
            dataTypes: [
              {
                type: 'Seismic',
                hasShapeUploaded: false
              },
            ]
          })
          const stateDataTypes = [
            {
              type: 'Seismic',
              hasShapeUploaded: false
            }
          ];
          jest.spyOn(component, 'getShapeFiles' as any).mockReturnValue('Seismic');
          component.updateDataTypeState('Seismic');
          expect((component as any)._state.dataTypes).toEqual(stateDataTypes);
        }));
      });

      describe('update state of files after deletion', () => {
        it('Should update state of shapes after deletion', () => {
          jest.spyOn(component, 'getShapeFiles' as any).mockImplementation();
          component.updateShapesState('file-id-1');
          expect((component as any)._state.files.shapes).toEqual(['file-id-2'])
        });

        it('Should update state of deliverables after deletion', () => {
          jest.spyOn(component, 'getDeliverables' as any).mockImplementation();
          component.updateDeliverablesState('file-id-1');
          expect((component as any)._state.files.deliverables).toEqual(['file-id-2'])
        });
      });

      describe('load layers', () => {
        it('should replace table names', () => {
          component.billingAccountID = 'ABC';
          const config = { gisCanvas: { gisMap: { layersConfiguration: [{ tableInfo: { table: { name: 'test/config' } } }] } } };
          const metadata = [{ mapLargeTable: 'test/metadata' }];
          component.updateTableNames(config, metadata);
          expect(config.gisCanvas.gisMap.layersConfiguration[0].tableInfo.table.name).toEqual('ABC/config');
          expect(metadata[0].mapLargeTable).toEqual('ABC/metadata');
        });
      });

      describe('showNotificationMessage', () => {
        it('should send a notification on delete file', () => {
          component.showNotificationMessage('Success', 'Success', 'test message', 'toast');
          expect(mockNotificationService.send).toHaveBeenCalled();
        });
      });

      it('should onCloseDataTypeSection if no shapes associated', ()=> {
        component.updateState({
          ...(component as any)._state,
          files: {
            ...(component as any)._state.files,
            shapes: ['file-id-1']
          },
          dataTypes: [
            { type: 'Seismic', hasShapeUploaded: true },
            { type: '', hasShapeUploaded: false },
          ]
        })

        const event = {
          i: 1,
          dataTypes: [
            { type: 'Seismic', hasShapeUploaded: true },
            { type: '', hasShapeUploaded: false }
          ]
        };

        const stateDataTypes = [
          { type: 'Seismic', hasShapeUploaded: true }
        ];

        component.onCloseDataTypeSection(event);
        expect((component as any)._state.dataTypes).toEqual(stateDataTypes);
      });

      it('should onDataTypesChange', ()=> {
        component.updateState({
          ...(component as any)._state,
          files: {
            ...(component as any)._state.files,
            shapes: ['file-id-1', 'file-id-2']
          },
          dataTypes: [
            { type: 'Seismic', hasShapeUploaded: true },
            { type: 'Well', hasShapeUploaded: true },
          ]
        })

        const dataTypes = [
          { type: 'Seismic', hasShapeUploaded: true },
          { type: 'Well', hasShapeUploaded: true }
        ];

        component.onDataTypesChange(dataTypes);
        expect((component as any)._state.dataTypes).toEqual(dataTypes);
      });
    });
  });

  it('should unsubscribe observable on destroy', () => {
    component.ngOnDestroy();
    expect(component.subscription.closed).toBe(true);
  });

  afterAll(() => {
    component.updateState({
      ...(component as any)._state,
      initialState
    });
  })
});
