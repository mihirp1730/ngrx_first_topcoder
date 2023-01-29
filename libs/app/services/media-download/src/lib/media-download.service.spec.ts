import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DELFI_USER_CONTEXT } from '@apollo/app/delfi-gui-auth-config';
import {
  IS_BILLING_ACCOUNT_ID_REQUIRED,
  MediaDownloadService,
  MEDIA_FILE_DOWNLOAD_API_URL,
  MULTIPLE_MEDIA_FILE_DOWNLOAD_API_URL
} from './media-download.service';

import { TestBed } from '@angular/core/testing';
import { SecureEnvironmentService } from '@apollo/app/secure-environment';
import { IVendorProfile, VendorAppService } from '@apollo/app/vendor';

describe('MediaDownloadService', () => {
  let service: MediaDownloadService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: VendorAppService,
          useValue: {
            userContext: { crmAccountId: 'test-account-id' }
          }
        },
        {
          provide: DELFI_USER_CONTEXT,
          useValue: {
            crmAccountId: 'test-account-id'
          }
        },
        {
          provide: SecureEnvironmentService,
          useValue: {
            secureEnvironment: {
              app: {
                key: 'app-key'
              }
            }
          }
        },
        {
          provide: MEDIA_FILE_DOWNLOAD_API_URL,
          useValue: 'http://file-url'
        },
        {
          provide: MULTIPLE_MEDIA_FILE_DOWNLOAD_API_URL,
          useValue: 'http://multiple-file-url'
        },
        {
          provide: IS_BILLING_ACCOUNT_ID_REQUIRED,
          useValue: false
        }
      ]
    });
    service = TestBed.inject(MediaDownloadService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return the logo media download source', (done) => {
    const vendorProfile: IVendorProfile = {
      name: 'Test',
      logo: {
        name: 'test-logo',
        relativePath: '',
        signedUrl: '',
        description: ''
      },
      companyLogo: {
        url: 'http://file-url/file-id/download'
      },
      companyUrl: {
        url: '',
        title: ''
      },
      dataPackageProfileId: ''
    };
    const signedURL = 'http://signed-url';
    const downloadURL = 'http://file-url/file-id/download';
    service.downloadLogoImageSrc(vendorProfile).subscribe((response) => {
      expect(response).toEqual(signedURL);
      done();
    });

    httpMock.expectOne(downloadURL).flush({ signedURL });
  });

  describe('Get downloadMedia URL', () => {
    it('should return the media download url on success', (done) => {
      const fileId = 'file-id';
      const signedURL = 'http://signed-url';
      service.downloadMedia(fileId).subscribe((response) => {
        expect(response).toEqual(signedURL);
        done();
      });

      httpMock.expectOne(`http://file-url/${fileId}/download`).flush({ signedURL });
    });

    it('should return the media download url on success with billing account ', (done) => {
      const fileId = 'file-id';
      const signedURL = 'http://signed-url';
      (service['isBilingAccountIdRequired'] as any) = true;
      service.downloadMedia(fileId).subscribe((response) => {
        expect(response).toEqual(signedURL);
        done();
      });

      httpMock.expectOne(`http://file-url/${fileId}/download`).flush({ signedURL });
    });

    it('should return the media download url on success with billing account ', (done) => {
      const fileId = ['file-id'];
      (service['isBilingAccountIdRequired'] as any) = true;
      service.downloadMultipleMedia(fileId).subscribe((response) => {
        expect(response).toEqual([
          {
            fileId: 'fileId1',
            signedUrl: 'signedUrl1'
          },
          {
            fileId: 'fileId2',
            signedUrl: 'signedUrl2'
          }
        ]);
        done();
      });

      httpMock.expectOne(`http://multiple-file-url`).flush([
        {
          fileId: 'fileId1',
          signedUrl: 'signedUrl1'
        },
        {
          fileId: 'fileId2',
          signedUrl: 'signedUrl2'
        }
      ]);
    });
    it('should return the null when multiple download API fails', (done) => {
      const fileId = ['file-id'];
      (service['isBilingAccountIdRequired'] as any) = true;
      service.downloadMultipleMedia(fileId).subscribe((response) => {
        expect(response).toEqual(null);
        done();
      });

      httpMock.expectOne(`http://multiple-file-url`).flush({}, { status: 400, statusText: 'Error' });
    });
    it('should return empty array on error', (done) => {
      const fileId = 'file-id';
      const mockSignedUrl = null;
      service.downloadMedia('file-id').subscribe((response) => {
        expect(response).toEqual(mockSignedUrl);
        done();
      });

      httpMock.expectOne(`http://file-url/${fileId}/download`).flush({}, { status: 400, statusText: 'Error' });
    });
  });
});
