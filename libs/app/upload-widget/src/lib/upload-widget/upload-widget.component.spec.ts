import { CUSTOM_ELEMENTS_SCHEMA, SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationService } from '@apollo/app/ui/notification';
import { MetadataService } from '@apollo/app/metadata';
import { GeoJsonFileValidatorService, ShapeFileValidatorService } from '@apollo/app/shape-file-validator';

import { UploadWidgetComponent } from './upload-widget.component';
import { SlbDropzoneComponent } from '@slb-dls/angular-material/dropzone';
import { of } from 'rxjs';

const mockNotificationService = {
  send: jest.fn()
};

 const mockMetadataService = {
  marketingLayers$: of([{
    layerName: 'Seismic2D',
    shapeType: 'geo.line'
  }])
}

const mockShapeFileValidatorService = {
  initValidation: jest.fn().mockResolvedValue(true)
}

const mockGeoJsonFileValidatorService = {
  initValidation: jest.fn().mockResolvedValue(true)
}

describe('UploadWidgetComponent', () => {
  let component: UploadWidgetComponent;
  let fixture: ComponentFixture<UploadWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UploadWidgetComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [{
        provide: NotificationService,
        useValue: mockNotificationService
      },
      {
        provide: MetadataService,
        useValue: mockMetadataService
      },
      {
        provide: ShapeFileValidatorService,
        useValue: mockShapeFileValidatorService
      },
      {
        provide: GeoJsonFileValidatorService,
        useValue: mockGeoJsonFileValidatorService
      }
    ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.extensions = '.zip,.geojson';
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onFileSelected', () => {
    it('should emit the start upload action', async() => {
      component.maxFileSizes = { shp: 2048, zip: 5120, generic: 2048 };
      const mockFile = {
        name: 'shape.zip',
        size: 12500
      } as File;
      const mockFileList = {
        length: 1,
        item: () => {
          return mockFile;
        },
        0: mockFile
      } as FileList;
      const spy = jest.spyOn(component.startUpload, 'emit').mockImplementation();
      const spyNotification = jest.spyOn(mockNotificationService, 'send');

      await component.onFileSelected(mockFileList);
      expect(spyNotification).not.toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith(mockFile);
    });

    it('should emit the start upload action for zip file', async() => {
      component.maxFileSizes = { shp: 2048, zip: 5120, generic: 2048 };
      const mockFile = {
        name: 'shape.zip',
        size: 12500
      } as File;
      const mockFileList = {
        length: 1,
        item: () => {
          return mockFile;
        },
        0: mockFile
      } as FileList;
      const spy = jest.spyOn(component.startUpload, 'emit').mockImplementation();
      const spyNotification = jest.spyOn(mockNotificationService, 'send');

      await component.onFileSelected(mockFileList);
      expect(spyNotification).not.toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith(mockFile);
    });

    it('should emit the start upload action for geojson file', async() => {
      component.maxFileSizes = { shp: 2048, zip: 5120, generic: 2048 };
      const mockFile = {
        name: 'shape.geojson',
        size: 2048
      } as File;
      const mockFileList = {
        length: 1,
        item: () => {
          return mockFile;
        },
        0: mockFile
      } as FileList;
      const spy = jest.spyOn(component.startUpload, 'emit').mockImplementation();
      const spyNotification = jest.spyOn(mockNotificationService, 'send');

      await component.onFileSelected(mockFileList);
      expect(spyNotification).not.toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith(mockFile);
    });

    it('should pass extension validation with *', async() => {
      component.extensions = '*';
      component.maxFileSizes = { shp: 2048, zip: 5120, generic: 2048 };
      const mockFile = {
        name: 'shape.zip',
        size: 12500
      } as File;
      const mockFileList = {
        length: 1,
        item: () => {
          return mockFile;
        },
        0: mockFile
      } as FileList;
      const spy = jest.spyOn(component.startUpload, 'emit').mockImplementation();

      await component.onFileSelected(mockFileList);
      expect(spy).toHaveBeenCalledWith(mockFile);
    });

    it('should show error with wrong extension', () => {
      component.maxFileSizes = { shp: 2048, zip: 5120, generic: 2048 };
      const mockFile = {
        name: 'shape.jpg',
        size: 125000000
      } as File;
      const mockFileList = {
        length: 1,
        item: () => {
          return mockFile;
        },
        0: mockFile
      } as FileList;
      const spy = jest.spyOn(component.startUpload, 'emit').mockImplementation();

      component.onFileSelected(mockFileList);
      expect(spy).not.toHaveBeenCalled();
    });

    it('should show error with wrong filename', () => {
      component.maxFileSizes = { shp: 2048, zip: 5120, generic: 2048 };
      const mockFile = {
        name: 'shape_file_name_#$%+test.zip',
        size: 125000000
      } as File;
      const mockFileList = {
        length: 1,
        item: () => {
          return mockFile;
        },
        0: mockFile
      } as FileList;
      const spy = jest.spyOn(component.startUpload, 'emit').mockImplementation();

      component.onFileSelected(mockFileList);
      expect(spy).not.toHaveBeenCalled();
    });

    it('should show error with oversize when file is not shp or zip type', () => {
      component.maxFileSizes = { shp: 2048, zip: 5120, generic: 2048 };
      component.extensions = '.png';
      const mockFile = {
        name: 'image.png',
        size: 4250000000
      } as File;
      const mockFileList = {
        length: 1,
        item: () => {
          return mockFile;
        },
        0: mockFile
      } as FileList;
      const spy = jest.spyOn(component.startUpload, 'emit').mockImplementation();

      component.onFileSelected(mockFileList);
      expect(spy).not.toHaveBeenCalled();
    });

    it('should show error with oversize when file is shp type', () => {
      component.maxFileSizes = { shp: 2048, zip: 5120, generic: 2048 };
      component.extensions = '.shp';
      const mockFile = {
        name: 'image.shp',
        size: 4250000000
      } as File;
      const mockFileList = {
        length: 1,
        item: () => {
          return mockFile;
        },
        0: mockFile
      } as FileList;
      const spy = jest.spyOn(component.startUpload, 'emit').mockImplementation();

      component.onFileSelected(mockFileList);
      expect(spy).not.toHaveBeenCalled();
    });

    it('should show error with oversize when file is zip type', () => {
      component.maxFileSizes = { shp: 2048, zip: 5120, generic: 2048 };
      component.extensions = '.zip';
      const mockFile = {
        name: 'image.zip',
        size: 6250000000
      } as File;
      const mockFileList = {
        length: 1,
        item: () => {
          return mockFile;
        },
        0: mockFile
      } as FileList;
      const spy = jest.spyOn(component.startUpload, 'emit').mockImplementation();

      component.onFileSelected(mockFileList);
      expect(spy).not.toHaveBeenCalled();
    });

    it('should admit every size when generic is -1', async() => {
      component.maxFileSizes = { generic: -1 };
      component.extensions = '*';
      const mockFile = {
        name: 'image.zip',
        size: 6250000000
      } as File;
      const mockFileList = {
        length: 1,
        item: () => {
          return mockFile;
        },
        0: mockFile
      } as FileList;
      const spy = jest.spyOn(component.startUpload, 'emit').mockImplementation();

      await component.onFileSelected(mockFileList);
      expect(spy).toHaveBeenCalled();
    });

    it('should not emit the start upload action without files', () => {
      component.maxFileSizes = { shp: 2048, zip: 5120, generic: 2048 };
      const mockFileList = {
        length: 0
      } as FileList;
      const spy = jest.spyOn(component.startUpload, 'emit').mockImplementation();

      component.onFileSelected(mockFileList);
      expect(spy).not.toHaveBeenCalled();
    });

    it('should not emit the start upload action if shape file validation is required', async() => {
      component.selectedDataType = 'datatype_1';
      component.maxFileSizes = { shp: 2048, zip: 5120, generic: 2048 };
      component.extensions = '.zip';
      const mockFile = {
        name: 'wells.zip',
        size: 12500
      } as File;
      const mockFileList = {
        length: 1,
        item: () => {
          return mockFile;
        },
        0: mockFile
      } as FileList;
      const spy = jest.spyOn(component.startUpload, 'emit').mockImplementation();

      fixture.detectChanges();
      await component.onFileSelected(mockFileList);
      expect(spy).toHaveBeenCalled();
    });

  });

  describe('onDropzoneSelected', () => {
    it('should emit the start upload action', async () => {
      component.selectedDataType = "Opportunity";
      fixture.detectChanges();
      const fileList1 = [new File([new ArrayBuffer(1)], 'shape.zip')];
      const dropzoneComponent: SlbDropzoneComponent = new SlbDropzoneComponent();
      component.maxFileSizes = { shp: 2048, zip: 5120, generic: 2048 };
      const spy = jest.spyOn(component.startUpload, 'emit').mockImplementation();
      await component.onSlbDropZoneFileSelected(fileList1, dropzoneComponent);
      expect(spy).toHaveBeenCalled();
    });

    it('should emit the start upload action for a.geojson type', async () => {
      component.selectedDataType = "Opportunity";
      fixture.detectChanges();
      const fileList1 = [new File([new ArrayBuffer(1)], 'shape.geojson')];
      const dropzoneComponent: SlbDropzoneComponent = new SlbDropzoneComponent();
      component.maxFileSizes = { generic: 2048 };
      const spy = jest.spyOn(component.startUpload, 'emit').mockImplementation();
      await component.onSlbDropZoneFileSelected(fileList1, dropzoneComponent);
      expect(spy).toHaveBeenCalled();
    });

    it('should show error with oversize when file is not shp or zip type', () => {
      const fileList1 = [new File([new ArrayBuffer(1)], 'shape.png')];
      const dropzoneComponent: SlbDropzoneComponent = new SlbDropzoneComponent();
      component.maxFileSizes = { shp: 2048, zip: 5120, generic: 2048 };
      const spy = jest.spyOn(component.startUpload, 'emit').mockImplementation();

      component.onSlbDropZoneFileSelected(fileList1, dropzoneComponent);
      expect(spy).not.toHaveBeenCalled();
    });

  });

  describe('ngOnChanges', () => {
    describe('canUpload', () => {
      it('should enter if changes in canUpload and set fileInput different from canUpload', () => {
        component.canUpload = true;
        component.ngOnChanges({ canUpload: {} as SimpleChange });
        expect(component.fileInput.nativeElement.value).not.toEqual(component.canUpload);
      });
    });
  });

});
