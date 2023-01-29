import { IDataPackagePrice, IDataPackageProfile } from '@apollo/app/services/data-packages';

export interface IPackageState {
  editing: boolean;
  id: string;
  name: string;
  profile: IDataPackageProfile;
  price: IDataPackagePrice;
  files: {
    shapes: Array<string>;
    deliverables: Array<string>;
  };
  dataTypes: Array<IDataType>;
}

export interface IDataType {
  type: string;
  hasShapeUploaded: boolean;
}

export const initialState: IPackageState = {
  editing: false,
  id: null,
  name: null,
  profile: {
    regions: [],
    overview: {
      description: '',
      keypoints: ['']
    },
    featuresAndContents: {
      keypoints: ['']
    },
    media: [],
    documents: [],
    opportunity: {
      opportunity: ''
    }
  },
  price: {
    onRequest: false,
    price: 0,
    duration: 0
  },
  files: {
    shapes: [],
    deliverables: []
  },
  dataTypes: [
    {
      type: '',
      hasShapeUploaded: false
    }
  ]
};
