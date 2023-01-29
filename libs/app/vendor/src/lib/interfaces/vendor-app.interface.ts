export interface IRetrieveVendorDataResponse {
  items: Array<IVendorProfile>;
}

export interface IVendorProfile {
  name: string;
  companyLogo?: {
    url: string;
  };
  billingAccountId?: string;
  logo: {
    name: string;
    relativePath: string;
    signedUrl: string;
    description: string;
  };
  companyUrl: {
    url: string;
    title: string;
  };
  profiles?: Array<{
    name: string;
    description: string;
    images: Array<{
      fileName: string;
      relativePath: string;
      signedUrl: string;
    }>;
  }>;
  dataPackageProfileId: string;
}

export interface IRetrieveDataVendorsResponse {
  dataVendors: Array<IDataVendor>;
}

export interface IDataVendor {
  name: string;
  dataVendorId: string;
}

export interface IVendorContactDetails {
  emailId: string;
  displayName: string;
}
