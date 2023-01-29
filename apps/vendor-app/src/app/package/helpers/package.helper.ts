import { AbstractControl, ValidatorFn } from '@angular/forms';
import { IDataItem, IDataPackage, IGetDataPackageResponse, IMarketingRepresentation, ISavePackageProfileRequest } from '@apollo/app/services/data-packages';

export function transformPackage(
  dataPackage: IGetDataPackageResponse,
  marketingRepresentations: Array<IMarketingRepresentation>,
  deliverables: Array<IDataItem>
): IDataPackage {
  if (!dataPackage) {
    return null;
  }

  const { price } = dataPackage.dataPackageProfile;
  const { media, documents, overview, featuresAndContents, regions, opportunity } = dataPackage.dataPackageProfile.profile;

  return {
    id: dataPackage.dataPackageId,
    name: dataPackage.name,
    status: dataPackage.dataPackageStatus,
    profile: {
      regions: regions,
      overview: {
        description: overview?.overView || '',
        keypoints: overview?.keyPoints || ['']
      },
      featuresAndContents: {
        keypoints: featuresAndContents?.keyPoints || ['']
      },
      media: media,
      documents,
      opportunity
    },
    price: {
      onRequest: price ? price.onRequest : true,
      price: price?.price || 0,
      duration: price?.durationTerm || 0
    },
    marketingRepresentations,
    deliverables
  };
}

export function transformPackagePayload({ profile, price }: ISavePackageProfileRequest): any {
  return {
    profile: {
      regions: [...profile.regions],
      overview: {
        description: profile.overview.overView,
        keypoints: profile.overview.keyPoints
      },
      featuresAndContents: {
        keypoints: profile.featuresAndContents.keyPoints
      },
      media: profile.media,
      documents: profile.documents,
      opportunity: profile.opportunity
    },
    price: {
      onRequest: price.onRequest,
      price: price.price,
      duration: price.durationTerm
    }
  };
}

export function minValidator(min: number): ValidatorFn {
  return (control: AbstractControl): { min: boolean } | null => {
    if (control.value !== null && (isNaN(control.value) || control.value < min)) {
      return { min: true };
    }
    return null;
  };
}
