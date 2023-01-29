import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatMenuModule } from '@angular/material/menu';
import { MediaDownloadService } from '@apollo/app/services/media-download';
import { IVendorProfile } from '@apollo/app/vendor';
import { mockLogoMediaDownloadService } from '../../../shared/services.mock';
import { RequestsComponent } from './request-card.component';

describe('RequestsComponent', () => {
  let component: RequestsComponent;
  let fixture: ComponentFixture<RequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RequestsComponent],
      imports: [MatMenuModule, HttpClientTestingModule],
      providers: [
        {
          provide: MediaDownloadService,
          useValue: mockLogoMediaDownloadService
        }
      ],
      schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return the logo media signed url on success ', (done) => {
    const vendorProfile: IVendorProfile = {
      name: 'Test',
      logo: {
        name: 'test-logo',
        relativePath: '',
        signedUrl: '',
        description: ''
      },
      companyLogo: {
        url: 'http://file-url/${fileId}/download'
      },
      companyUrl: {
        url: '',
        title: ''
      },
      dataPackageProfileId: ''
    };
    const downloadURL = 'http://file-url/${fileId}/download';
    component.downloadLogoSrc(vendorProfile);
    mockLogoMediaDownloadService.downloadLogoImageSrc(downloadURL).subscribe((signedURL) => {
      expect(signedURL);
      done();
    });
  });
});
