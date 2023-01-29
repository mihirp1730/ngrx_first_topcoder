import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VendorAppService } from '@apollo/app/vendor';
import { of } from 'rxjs';

import { PackageService } from '../../../package/services/package.service';
import { mockPackageService, mockVendorAppService } from '../../../shared/services.mock';
import { ItemHeaderComponent } from './item-header.component';

describe('ItemHeaderComponent', () => {
  let component: ItemHeaderComponent;
  let fixture: ComponentFixture<ItemHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ItemHeaderComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        {
          provide: PackageService,
          useValue: mockPackageService
        },
        {
          provide: VendorAppService,
          useValue: mockVendorAppService
        }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemHeaderComponent);
    component = fixture.componentInstance;
    component.result = { properties: [{ name: 'dataPackageId', value: 'DP-test' }] };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get data package and vendor details', () => {
    mockPackageService.getPackage.mockReturnValue(
      of({
        dataPackageProfile: {
          profile: {
            media: [
              {
                fileid: 'file-id-1'
              }
            ]
          }
        },
        vendorId: 'vendorId'
      })
    );
    const mockVendor = {
      dataVendorId: 'vendorId',
      name: 'vendor name'
    };
    mockVendorAppService.retrieveDataVendors.mockReturnValue(of([mockVendor]));
    const change: any = {
      result: {
        currentValue: { properties: [{ name: 'DataPackageId', value: 'DP-test2' }] }
      }
    };
    component.ngOnChanges(change);
    expect(component.dataVendor).toEqual(mockVendor);
  });
});
