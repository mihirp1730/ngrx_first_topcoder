import { NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule, FormGroup, FormControl } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { SlbDropdownModule } from '@slb-dls/angular-material/dropdown';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { of, throwError } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MetadataService } from '@apollo/app/metadata';
import { DataPackagesService } from '@apollo/app/services/data-packages';
import { NotificationService } from '@apollo/app/ui/notification';

import { PackageEditorComponent } from './package-editor.component';
import { mockDataPackagesService, mockNotificationService, mockMetadataService, mockVendorAppService } from '../../shared/services.mock';
import { VendorAppService } from '@apollo/app/vendor';

describe('PackageEditorComponent', () => {
  let component: PackageEditorComponent;
  let fixture: ComponentFixture<PackageEditorComponent>;
  let vendorAppService: VendorAppService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PackageEditorComponent],
      imports: [FormsModule, ReactiveFormsModule, MatRadioModule, SlbDropdownModule, NoopAnimationsModule, MatSelectModule, MatInputModule],
      providers: [
        {
          provide: DataPackagesService,
          useValue: mockDataPackagesService
        },
        {
          provide: NotificationService,
          useValue: mockNotificationService
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
        },
        {
          provide: VendorAppService,
          useValue: mockVendorAppService
        },
      ],
      schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PackageEditorComponent);
    component = fixture.componentInstance;
    component.packageId = 'D-XIN-1-WG-5572726251061248';
    component.packageName = 'USA Well Data';

    component.packageDetailForm = new FormGroup({
      packagePricing: new FormControl(true),
      priceUsd: new FormControl(''),
      subscriptionDuration: new FormControl(''),
      regions: new FormControl(''),
      featureKeypoint: new FormControl(''),
      overviewKeypoint: new FormControl(''),
      packageOverview: new FormControl(''),
      supportDocuments:  new FormControl(''),
      supportMedia:  new FormControl(''),
      opportunity: new FormControl('')
    });
    component.discarded = false;
    vendorAppService = TestBed.inject(VendorAppService);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call goBack and throw notification', fakeAsync(() => {
    const spy = jest.spyOn(component.backTo, 'emit').mockImplementation();
    const spyNotification = jest.spyOn(component, 'createNotificationModal');
    component.goBack();
    tick();
    expect(spy).toHaveBeenCalled();
    expect(spyNotification).toHaveBeenCalled();
  }));
  it('should set discarded value to true and throw notification', () => {
    const spyNotification = jest.spyOn(component, 'createNotificationModal');
    expect(component.discarded).toBe(false);
    component.discard();
    expect(component.discarded).toBe(true);
    expect(spyNotification).toHaveBeenCalled();
  });

  describe('addKeypoint', () => {
    it('should add a keypoint to the overview control', () => {
      component.addKeypoint('overview');
      expect(component.overviewKeypoints.length).toEqual(2);
    });

    it('should not add a keypoint to the overview control', () => {
      const spyPush = jest.spyOn(component.overviewKeypoints, 'push');
      component.addKeypoint('overview');
      component.addKeypoint('overview');
      component.addKeypoint('overview');
      component.addKeypoint('overview');
      component.addKeypoint('overview');
      component.addKeypoint('overview');
      expect(component.overviewKeypoints.length).toEqual(5);
      expect(spyPush).toBeCalledTimes(4);
    });

    it('should add a keypoint to the feature control', () => {
      component.addKeypoint('feature');
      expect(component.featureKeypoints.length).toEqual(2);
    });

    it('should not add a keypoint to the feature control', () => {
      const spyPush = jest.spyOn(component.featureKeypoints, 'push');
      component.addKeypoint('feature');
      component.addKeypoint('feature');
      component.addKeypoint('feature');
      component.addKeypoint('feature');
      component.addKeypoint('feature');
      component.addKeypoint('feature');
      expect(component.featureKeypoints.length).toEqual(5);
      expect(spyPush).toBeCalledTimes(4);
    });
  });

  describe('removeKeypoint', () => {
    it('should remove a keypoint from overview control', () => {
      component.addKeypoint('overview');
      component.addKeypoint('overview');
      component.removeKeypoint('overview', 1);
      expect(component.overviewKeypoints.length).toEqual(2);
    });

    it('should remove a keypoint from feature control', () => {
      component.addKeypoint('feature');
      component.addKeypoint('feature');
      component.removeKeypoint('feature', 1);
      expect(component.featureKeypoints.length).toEqual(2);
    });
  });

  describe('saveAsDraft', () => {
    beforeEach(() => {
      component.packageDetailForm.setValue({
        onRequest: false,
        subscriptionDuration: 12,
        regions: ['Europe'],
        packageOverview: 'Test overview',
        priceUsd: 1200,
        featureKeypoints: ['Point'],
        overviewKeypoints: ['Point'],
        supportDocuments: [],
        supportMedia: [],
        opportunity: {
          opportunity: 'test'
        }
      });
      component.packageName = 'Test package Name';
      component.packageId = 'test-id';
    });

    it('should save the package as draft', () => {
      mockDataPackagesService.savePackageProfile.mockReturnValueOnce(
        of({
          dataPackageProfileId: 'test-id'
        })
      );
      component.saveAsDraft();

      expect(mockDataPackagesService.savePackageProfile).toHaveBeenCalled();
      expect(component.showLoader).toBe(false);
    });

    it('should not save the package as draft on service error', () => {
      mockDataPackagesService.savePackageProfile.mockReturnValue(throwError('Error test'));
      component.saveAsDraft();

      expect(mockDataPackagesService.savePackageProfile).toHaveBeenCalled();
      expect(mockNotificationService.send).toHaveBeenCalled();
      expect(component.showLoader).toBe(false);
    });
  });

  describe('keyFilter', () => {
    it('should return true if passed  any values except -,+,e,E', () => {
      const value = component.keyFilter({ keyCode: 45 });
      expect(value).toBe(true);
    });

    it('should return false if passed following values  -,+,e,E', () => {
      const value = component.keyFilter({ keyCode: 69 });
      expect(value).toBe(false);
    });
  });

  it('should set the initial values to the form', () => {
    component.packageDetail = {
      profile: {
        overview: {
          keypoints: ['Keypoint 1', 'Keypoint 2', 'Keypoint 3'],
          description: 'Test Overview'
        },
        regions: ['Global', 'North America'],
        featuresAndContents: {
          keypoints: ['Feature 1', 'Feature 2']
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
        onRequest: false,
        duration: undefined,
        price: undefined
      }
    };
    component.initForm();
    expect(component.packageDetailForm.value).toEqual({
      onRequest: false,
      priceUsd: '',
      subscriptionDuration: '',
      regions: ['Global', 'North America'],
      packageOverview: 'Test Overview',
      overviewKeypoints: ['Keypoint 1', 'Keypoint 2', 'Keypoint 3'],
      featureKeypoints: ['Feature 1', 'Feature 2'],
      supportDocuments: '',
      supportMedia: '',
      opportunity: 'test'
    });
  });

  it('should values to the form when onRequest true', () => {
    component.isPackagePublished = false;
    component.packageDetail = {
      profile: {
        overview: {
          keypoints: ['Keypoint 1', 'Keypoint 2', 'Keypoint 3'],
          description: 'Test Overview'
        },
        regions: ['Global', 'North America'],
        featuresAndContents: {
          keypoints: ['Feature 1', 'Feature 2']
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
        duration: undefined,
        price: undefined
      }
    };
    component.initForm();
    expect(component.packageDetailForm.value).toEqual({
      onRequest: true,
      regions: ['Global', 'North America'],
      packageOverview: 'Test Overview',
      overviewKeypoints: ['Keypoint 1', 'Keypoint 2', 'Keypoint 3'],
      featureKeypoints: ['Feature 1', 'Feature 2'],
      supportDocuments: '',
      supportMedia: '',
      opportunity: 'test'
    })
    expect(component.packageDetailForm.disabled).toBeFalsy();
});

it('should disable the form if package is published', () => {
  component.isPackagePublished = true;
  component.packageDetail = {
    profile: {
      overview: {
        keypoints: ['Keypoint 1', 'Keypoint 2', 'Keypoint 3'],
        description: 'Test Overview'
      },
      regions: ['Global', 'North America'],
      featuresAndContents: {
        keypoints: ['Feature 1', 'Feature 2']
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
      duration: undefined,
      price: undefined
    }
  };
  component.initForm();
  expect(component.packageDetailForm.controls['priceUsd'].disabled).toBeTruthy();
  expect(component.packageDetailForm.controls['subscriptionDuration'].disabled).toBeTruthy();
  expect(component.packageDetailForm.controls['regions'].disabled).toBeTruthy();
  expect(component.packageDetailForm.controls['packageOverview'].disabled).toBeTruthy();
  expect(component.packageDetailForm.controls['overviewKeypoints'].disabled).toBeTruthy();
  expect(component.packageDetailForm.controls['featureKeypoints'].disabled).toBeTruthy();
  expect(component.packageDetailForm.controls['supportDocuments'].disabled).toBeTruthy();
  expect(component.packageDetailForm.controls['supportMedia'].disabled).toBeTruthy();
  expect(component.packageDetailForm.controls['onRequest'].disabled).toBeTruthy();
  expect(component.packageDetailForm.controls['onRequest'].disabled).toBeTruthy();
  expect(component.packageDetailForm.controls['opportunity'].disabled).toBeTruthy();

});

  it('should retrieve vendor details', () => {
    const vendorAppServiceSpy = mockVendorAppService.retrieveDataVendors.mockReturnValue(of());
    component.getDataVendor();
    expect(vendorAppServiceSpy).toHaveBeenCalled();
  });
});
