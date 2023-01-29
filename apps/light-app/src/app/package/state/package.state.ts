import { DataPackage } from '@apollo/api/data-packages/consumer';
import { IGetDataPackageResponse } from '@apollo/app/services/data-packages';

export interface State {
  selectedProfileId: string | null;
  selectedPackage: DataPackage | null;
  selectedPackageDownloading: boolean;
  selectedPackageProfile: IGetDataPackageResponse | null;
  selectedPackageRequesting: boolean | null;
}

export const initialState: State = {
  selectedProfileId: null,
  selectedPackage: null,
  selectedPackageDownloading: false,
  selectedPackageProfile: null,
  selectedPackageRequesting: null
};
