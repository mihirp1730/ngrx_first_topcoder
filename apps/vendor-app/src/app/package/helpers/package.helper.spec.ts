import { AbstractControl } from '@angular/forms';
import { IGetDataPackageResponse } from '@apollo/app/services/data-packages';

import { minValidator, transformPackage } from './package.helper';

describe('packageHelper', () => {
  it('should transform the information into package structure', () => {
    const mockDataPackage = {
      dataPackageId: 'id',
      name: 'name',
      dataPackageStatus: 'status',
      dataPackageProfile: {
        profile: {
          overview: {
            overView: 'overview',
            keyPoints: ['1']
          },
          featuresAndContents: {
            keyPoints: ['A']
          },
          regions: [],
          opportunity: {
            opportunity: 'test'
          }
        },
        price: {
          onRequest: true,
          price: null,
          durationTerm: null
        }
      }
    } as IGetDataPackageResponse;
    const mockMarketingRepresentations = [];
    const mockDeliverables = [];

    const result = transformPackage(mockDataPackage, mockMarketingRepresentations, mockDeliverables);

    expect(result).toEqual({
      id: mockDataPackage.dataPackageId,
      name: mockDataPackage.name,
      status: mockDataPackage.dataPackageStatus,
      profile: {
        regions: mockDataPackage.dataPackageProfile.profile.regions,
        overview: {
          description: mockDataPackage.dataPackageProfile.profile.overview.overView,
          keypoints: mockDataPackage.dataPackageProfile.profile.overview.keyPoints
        },
        featuresAndContents: {
          keypoints: mockDataPackage.dataPackageProfile.profile.featuresAndContents.keyPoints
        },
        opportunity: {
          opportunity: mockDataPackage.dataPackageProfile.profile.opportunity.opportunity
        }
      },
      price: {
        onRequest: mockDataPackage.dataPackageProfile.price.onRequest,
        price: 0,
        duration: 0
      },
      marketingRepresentations: mockMarketingRepresentations,
      deliverables: mockDeliverables
    });
  });

  it('should return null when no dataPackage info', () => {
    expect(transformPackage(null, [], [])).toEqual(null);
  });
});

describe('minValidator', () => {
  it('should pass validation', () => {
    const control = { value: '5' };
    const result = minValidator(1)(control as AbstractControl);
    expect(result).toBe(null);
  });

  it('should not pass validation', () => {
    const control = { value: '5' };
    const result = minValidator(10)(control as AbstractControl);
    expect(result).toEqual({ min: true });
  });
});
