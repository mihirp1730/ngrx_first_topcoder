import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';
import { PackageStatuses } from '@apollo/api/data-packages/vendor';
import { MediaDownloadService } from '@apollo/app/services/media-download';
import { of } from 'rxjs';

import { mockMediaDownloadService, mockRouter } from '../../shared/services.mock';
import { VendorDashboardCardComponent } from './vendor-dashboard-card.component';

describe('VendorDashboardCardComponent', () => {
  let component: VendorDashboardCardComponent;
  let fixture: ComponentFixture<VendorDashboardCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VendorDashboardCardComponent ],
      imports: [ MatMenuModule ],
      schemas: [ NO_ERRORS_SCHEMA ],
      providers: [
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
          provide: Router,
          useValue: mockRouter
        },
        {
          provide: MediaDownloadService,
          useValue: mockMediaDownloadService
        }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VendorDashboardCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.packageDetails = <any>{
      id: '123',
      name: 'pkg 1',
      status: PackageStatuses.Draft
    }
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should ngonchange', () => {
    let change: any = { packageDetails: { currentValue: {} } };
    component.packageDetails = {
      image: {
        fileId: 'file_id',
        fileName: 'file_name',
        fileType: 'jpeg',
        caption: '',
        profileImage: true
      }
    } as any;
    component.ngOnChanges(change);
    expect(component.mediaUrl).toBe('signed-url');

    fixture.detectChanges();
    component.packageDetails = {
      image: { }
    } as any;
    component.ngOnChanges(change);
    expect(component.showLoadingMsg).toBeFalsy();

    fixture.detectChanges();
    change = null;
    component.packageDetails = {
      image: { }
    } as any;
    component.ngOnChanges(change);
    expect(component.showLoadingMsg).toBeFalsy();
  });

  it('should delete draft package', () => {
    const deletePackageSpy = jest.spyOn(component.deletePackage, 'emit');
    component.deleteDraft();
    expect(deletePackageSpy).toHaveBeenCalled();
  });

  it('should unpublish Package', () => {
    const unpulishPackageSpy = jest.spyOn(component.unpublishPackageEvent, 'emit');
    component.unpublishPackage();
    expect(unpulishPackageSpy).toHaveBeenCalled();
  });

  it('should navigate to package edit', () => {
    component.packageDetails.id = 'testId'
    component.editPackage();
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('vendor/package/edit/testId');
  });
});
